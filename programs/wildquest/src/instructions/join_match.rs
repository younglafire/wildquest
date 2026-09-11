use anchor_lang::{prelude::*, system_program};

use crate::{
    constants::{CREATURE_SEED, GAME_CONFIG_SEED, MATCH_ACTIVE_TIMEOUT_SECONDS, MATCH_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig, Match, MatchStatus},
};

const CREATOR_CREATURES_START: usize = 0;
const OPPONENT_CREATURES_START: usize = 3;
const SYSTEM_PROGRAM_INDEX: usize = 6;
const JOIN_REMAINING_ACCOUNT_COUNT: usize = 7;

#[derive(Accounts)]
pub struct JoinMatchAccountConstraints<'info> {
    #[account(mut)]
    pub opponent: Signer<'info>,

    #[account(address = match_account.creator)]
    pub creator: SystemAccount<'info>,

    #[account(seeds = [GAME_CONFIG_SEED], bump = game_config.bump)]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [MATCH_SEED, match_account.creator.as_ref(), match_account.match_id.to_le_bytes().as_ref()],
        bump = match_account.bump
    )]
    pub match_account: Account<'info, Match>,
}

struct LoadedCreature {
    key: Pubkey,
}

pub fn handle_join_match(context: Context<JoinMatchAccountConstraints>) -> Result<()> {
    let opponent = context.accounts.opponent.key();
    let creator = context.accounts.creator.key();
    let match_account = &context.accounts.match_account;
    require!(
        match_account.status == MatchStatus::Open,
        ErrorCode::MatchNotOpen
    );
    require_keys_neq!(creator, opponent, ErrorCode::MatchSelfJoin);
    require!(
        match_account.stake_lamports == context.accounts.game_config.stake_lamports
            && match_account.balance_version == context.accounts.game_config.balance_version
            && match_account.rules_version == context.accounts.game_config.rules_version,
        ErrorCode::MatchConfigMismatch
    );
    require_eq!(
        context.remaining_accounts.len(),
        JOIN_REMAINING_ACCOUNT_COUNT,
        ErrorCode::InvalidBattleTeam
    );
    require_keys_eq!(
        context.remaining_accounts[SYSTEM_PROGRAM_INDEX].key(),
        system_program::ID,
        ErrorCode::InvalidBattleTeam
    );

    let creator_creatures = load_team(
        &context.remaining_accounts[CREATOR_CREATURES_START..OPPONENT_CREATURES_START],
        &creator,
        match_account.balance_version,
    )?;
    let opponent_creatures = load_team(
        &context.remaining_accounts[OPPONENT_CREATURES_START..SYSTEM_PROGRAM_INDEX],
        &opponent,
        match_account.balance_version,
    )?;
    let creator_keys = creator_creatures.each_ref().map(|creature| creature.key);
    let opponent_keys = opponent_creatures.each_ref().map(|creature| creature.key);
    require!(
        creator_keys == match_account.creator_creatures,
        ErrorCode::MatchCreatorTeamMismatch
    );

    system_program::transfer(
        CpiContext::new(
            system_program::ID,
            system_program::Transfer {
                from: context.accounts.opponent.to_account_info(),
                to: context.accounts.match_account.to_account_info(),
            },
        ),
        match_account.stake_lamports,
    )?;

    let active_expires_at = Clock::get()?
        .unix_timestamp
        .checked_add(MATCH_ACTIVE_TIMEOUT_SECONDS)
        .ok_or(ErrorCode::MatchEscrowOverflow)?;
    let match_account = &mut context.accounts.match_account;
    match_account.opponent = Some(opponent);
    match_account.opponent_creatures = opponent_keys;
    match_account.status = MatchStatus::Active;
    match_account.active_expires_at = Some(active_expires_at);
    Ok(())
}

fn load_team(
    infos: &[AccountInfo],
    owner: &Pubkey,
    balance_version: u16,
) -> Result<[LoadedCreature; 3]> {
    let mut loaded = Vec::with_capacity(3);
    for info in infos {
        require_keys_eq!(*info.owner, crate::id(), ErrorCode::CreatureOwnerMismatch);
        let data = info.try_borrow_data()?;
        let mut data_slice: &[u8] = &data;
        let creature = Creature::try_deserialize(&mut data_slice)?;
        require_keys_eq!(creature.owner, *owner, ErrorCode::CreatureOwnerMismatch);
        require_eq!(
            creature.balance_version,
            balance_version,
            ErrorCode::CreatureBalanceVersionMismatch
        );
        let expected = Pubkey::find_program_address(
            &[
                CREATURE_SEED,
                owner.as_ref(),
                creature.catalogue_id.to_le_bytes().as_ref(),
            ],
            &crate::id(),
        )
        .0;
        require_keys_eq!(info.key(), expected, ErrorCode::CreatureOwnerMismatch);
        loaded.push(LoadedCreature { key: info.key() });
    }
    let loaded: [LoadedCreature; 3] = loaded
        .try_into()
        .map_err(|_| error!(ErrorCode::InvalidBattleTeam))?;
    let keys = loaded.each_ref().map(|creature| creature.key);
    require!(
        keys[0] != keys[1] && keys[0] != keys[2] && keys[1] != keys[2],
        ErrorCode::InvalidBattleTeam
    );
    Ok(loaded)
}
