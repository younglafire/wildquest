use anchor_lang::prelude::*;

use crate::{
    constants::MATCH_SEED,
    error::ErrorCode,
    state::{Match, MatchStatus},
};

#[derive(Accounts)]
pub struct ClaimMatchPayoutAccountConstraints<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,

    #[account(
        mut,
        seeds = [MATCH_SEED, match_account.creator.as_ref(), match_account.match_id.to_le_bytes().as_ref()],
        bump = match_account.bump
    )]
    pub match_account: Account<'info, Match>,
}

pub fn handle_claim_match_payout(
    context: Context<ClaimMatchPayoutAccountConstraints>,
) -> Result<()> {
    let match_account = &mut context.accounts.match_account;
    require!(
        match_account.status == MatchStatus::Claimable,
        ErrorCode::MatchNotClaimable
    );
    require!(
        match_account.winner == Some(context.accounts.winner.key()),
        ErrorCode::MatchWinnerMismatch
    );

    let payout = match_account
        .stake_lamports
        .checked_mul(2)
        .ok_or(ErrorCode::MatchEscrowOverflow)?;

    match_account.status = MatchStatus::Settled;
    match_account.sub_lamports(payout)?;
    context.accounts.winner.add_lamports(payout)?;
    Ok(())
}
