use anchor_lang::prelude::*;

use crate::{constants::DISCOVERY_SEED, state::Discovery};

#[derive(Accounts)]
#[instruction(species_id: u64)]
pub struct DiscoverSpecies<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Discovery::INIT_SPACE,
        seeds = [DISCOVERY_SEED, payer.key().as_ref(), species_id.to_le_bytes().as_ref()],
        bump
    )]
    pub discovery: Account<'info, Discovery>,
    pub system_program: Program<'info, System>,
}

pub fn handle_discover_species(
    ctx: Context<DiscoverSpecies>,
    species_id: u64,
    grade: u8,
    rarity: u8,
    proof_hash: [u8; 32],
) -> Result<()> {
    let discovery = &mut ctx.accounts.discovery;
    discovery.player = ctx.accounts.payer.key();
    discovery.species_id = species_id;
    discovery.timestamp = Clock::get()?.unix_timestamp;
    discovery.grade = grade;
    discovery.rarity = rarity;
    discovery.proof_hash = proof_hash;

    msg!(
        "Discovery created for wallet {} species {} at {}",
        ctx.accounts.payer.key(),
        species_id,
        discovery.timestamp
    );
    Ok(())
}
