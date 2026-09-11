use anchor_lang::{prelude::*, system_program};

use crate::{
    battle::{resolve_battle, BattleOutcome, BattleStats},
    constants::{CREATURE_SEED, GAME_CONFIG_SEED, MATCH_SEED, SPECIES_CONFIG_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig, Match, MatchStatus, SpeciesConfig},
};

const CREATOR_CREATURES_START: usize = 0;
const OPPONENT_CREATURES_START: usize = 3;
const CREATOR_SPECIES_START: usize = 6;
const OPPONENT_SPECIES_START: usize = 9;
const SYSTEM_PROGRAM_INDEX: usize = 12;
const JOIN_REMAINING_ACCOUNT_COUNT: usize = 13;

#[derive(Accounts)]
pub struct JoinMatchAccountConstraints<'info> {
    #[account(mut)]
    pub opponent: Signer<'info>,
    #[account(mut, address = match_account.creator)]
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
    state: Creature,
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
        &context.remaining_accounts[OPPONENT_CREATURES_START..CREATOR_SPECIES_START],
        &opponent,
        match_account.balance_version,
    )?;
    let creator_keys = creator_creatures.each_ref().map(|creature| creature.key);
    let opponent_keys = opponent_creatures.each_ref().map(|creature| creature.key);
    require!(
        creator_keys == match_account.creator_creatures,
        ErrorCode::MatchCreatorTeamMismatch
    );

    let creator_stats = load_stats(
        &creator_creatures,
        &context.remaining_accounts[CREATOR_SPECIES_START..OPPONENT_SPECIES_START],
        match_account.balance_version,
    )?;
    let opponent_stats = load_stats(
        &opponent_creatures,
        &context.remaining_accounts[OPPONENT_SPECIES_START..SYSTEM_PROGRAM_INDEX],
        match_account.balance_version,
    )?;
    let outcome = resolve_battle(creator_stats, opponent_stats)?;

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

    let stake = match_account.stake_lamports;
    let match_account = &mut context.accounts.match_account;
    match_account.opponent = Some(opponent);
    match_account.opponent_creatures = opponent_keys;
    match_account.winner = match outcome {
        BattleOutcome::Creator => Some(creator),
        BattleOutcome::Opponent => Some(opponent),
        BattleOutcome::Tie => None,
    };
    match_account.settled_at = Some(Clock::get()?.unix_timestamp);

    if outcome == BattleOutcome::Tie {
        let total = stake.checked_mul(2).ok_or(ErrorCode::MatchEscrowOverflow)?;
        match_account.status = MatchStatus::Settled;
        match_account.sub_lamports(total)?;
        context.accounts.creator.add_lamports(stake)?;
        context.accounts.opponent.add_lamports(stake)?;
    } else {
        match_account.status = MatchStatus::Claimable;
    }
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
        loaded.push(LoadedCreature {
            key: info.key(),
            state: creature,
        });
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

fn load_stats(
    creatures: &[LoadedCreature; 3],
    config_infos: &[AccountInfo],
    balance_version: u16,
) -> Result<[BattleStats; 3]> {
    let mut stats = [BattleStats {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        shield: 0,
    }; 3];
    for (index, (creature, config_info)) in creatures.iter().zip(config_infos.iter()).enumerate() {
        require_keys_eq!(
            *config_info.owner,
            crate::id(),
            ErrorCode::SpeciesConfigMismatch
        );
        let data = config_info.try_borrow_data()?;
        let mut data_slice: &[u8] = &data;
        let config = SpeciesConfig::try_deserialize(&mut data_slice)?;
        require!(
            config.catalogue_id == creature.state.catalogue_id
                && config.balance_version == balance_version,
            ErrorCode::SpeciesConfigMismatch
        );
        require!(config.active, ErrorCode::InactiveSpeciesConfig);
        let expected = Pubkey::find_program_address(
            &[
                SPECIES_CONFIG_SEED,
                config.catalogue_id.to_le_bytes().as_ref(),
                config.balance_version.to_le_bytes().as_ref(),
            ],
            &crate::id(),
        )
        .0;
        require_keys_eq!(
            config_info.key(),
            expected,
            ErrorCode::SpeciesConfigMismatch
        );
        stats[index] = BattleStats::from(&config);
    }
    Ok(stats)
}
