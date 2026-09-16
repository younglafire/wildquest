use anchor_lang::prelude::*;

use crate::{
    constants::{BALANCE_VERSION, CREATURE_SEED, GAME_CONFIG_SEED, SPECIES_CONFIG_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig, SpeciesConfig},
};

#[derive(Accounts)]
pub struct UpgradeCreatureBalanceAccountConstraints<'info> {
    pub owner: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump,
        constraint = game_config.balance_version == BALANCE_VERSION
            @ ErrorCode::GameBalanceVersionMismatch
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [
            SPECIES_CONFIG_SEED,
            creature.catalogue_id.to_le_bytes().as_ref(),
            BALANCE_VERSION.to_le_bytes().as_ref()
        ],
        bump = species_config.bump,
        constraint = species_config.catalogue_id == creature.catalogue_id
            && species_config.balance_version == BALANCE_VERSION
            @ ErrorCode::SpeciesConfigMismatch,
        constraint = species_config.active @ ErrorCode::InactiveSpeciesConfig
    )]
    pub species_config: Account<'info, SpeciesConfig>,

    #[account(
        mut,
        seeds = [
            CREATURE_SEED,
            owner.key().as_ref(),
            creature.catalogue_id.to_le_bytes().as_ref()
        ],
        bump = creature.bump,
        has_one = owner
    )]
    pub creature: Account<'info, Creature>,
}

pub fn handle_upgrade_creature_balance(
    context: Context<UpgradeCreatureBalanceAccountConstraints>,
) -> Result<()> {
    context.accounts.creature.balance_version = BALANCE_VERSION;
    Ok(())
}
