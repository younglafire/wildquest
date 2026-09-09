pub mod battle;
pub mod constants;
pub mod error;
pub mod instructions;
pub mod progression;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF");

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

    pub fn initialize_quest(
        context: Context<InitializeQuestAccountConstraints>,
        quest_id: u64,
    ) -> Result<()> {
        crate::instructions::initialize_quest::handle_initialize_quest(context, quest_id)
    }

    pub fn complete_quest(
        context: Context<CompleteQuestAccountConstraints>,
        quest_id: u64,
    ) -> Result<()> {
        crate::instructions::complete_quest::handle_complete_quest(context, quest_id)
    }

    pub fn initialize_game_config(
        context: Context<InitializeGameConfigAccountConstraints>,
        capture_authority: Pubkey,
    ) -> Result<()> {
        crate::instructions::initialize_game_config::handle_initialize_game_config(
            context,
            capture_authority,
        )
    }

    pub fn initialize_species_config(
        context: Context<InitializeSpeciesConfigAccountConstraints>,
        catalogue_id: u64,
    ) -> Result<()> {
        crate::instructions::initialize_species_config::handle_initialize_species_config(
            context,
            catalogue_id,
        )
    }

    pub fn capture_creature(
        context: Context<CaptureCreatureAccountConstraints>,
        catalogue_id: u64,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        crate::instructions::capture_creature::handle_capture_creature(
            context,
            catalogue_id,
            proof_hash,
        )
    }

    pub fn open_match(context: Context<OpenMatchAccountConstraints>, match_id: u64) -> Result<()> {
        crate::instructions::open_match::handle_open_match(context, match_id)
    }

    pub fn join_match(context: Context<JoinMatchAccountConstraints>) -> Result<()> {
        crate::instructions::join_match::handle_join_match(context)
    }

    pub fn cancel_match(context: Context<CancelMatchAccountConstraints>) -> Result<()> {
        crate::instructions::cancel_match::handle_cancel_match(context)
    }
}
