use anchor_lang::{prelude::*, system_program};

use crate::{
    constants::{CREATURE_SEED, GAME_CONFIG_SEED, MATCH_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig, Match, MatchStatus},
};

#[derive(Accounts)]
#[instruction(match_id: u64)]
pub struct OpenMatchAccountConstraints<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(seeds = [GAME_CONFIG_SEED], bump = game_config.bump)]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = creator,
        space = Match::DISCRIMINATOR.len() + Match::INIT_SPACE,
        seeds = [MATCH_SEED, creator.key().as_ref(), match_id.to_le_bytes().as_ref()],
        bump
    )]
    pub match_account: Account<'info, Match>,

    #[account(
        seeds = [CREATURE_SEED, creator.key().as_ref(), creator_creature_1.catalogue_id.to_le_bytes().as_ref()],
        bump = creator_creature_1.bump
    )]
    pub creator_creature_1: Account<'info, Creature>,
    #[account(
        seeds = [CREATURE_SEED, creator.key().as_ref(), creator_creature_2.catalogue_id.to_le_bytes().as_ref()],
        bump = creator_creature_2.bump
    )]
    pub creator_creature_2: Account<'info, Creature>,
    #[account(
        seeds = [CREATURE_SEED, creator.key().as_ref(), creator_creature_3.catalogue_id.to_le_bytes().as_ref()],
        bump = creator_creature_3.bump
    )]
    pub creator_creature_3: Account<'info, Creature>,

    pub system_program: Program<'info, System>,
}

pub fn handle_open_match(
    context: Context<OpenMatchAccountConstraints>,
    match_id: u64,
) -> Result<()> {
    let creator = context.accounts.creator.key();
    let creatures = [
        &context.accounts.creator_creature_1,
        &context.accounts.creator_creature_2,
        &context.accounts.creator_creature_3,
    ];
    validate_owned_team(
        &creatures,
        &creator,
        context.accounts.game_config.balance_version,
    )?;

    system_program::transfer(
        CpiContext::new(
            system_program::ID,
            system_program::Transfer {
                from: context.accounts.creator.to_account_info(),
                to: context.accounts.match_account.to_account_info(),
            },
        ),
        context.accounts.game_config.stake_lamports,
    )?;

    let match_account = &mut context.accounts.match_account;
    match_account.match_id = match_id;
    match_account.creator = creator;
    match_account.opponent = None;
    match_account.creator_creatures = creatures.map(|creature| creature.key());
    match_account.opponent_creatures = [Pubkey::default(); 3];
    match_account.stake_lamports = context.accounts.game_config.stake_lamports;
    match_account.balance_version = context.accounts.game_config.balance_version;
    match_account.rules_version = context.accounts.game_config.rules_version;
    match_account.status = MatchStatus::Open;
    match_account.winner = None;
    match_account.created_at = Clock::get()?.unix_timestamp;
    match_account.settled_at = None;
    match_account.bump = context.bumps.match_account;
    Ok(())
}

pub(crate) fn validate_owned_team(
    creatures: &[&Account<Creature>; 3],
    owner: &Pubkey,
    balance_version: u16,
) -> Result<()> {
    let keys = creatures.map(|creature| creature.key());
    require!(
        keys[0] != keys[1] && keys[0] != keys[2] && keys[1] != keys[2],
        ErrorCode::InvalidBattleTeam
    );
    for creature in creatures {
        require_keys_eq!(creature.owner, *owner, ErrorCode::CreatureOwnerMismatch);
        require_eq!(
            creature.balance_version,
            balance_version,
            ErrorCode::CreatureBalanceVersionMismatch
        );
    }
    Ok(())
}
