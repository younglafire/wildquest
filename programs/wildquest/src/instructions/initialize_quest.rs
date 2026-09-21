use anchor_lang::prelude::*;

use crate::{
    constants::{quest_definition, QUEST_SEED},
    error::ErrorCode,
    state::Quest,
};

#[derive(Accounts)]
#[instruction(quest_id: u64)]
pub struct InitializeQuestAccountConstraints<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
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
    let definition = quest_definition(quest_id).ok_or(ErrorCode::UnsupportedQuest)?;
    require!(
        definition.required_count > 0,
        ErrorCode::InvalidQuestDefinition
    );
    require!(definition.reward_xp > 0, ErrorCode::InvalidQuestDefinition);

    let quest = &mut context.accounts.quest;
    quest.quest_id = quest_id;
    quest.species_count = definition.required_count;
    quest.targets = definition.targets.to_vec();
    quest.reward_xp = definition.reward_xp;
    quest.bump = context.bumps.quest;

    msg!("Quest {} initialized", quest_id);
    Ok(())
}
