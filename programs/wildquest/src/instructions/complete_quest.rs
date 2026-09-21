use anchor_lang::prelude::*;

use crate::{
    constants::{
        quest_definition, CREATURE_SEED, MATCH_SEED, PLAYER_SEED, QUEST_COMPLETION_SEED,
        QUEST_OBJECTIVE_BATTLE_PARTICIPATION, QUEST_OBJECTIVE_CAPTURE_ANY,
        QUEST_OBJECTIVE_CAPTURE_COUNT, QUEST_SEED,
    },
    error::ErrorCode,
    progression::calculate_quest_progression,
    state::{Creature, Match, MatchStatus, Player, Quest, QuestCompletion},
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
    let definition = quest_definition(quest_id).ok_or(ErrorCode::UnsupportedQuest)?;
    require!(
        quest.species_count == definition.required_count
            && quest.targets == definition.targets
            && quest.reward_xp == definition.reward_xp,
        ErrorCode::InvalidQuestDefinition
    );

    let payer = context.accounts.payer.key();
    let evidence_start = if quest_id > 1 {
        let prerequisite = context
            .remaining_accounts
            .first()
            .ok_or(ErrorCode::QuestPrerequisiteIncomplete)?;
        validate_prerequisite(prerequisite, &payer, quest_id - 1)?;
        1
    } else {
        0
    };
    let evidence = &context.remaining_accounts[evidence_start..];

    match definition.objective {
        QUEST_OBJECTIVE_CAPTURE_COUNT => {
            validate_capture_count(evidence, &payer, definition.required_count)?
        }
        QUEST_OBJECTIVE_CAPTURE_ANY => {
            validate_capture_any(evidence, &payer, definition.required_count, &quest.targets)?
        }
        QUEST_OBJECTIVE_BATTLE_PARTICIPATION => validate_battle_participation(evidence, &payer)?,
        _ => return err!(ErrorCode::InvalidQuestDefinition),
    }

    let player = &mut context.accounts.player;
    let (next_xp, next_level) = calculate_quest_progression(player.xp, quest.reward_xp)?;
    player.xp = next_xp;
    player.level = next_level;

    let quest_completion = &mut context.accounts.quest_completion;
    quest_completion.quest = quest.key();
    quest_completion.player = payer;
    quest_completion.completed_at = Clock::get()?.unix_timestamp;
    quest_completion.reward_xp = quest.reward_xp;
    quest_completion.bump = context.bumps.quest_completion;

    msg!("Quest {} completed by wallet {}", quest_id, payer);
    Ok(())
}

fn validate_prerequisite(
    account_info: &AccountInfo<'_>,
    payer: &Pubkey,
    prerequisite_quest_id: u64,
) -> Result<()> {
    require_keys_eq!(
        *account_info.owner,
        crate::ID,
        ErrorCode::QuestPrerequisiteIncomplete
    );
    let prerequisite_quest = Pubkey::find_program_address(
        &[QUEST_SEED, prerequisite_quest_id.to_le_bytes().as_ref()],
        &crate::ID,
    )
    .0;
    let expected_completion = Pubkey::find_program_address(
        &[
            QUEST_COMPLETION_SEED,
            prerequisite_quest.as_ref(),
            payer.as_ref(),
        ],
        &crate::ID,
    )
    .0;
    require_keys_eq!(
        account_info.key(),
        expected_completion,
        ErrorCode::QuestPrerequisiteIncomplete
    );
    let completion = deserialize_account::<QuestCompletion>(
        account_info,
        ErrorCode::QuestPrerequisiteIncomplete,
    )?;
    require!(
        completion.quest == prerequisite_quest && completion.player == *payer,
        ErrorCode::QuestPrerequisiteIncomplete
    );
    Ok(())
}

fn validate_capture_count(
    evidence: &[AccountInfo<'_>],
    payer: &Pubkey,
    required_count: u8,
) -> Result<()> {
    require_eq!(
        evidence.len(),
        usize::from(required_count),
        ErrorCode::InvalidQuestEvidenceCount
    );
    let creatures = evidence
        .iter()
        .map(|account_info| validate_creature(account_info, payer))
        .collect::<Result<Vec<_>>>()?;
    let unique_catalogue_ids = creatures.iter().enumerate().all(|(index, creature)| {
        !creatures[..index]
            .iter()
            .any(|earlier| earlier.catalogue_id == creature.catalogue_id)
    });
    require!(unique_catalogue_ids, ErrorCode::QuestObjectiveIncomplete);
    Ok(())
}

fn validate_capture_any(
    evidence: &[AccountInfo<'_>],
    payer: &Pubkey,
    required_count: u8,
    targets: &[u64],
) -> Result<()> {
    require_eq!(
        evidence.len(),
        usize::from(required_count),
        ErrorCode::InvalidQuestEvidenceCount
    );
    require!(!targets.is_empty(), ErrorCode::InvalidQuestDefinition);
    for account_info in evidence {
        let creature = validate_creature(account_info, payer)?;
        require!(
            targets.contains(&creature.catalogue_id),
            ErrorCode::QuestObjectiveIncomplete
        );
    }
    Ok(())
}

fn validate_creature(account_info: &AccountInfo<'_>, payer: &Pubkey) -> Result<Creature> {
    require_keys_eq!(
        *account_info.owner,
        crate::ID,
        ErrorCode::InvalidQuestEvidence
    );
    let creature = deserialize_account::<Creature>(account_info, ErrorCode::InvalidQuestEvidence)?;
    require_keys_eq!(
        creature.owner,
        *payer,
        ErrorCode::QuestCreatureOwnerMismatch
    );
    let expected = Pubkey::find_program_address(
        &[
            CREATURE_SEED,
            payer.as_ref(),
            creature.catalogue_id.to_le_bytes().as_ref(),
        ],
        &crate::ID,
    )
    .0;
    require_keys_eq!(
        account_info.key(),
        expected,
        ErrorCode::InvalidQuestEvidence
    );
    Ok(creature)
}

fn validate_battle_participation(evidence: &[AccountInfo<'_>], payer: &Pubkey) -> Result<()> {
    require_eq!(evidence.len(), 1, ErrorCode::InvalidQuestEvidenceCount);
    let account_info = &evidence[0];
    require_keys_eq!(
        *account_info.owner,
        crate::ID,
        ErrorCode::InvalidQuestEvidence
    );
    let match_account =
        deserialize_account::<Match>(account_info, ErrorCode::InvalidQuestEvidence)?;
    let opponent = match_account
        .opponent
        .ok_or(ErrorCode::QuestObjectiveIncomplete)?;
    require!(
        match_account.creator == *payer || opponent == *payer,
        ErrorCode::QuestObjectiveIncomplete
    );
    require!(
        matches!(
            match_account.status,
            MatchStatus::Active
                | MatchStatus::Claimable
                | MatchStatus::Settled
                | MatchStatus::Refunded
        ),
        ErrorCode::QuestObjectiveIncomplete
    );
    let expected = Pubkey::find_program_address(
        &[
            MATCH_SEED,
            match_account.creator.as_ref(),
            match_account.match_id.to_le_bytes().as_ref(),
        ],
        &crate::ID,
    )
    .0;
    require_keys_eq!(
        account_info.key(),
        expected,
        ErrorCode::InvalidQuestEvidence
    );
    Ok(())
}

fn deserialize_account<T: AccountDeserialize>(
    account_info: &AccountInfo<'_>,
    error_code: ErrorCode,
) -> Result<T> {
    let data = account_info
        .try_borrow_data()
        .map_err(|_| error!(error_code))?;
    let mut data_slice: &[u8] = &data;
    T::try_deserialize(&mut data_slice).map_err(|_| error!(error_code))
}
