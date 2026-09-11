use anchor_lang::prelude::*;

use crate::{
    constants::MATCH_SEED,
    error::ErrorCode,
    state::{Match, MatchStatus},
};

#[derive(Accounts)]
pub struct RefundStaleMatchAccountConstraints<'info> {
    pub participant: Signer<'info>,

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

pub fn handle_refund_stale_match(
    context: Context<RefundStaleMatchAccountConstraints>,
) -> Result<()> {
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
    let participant = context.accounts.participant.key();
    require!(
        participant == match_account.creator || participant == opponent,
        ErrorCode::MatchParticipantMismatch
    );
    let active_expires_at = match_account
        .active_expires_at
        .ok_or(ErrorCode::MatchNotActive)?;
    require!(
        Clock::get()?.unix_timestamp > active_expires_at,
        ErrorCode::MatchRefundUnavailable
    );

    let stake = match_account.stake_lamports;
    let total = stake.checked_mul(2).ok_or(ErrorCode::MatchEscrowOverflow)?;
    let match_account = &mut context.accounts.match_account;
    match_account.status = MatchStatus::Refunded;
    match_account.settled_at = Some(Clock::get()?.unix_timestamp);
    match_account.sub_lamports(total)?;
    context.accounts.creator.add_lamports(stake)?;
    context.accounts.opponent.add_lamports(stake)?;
    Ok(())
}
