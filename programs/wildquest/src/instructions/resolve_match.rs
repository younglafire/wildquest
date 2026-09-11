use anchor_lang::prelude::*;

use crate::{
    constants::{GAME_CONFIG_SEED, MATCH_SEED, MAX_MATCH_TURNS},
    error::ErrorCode,
    state::{GameConfig, Match, MatchStatus},
};

#[derive(Accounts)]
pub struct ResolveMatchAccountConstraints<'info> {
    pub resolver: Signer<'info>,

    #[account(seeds = [GAME_CONFIG_SEED], bump = game_config.bump)]
    pub game_config: Account<'info, GameConfig>,

    #[account(mut, address = match_account.creator)]
    pub creator: SystemAccount<'info>,

    #[account(mut)]
    pub opponent: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [MATCH_SEED, match_account.creator.as_ref(), match_account.match_id.to_le_bytes().as_ref()],
        bump = match_account.bump
    )]
    pub match_account: Account<'info, Match>,
}

pub fn handle_resolve_match(
    context: Context<ResolveMatchAccountConstraints>,
    winner: Option<Pubkey>,
    turn_count: u16,
    result_hash: [u8; 32],
) -> Result<()> {
    require_keys_eq!(
        context.accounts.resolver.key(),
        context.accounts.game_config.capture_authority,
        ErrorCode::MatchResolverMismatch
    );
    let match_account = &context.accounts.match_account;
    require!(
        match_account.status == MatchStatus::Active,
        ErrorCode::MatchNotActive
    );
    let opponent = match_account.opponent.ok_or(ErrorCode::MatchNotActive)?;
    require_keys_eq!(
        context.accounts.opponent.key(),
        opponent,
        ErrorCode::MatchParticipantMismatch
    );
    require!(
        (1..=MAX_MATCH_TURNS).contains(&turn_count),
        ErrorCode::InvalidMatchTurnCount
    );
    require!(
        result_hash.iter().any(|value| *value != 0),
        ErrorCode::InvalidMatchResultHash
    );
    if let Some(winner) = winner {
        require!(
            winner == match_account.creator || winner == opponent,
            ErrorCode::InvalidMatchWinner
        );
    }
    let clock = Clock::get()?;
    let active_expires_at = match_account
        .active_expires_at
        .ok_or(ErrorCode::MatchNotActive)?;
    require!(
        clock.unix_timestamp <= active_expires_at,
        ErrorCode::MatchResolutionExpired
    );

    let stake = match_account.stake_lamports;
    let match_account = &mut context.accounts.match_account;
    match_account.winner = winner;
    match_account.result_hash = result_hash;
    match_account.turn_count = turn_count;
    match_account.settled_at = Some(clock.unix_timestamp);
    if winner.is_some() {
        match_account.status = MatchStatus::Claimable;
    } else {
        let total = stake.checked_mul(2).ok_or(ErrorCode::MatchEscrowOverflow)?;
        match_account.status = MatchStatus::Settled;
        match_account.sub_lamports(total)?;
        context.accounts.creator.add_lamports(stake)?;
        context.accounts.opponent.add_lamports(stake)?;
    }
    Ok(())
}
