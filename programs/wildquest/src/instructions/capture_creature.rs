use anchor_lang::prelude::*;

use crate::{
    constants::{BALANCE_VERSION, CREATURE_SEED, GAME_CONFIG_SEED, SPECIES_CONFIG_SEED},
    error::ErrorCode,
    state::{Creature, GameConfig, SpeciesConfig},
};

#[derive(Accounts)]
#[instruction(catalogue_id: u64, proof_hash: [u8; 32])]
pub struct CaptureCreatureAccountConstraints<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        constraint = capture_authority.key() == game_config.capture_authority
            @ ErrorCode::CaptureAuthorityMismatch
    )]
    pub capture_authority: Signer<'info>,

    #[account(seeds = [GAME_CONFIG_SEED], bump = game_config.bump)]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [
            SPECIES_CONFIG_SEED,
            catalogue_id.to_le_bytes().as_ref(),
            BALANCE_VERSION.to_le_bytes().as_ref()
        ],
        bump = species_config.bump,
        constraint = species_config.catalogue_id == catalogue_id
            && species_config.balance_version == BALANCE_VERSION
            @ ErrorCode::SpeciesConfigMismatch,
        constraint = species_config.active @ ErrorCode::InactiveSpeciesConfig
    )]
    pub species_config: Account<'info, SpeciesConfig>,

    #[account(
        init,
        payer = owner,
        space = Creature::DISCRIMINATOR.len() + Creature::INIT_SPACE,
        seeds = [CREATURE_SEED, owner.key().as_ref(), catalogue_id.to_le_bytes().as_ref()],
        bump
    )]
    pub creature: Account<'info, Creature>,

    pub system_program: Program<'info, System>,
}

pub fn handle_capture_creature(
    context: Context<CaptureCreatureAccountConstraints>,
    catalogue_id: u64,
    proof_hash: [u8; 32],
) -> Result<()> {
    require!(
        proof_hash.iter().any(|byte| *byte != 0),
        ErrorCode::InvalidCaptureProof
    );

    let creature = &mut context.accounts.creature;
    creature.owner = context.accounts.owner.key();
    creature.catalogue_id = catalogue_id;
    creature.proof_hash = proof_hash;
    creature.captured_at = Clock::get()?.unix_timestamp;
    creature.balance_version = BALANCE_VERSION;
    creature.bump = context.bumps.creature;
    Ok(())
}
