use anchor_lang::prelude::*;

use crate::{
    constants::{GAME_CONFIG_SEED, MATCH_RESOLVER_CONFIG_SEED},
    error::ErrorCode,
    state::{GameConfig, MatchResolverConfig},
};

#[derive(Accounts)]
pub struct InitializeMatchResolverConfigAccountConstraints<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        constraint = game_config.admin == admin.key() @ ErrorCode::GameAdminMismatch
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = admin,
        space = MatchResolverConfig::DISCRIMINATOR.len() + MatchResolverConfig::INIT_SPACE,
        seeds = [MATCH_RESOLVER_CONFIG_SEED],
        bump
    )]
    pub match_resolver_config: Account<'info, MatchResolverConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_match_resolver_config(
    context: Context<InitializeMatchResolverConfigAccountConstraints>,
    resolver: Pubkey,
) -> Result<()> {
    require!(
        resolver != Pubkey::default(),
        ErrorCode::InvalidMatchResolver
    );
    let config = &mut context.accounts.match_resolver_config;
    config.resolver = resolver;
    config.bump = context.bumps.match_resolver_config;
    Ok(())
}
