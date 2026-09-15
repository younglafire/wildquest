use anchor_lang::prelude::*;

use crate::{
    constants::{
        BALANCE_VERSION, BATTLE_CATALOGUE_IDS, BATTLE_MODEL_CLASS_IDS, BATTLE_STATS,
        GAME_CONFIG_SEED, SPECIES_CONFIG_SEED,
    },
    error::ErrorCode,
    state::{GameConfig, SpeciesConfig},
};

#[derive(Accounts)]
#[instruction(catalogue_id: u64)]
pub struct InitializeSpeciesConfigAccountConstraints<'info> {
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
        space = SpeciesConfig::DISCRIMINATOR.len() + SpeciesConfig::INIT_SPACE,
        seeds = [
            SPECIES_CONFIG_SEED,
            catalogue_id.to_le_bytes().as_ref(),
            BALANCE_VERSION.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub species_config: Account<'info, SpeciesConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_species_config(
    context: Context<InitializeSpeciesConfigAccountConstraints>,
    catalogue_id: u64,
) -> Result<()> {
    let index = BATTLE_CATALOGUE_IDS
        .iter()
        .position(|candidate| *candidate == catalogue_id)
        .ok_or_else(|| error!(ErrorCode::UnsupportedBattleSpecies))?;
    let [hp, attack, defense, max_mana, strike_cost, guard_cost, recharge_gain, ability_id, ability_cost] =
        BATTLE_STATS[index];

    let species_config = &mut context.accounts.species_config;
    species_config.catalogue_id = catalogue_id;
    species_config.model_class_id = BATTLE_MODEL_CLASS_IDS[index];
    species_config.hp = hp;
    species_config.attack = attack;
    species_config.defense = defense;
    species_config.max_mana = max_mana;
    species_config.strike_cost = strike_cost;
    species_config.guard_cost = guard_cost;
    species_config.recharge_gain = recharge_gain;
    species_config.ability_id = ability_id;
    species_config.ability_cost = ability_cost;
    species_config.balance_version = BALANCE_VERSION;
    species_config.active = true;
    species_config.bump = context.bumps.species_config;
    Ok(())
}
