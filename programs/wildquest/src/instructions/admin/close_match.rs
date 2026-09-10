use anchor_lang::prelude::*;

use crate::{
    constants::{GAME_CONFIG_SEED, MATCH_SEED},
    error::ErrorCode,
    state::{GameConfig, Match, MatchStatus},
};

#[derive(Accounts)]
pub struct AdminCloseMatchAccountConstraints<'info> {
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        constraint = game_config.admin == admin.key() @ ErrorCode::GameAdminMismatch
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        close = creator,
        seeds = [
            MATCH_SEED,
            match_account.creator.as_ref(),
            match_account.match_id.to_le_bytes().as_ref()
        ],
        bump = match_account.bump
    )]
    pub match_account: Account<'info, Match>,

    #[account(mut, address = match_account.creator)]
    pub creator: SystemAccount<'info>,

    /// CHECK: A claimable Match validates this address against its recorded winner.
    #[account(mut)]
    pub payout_recipient: UncheckedAccount<'info>,
}

pub fn handle_admin_close_match(context: Context<AdminCloseMatchAccountConstraints>) -> Result<()> {
    let match_account = &mut context.accounts.match_account;
    if match_account.status == MatchStatus::Claimable {
        let winner = match_account.winner.ok_or(ErrorCode::MatchWinnerMismatch)?;
        require_keys_eq!(
            context.accounts.payout_recipient.key(),
            winner,
            ErrorCode::MatchWinnerMismatch
        );
        let payout = match_account
            .stake_lamports
            .checked_mul(2)
            .ok_or(ErrorCode::MatchEscrowOverflow)?;
        match_account.status = MatchStatus::Settled;
        match_account.sub_lamports(payout)?;
        context.accounts.payout_recipient.add_lamports(payout)?;
    }
    Ok(())
}
