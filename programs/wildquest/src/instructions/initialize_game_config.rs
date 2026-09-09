use anchor_lang::prelude::*;

use crate::{
    constants::{BALANCE_VERSION, GAME_CONFIG_SEED, MATCH_STAKE_LAMPORTS, RULES_VERSION},
    state::GameConfig,
};

#[derive(Accounts)]
pub struct InitializeGameConfigAccountConstraints<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = GameConfig::DISCRIMINATOR.len() + GameConfig::INIT_SPACE,
        seeds = [GAME_CONFIG_SEED],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_game_config(
    context: Context<InitializeGameConfigAccountConstraints>,
    capture_authority: Pubkey,
) -> Result<()> {
    let game_config = &mut context.accounts.game_config;
    game_config.admin = context.accounts.admin.key();
    game_config.capture_authority = capture_authority;
    game_config.balance_version = BALANCE_VERSION;
    game_config.rules_version = RULES_VERSION;
    game_config.stake_lamports = MATCH_STAKE_LAMPORTS;
    game_config.bump = context.bumps.game_config;
    Ok(())
}
