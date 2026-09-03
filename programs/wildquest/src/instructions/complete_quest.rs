use anchor_lang::prelude::*;

use crate::{
    constants::{PLAYER_SEED, QUEST_COMPLETION_SEED, QUEST_SEED},
    error::ErrorCode,
    progression::calculate_quest_progression,
    state::{Discovery, Player, Quest, QuestCompletion},
};

#[derive(Accounts)]
#[instruction(quest_id: u64)]
pub struct CompleteQuestAccountConstraints<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, payer.key().as_ref()],
        bump,
        constraint = player.wallet == payer.key() @ ErrorCode::PlayerWalletMismatch
    )]
    pub player: Account<'info, Player>,

    #[account(
        seeds = [QUEST_SEED, quest_id.to_le_bytes().as_ref()],
        bump = quest.bump,
        constraint = quest.quest_id == quest_id @ ErrorCode::QuestIdMismatch
    )]
    pub quest: Account<'info, Quest>,

    #[account(
        init,
        payer = payer,
        space = QuestCompletion::DISCRIMINATOR.len() + QuestCompletion::INIT_SPACE,
        seeds = [QUEST_COMPLETION_SEED, quest.key().as_ref(), payer.key().as_ref()],
        bump
    )]
    pub quest_completion: Account<'info, QuestCompletion>,

    pub system_program: Program<'info, System>,
}

pub fn handle_complete_quest(
    context: Context<CompleteQuestAccountConstraints>,
    quest_id: u64,
) -> Result<()> {
    let quest = &context.accounts.quest;
    let expected_count = usize::from(quest.species_count);
    require!(expected_count > 0, ErrorCode::InvalidQuestDefinition);
    require_eq!(
        quest.targets.len(),
        expected_count,
        ErrorCode::InvalidQuestDefinition
    );
    let targets_are_unique = quest
        .targets
        .iter()
        .enumerate()
        .all(|(index, target)| !quest.targets[..index].contains(target));
    require!(targets_are_unique, ErrorCode::InvalidQuestDefinition);
    require!(quest.reward_xp > 0, ErrorCode::InvalidQuestDefinition);
    require_eq!(
        context.remaining_accounts.len(),
        expected_count,
        ErrorCode::InvalidQuestDiscoveryCount
    );

    let payer = context.accounts.payer.key();
    let discoveries = context
        .remaining_accounts
        .iter()
        .map(|account_info| deserialize_discovery(account_info, &payer))
        .collect::<Result<Vec<_>>>()?;

    let has_every_target = quest.targets.iter().all(|target| {
        discoveries
            .iter()
            .any(|discovery| discovery.species_id == *target)
    });
    require!(has_every_target, ErrorCode::QuestTargetsIncomplete);

    let player = &mut context.accounts.player;
    let (next_xp, next_level, next_badge_count) =
        calculate_quest_progression(player.xp, player.badge_count, quest.reward_xp)?;
    player.xp = next_xp;
    player.level = next_level;
    player.badge_count = next_badge_count;

    let quest_completion = &mut context.accounts.quest_completion;
    quest_completion.quest = quest.key();
    quest_completion.player = payer;
    quest_completion.completed_at = Clock::get()?.unix_timestamp;
    quest_completion.reward_xp = quest.reward_xp;
    quest_completion.bump = context.bumps.quest_completion;

    msg!("Quest {} completed by wallet {}", quest_id, payer);
    Ok(())
}

fn deserialize_discovery(account_info: &AccountInfo<'_>, payer: &Pubkey) -> Result<Discovery> {
    require_keys_eq!(
        *account_info.owner,
        crate::ID,
        ErrorCode::InvalidQuestDiscovery
    );
    let data = account_info
        .try_borrow_data()
        .map_err(|_| error!(ErrorCode::InvalidQuestDiscovery))?;
    let mut data_slice: &[u8] = &data;
    let discovery = Discovery::try_deserialize(&mut data_slice)
        .map_err(|_| error!(ErrorCode::InvalidQuestDiscovery))?;
    require_keys_eq!(
        discovery.player,
        *payer,
        ErrorCode::QuestDiscoveryPlayerMismatch
    );
    Ok(discovery)
}
