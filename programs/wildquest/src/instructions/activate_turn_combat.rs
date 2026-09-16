use anchor_lang::prelude::*;

use crate::{
    constants::{BALANCE_VERSION, GAME_CONFIG_SEED, RULES_VERSION},
    state::GameConfig,
};

#[derive(Accounts)]
pub struct ActivateTurnCombatAccountConstraints<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        has_one = admin
    )]
    pub game_config: Account<'info, GameConfig>,
}

pub fn handle_activate_turn_combat(
    context: Context<ActivateTurnCombatAccountConstraints>,
) -> Result<()> {
    context.accounts.game_config.rules_version = RULES_VERSION;
    context.accounts.game_config.balance_version = BALANCE_VERSION;
    Ok(())
}
