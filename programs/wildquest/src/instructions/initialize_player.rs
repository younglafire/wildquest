use anchor_lang::prelude::*;

use crate::{constants::PLAYER_SEED, state::Player};

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Player::INIT_SPACE,
        seeds = [PLAYER_SEED, payer.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    player.wallet = ctx.accounts.payer.key();
    player.xp = 0;
    player.level = 1;
    player.discovery_count = 0;
    player.badge_count = 0;

    msg!("Player initialized for wallet {}", ctx.accounts.payer.key());
    Ok(())
}
