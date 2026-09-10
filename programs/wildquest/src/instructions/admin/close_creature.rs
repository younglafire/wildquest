use anchor_lang::prelude::*;

use crate::{
    constants::{CREATURE_SEED, GAME_CONFIG_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig},
};

#[derive(Accounts)]
pub struct AdminCloseCreatureAccountConstraints<'info> {
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        constraint = game_config.admin == admin.key() @ ErrorCode::GameAdminMismatch
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        close = owner,
        seeds = [
            CREATURE_SEED,
            creature.owner.as_ref(),
            creature.catalogue_id.to_le_bytes().as_ref()
        ],
        bump = creature.bump
    )]
    pub creature: Account<'info, Creature>,

    #[account(mut, address = creature.owner)]
    pub owner: SystemAccount<'info>,
}

pub fn handle_admin_close_creature(
    _context: Context<AdminCloseCreatureAccountConstraints>,
) -> Result<()> {
    Ok(())
}
