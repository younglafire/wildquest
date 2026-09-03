use anchor_lang::prelude::*;

use crate::{
    constants::{
        BRONZE_GRADE, BRONZE_XP, DISCOVERY_SEED, GOLD_GRADE, GOLD_XP, MAX_RARITY, PLAYER_SEED,
        SILVER_GRADE, SILVER_XP, STARTING_LEVEL, XP_PER_LEVEL,
    },
    error::ErrorCode,
    state::{Discovery, Player},
};

#[derive(Accounts)]
#[instruction(species_id: u64)]
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
        seeds = [DISCOVERY_SEED, payer.key().as_ref(), species_id.to_le_bytes().as_ref()],
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
        calculate_player_progression(player.xp, player.discovery_count, awarded_xp)?;

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

fn calculate_player_progression(
    current_xp: u64,
    current_discovery_count: u64,
    awarded_xp: u64,
) -> Result<(u64, u64, u64)> {
    let next_xp = current_xp
        .checked_add(awarded_xp)
        .ok_or(ErrorCode::ProgressionOverflow)?;
    let next_discovery_count = current_discovery_count
        .checked_add(1)
        .ok_or(ErrorCode::ProgressionOverflow)?;
    let next_level = next_xp
        .checked_div(XP_PER_LEVEL)
        .and_then(|completed_levels| completed_levels.checked_add(STARTING_LEVEL))
        .ok_or(ErrorCode::ProgressionOverflow)?;
    Ok((next_xp, next_level, next_discovery_count))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn progression_rejects_xp_overflow() {
        assert!(calculate_player_progression(u64::MAX, 0, BRONZE_XP).is_err());
    }

    #[test]
    fn progression_rejects_discovery_count_overflow() {
        assert!(calculate_player_progression(0, u64::MAX, BRONZE_XP).is_err());
    }
}
