use anchor_lang::prelude::*;

use crate::{
    constants::{DEMO_QUEST_ID, DEMO_QUEST_REWARD_XP, DEMO_QUEST_TARGETS, QUEST_SEED},
    error::ErrorCode,
    state::Quest,
};

#[derive(Accounts)]
#[instruction(quest_id: u64)]
pub struct InitializeQuestAccountConstraints<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = Quest::DISCRIMINATOR.len() + Quest::INIT_SPACE,
        seeds = [QUEST_SEED, quest_id.to_le_bytes().as_ref()],
        bump
    )]
    pub quest: Account<'info, Quest>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_quest(
    context: Context<InitializeQuestAccountConstraints>,
    quest_id: u64,
) -> Result<()> {
    require_eq!(quest_id, DEMO_QUEST_ID, ErrorCode::UnsupportedQuest);

    let species_count = u8::try_from(DEMO_QUEST_TARGETS.len())
        .map_err(|_| error!(ErrorCode::InvalidQuestDefinition))?;
    require!(species_count > 0, ErrorCode::InvalidQuestDefinition);
    require!(DEMO_QUEST_REWARD_XP > 0, ErrorCode::InvalidQuestDefinition);

    let quest = &mut context.accounts.quest;
    quest.quest_id = quest_id;
    quest.species_count = species_count;
    quest.targets = DEMO_QUEST_TARGETS.to_vec();
    quest.reward_xp = DEMO_QUEST_REWARD_XP;
    quest.bump = context.bumps.quest;

    msg!("Quest {} initialized", quest_id);
    Ok(())
}
