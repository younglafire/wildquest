use anchor_lang::prelude::*;

use crate::{
    constants::MATCH_SEED,
    error::ErrorCode,
    state::{Match, MatchStatus},
};

#[derive(Accounts)]
pub struct CancelMatchAccountConstraints<'info> {
    #[account(mut, address = match_account.creator)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [MATCH_SEED, match_account.creator.as_ref(), match_account.match_id.to_le_bytes().as_ref()],
        bump = match_account.bump
    )]
    pub match_account: Account<'info, Match>,
}

pub fn handle_cancel_match(context: Context<CancelMatchAccountConstraints>) -> Result<()> {
    require!(
        context.accounts.match_account.status == MatchStatus::Open,
        ErrorCode::MatchNotOpen
    );
    let stake = context.accounts.match_account.stake_lamports;
    context.accounts.match_account.sub_lamports(stake)?;
    context.accounts.creator.add_lamports(stake)?;
    context.accounts.match_account.status = MatchStatus::Cancelled;
    Ok(())
}
