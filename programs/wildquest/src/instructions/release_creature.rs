use anchor_lang::prelude::*;

use crate::{constants::CREATURE_SEED, state::Creature};

#[derive(Accounts)]
pub struct ReleaseCreatureAccountConstraints<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [
            CREATURE_SEED,
            owner.key().as_ref(),
            creature.catalogue_id.to_le_bytes().as_ref()
        ],
        bump = creature.bump,
        has_one = owner
    )]
    pub creature: Account<'info, Creature>,
}

pub fn handle_release_creature(_context: Context<ReleaseCreatureAccountConstraints>) -> Result<()> {
    Ok(())
}
