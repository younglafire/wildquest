use anchor_lang::prelude::*;

use crate::{
    constants::{
        BRONZE_GRADE, BRONZE_XP, DISCOVERY_SEED, GOLD_GRADE, GOLD_XP, MAX_RARITY, PLAYER_SEED,
        SILVER_GRADE, SILVER_XP,
    },
    error::ErrorCode,
    progression::calculate_discovery_progression,
    state::{Discovery, Player},
};

#[derive(Accounts)]
#[instruction(species_id: u64, grade: u8, rarity: u8, proof_hash: [u8; 32])]
pub struct DiscoverSpeciesAccountConstraints<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, payer.key().as_ref()],
        bump,
        constraint = player.wallet == payer.key() @ ErrorCode::PlayerWalletMismatch
    )]
    pub player: Account<'info, Player>,

    #[account(
        init,
        payer = payer,
        space = Discovery::DISCRIMINATOR.len() + Discovery::INIT_SPACE,
        seeds = [DISCOVERY_SEED, payer.key().as_ref(), proof_hash.as_ref()],
        bump
    )]
    pub discovery: Account<'info, Discovery>,

    pub system_program: Program<'info, System>,
}

pub fn handle_discover_species(
    context: Context<DiscoverSpeciesAccountConstraints>,
    species_id: u64,
    grade: u8,
    rarity: u8,
    proof_hash: [u8; 32],
) -> Result<()> {
    require!(rarity <= MAX_RARITY, ErrorCode::InvalidRarity);

    let awarded_xp = match grade {
        BRONZE_GRADE => BRONZE_XP,
        SILVER_GRADE => SILVER_XP,
        GOLD_GRADE => GOLD_XP,
        _ => return err!(ErrorCode::InvalidCaptureGrade),
    };

    let player = &mut context.accounts.player;
    let (next_xp, next_level, next_discovery_count) =
        calculate_discovery_progression(player.xp, player.discovery_count, awarded_xp)?;

    player.xp = next_xp;
    player.level = next_level;
    player.discovery_count = next_discovery_count;

    let discovery = &mut context.accounts.discovery;
    discovery.player = context.accounts.payer.key();
    discovery.species_id = species_id;
    discovery.timestamp = Clock::get()?.unix_timestamp;
    discovery.grade = grade;
    discovery.rarity = rarity;
    discovery.proof_hash = proof_hash;

    msg!(
        "Discovery created for wallet {} species {} at {}",
        context.accounts.payer.key(),
        species_id,
        discovery.timestamp
    );
    Ok(())
}
