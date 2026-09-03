pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo");

#[program]
pub mod wildquest {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        crate::instructions::initialize::handle_initialize(ctx)
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        crate::instructions::increment::handle_increment(ctx)
    }

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        crate::instructions::initialize_player::handle_initialize_player(ctx)
    }

    pub fn discover_species(
        context: Context<DiscoverSpeciesAccountConstraints>,
        species_id: u64,
        grade: u8,
        rarity: u8,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        crate::instructions::discover_species::handle_discover_species(
            context, species_id, grade, rarity, proof_hash,
        )
    }
}
