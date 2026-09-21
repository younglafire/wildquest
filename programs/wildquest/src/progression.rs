use anchor_lang::prelude::*;

use crate::{constants::*, error::ErrorCode};

pub fn calculate_level(total_xp: u64) -> Result<u64> {
    total_xp
        .checked_div(XP_PER_LEVEL)
        .and_then(|completed_levels| completed_levels.checked_add(STARTING_LEVEL))
        .ok_or_else(|| error!(ErrorCode::ProgressionOverflow))
}

pub fn calculate_discovery_progression(
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
    let next_level = calculate_level(next_xp)?;
    Ok((next_xp, next_level, next_discovery_count))
}

pub fn calculate_quest_progression(current_xp: u64, reward_xp: u64) -> Result<(u64, u64)> {
    let next_xp = current_xp
        .checked_add(reward_xp)
        .ok_or(ErrorCode::ProgressionOverflow)?;
    let next_level = calculate_level(next_xp)?;
    Ok((next_xp, next_level))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn discovery_progression_rejects_xp_overflow() {
        assert!(calculate_discovery_progression(u64::MAX, 0, BRONZE_XP).is_err());
    }

    #[test]
    fn discovery_progression_rejects_count_overflow() {
        assert!(calculate_discovery_progression(0, u64::MAX, BRONZE_XP).is_err());
    }

    #[test]
    fn quest_progression_rejects_xp_overflow() {
        assert!(calculate_quest_progression(u64::MAX, 25).is_err());
    }
}
