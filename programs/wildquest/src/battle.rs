use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::SpeciesConfig};

pub const TEAM_SIZE: usize = 3;
pub const MAX_BATTLE_ROUNDS: usize = 50;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct BattleStats {
    pub hp: u16,
    pub attack: u16,
    pub defense: u16,
    pub speed: u16,
    pub shield: u16,
}

impl From<&SpeciesConfig> for BattleStats {
    fn from(config: &SpeciesConfig) -> Self {
        Self {
            hp: config.hp,
            attack: config.attack,
            defense: config.defense,
            speed: config.speed,
            shield: config.shield,
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BattleOutcome {
    Creator,
    Opponent,
    Tie,
}

#[derive(Clone, Copy)]
struct Fighter {
    stats: BattleStats,
    hp: u64,
    shield: u64,
}

impl From<BattleStats> for Fighter {
    fn from(stats: BattleStats) -> Self {
        Self {
            hp: u64::from(stats.hp),
            shield: u64::from(stats.shield),
            stats,
        }
    }
}

fn damage(attack: u16, defense: u16) -> Result<u64> {
    let numerator = u64::from(attack)
        .checked_mul(100)
        .ok_or(ErrorCode::BattleArithmeticOverflow)?;
    let denominator = 100u64
        .checked_add(u64::from(defense))
        .ok_or(ErrorCode::BattleArithmeticOverflow)?;
    Ok((numerator / denominator).max(1))
}

fn apply_damage(fighter: &mut Fighter, amount: u64) {
    let shield_damage = fighter.shield.min(amount);
    fighter.shield -= shield_damage;
    fighter.hp = fighter.hp.saturating_sub(amount - shield_damage);
}

fn advance_knocked_out(team: &[Fighter; TEAM_SIZE], active: &mut usize) {
    while *active < TEAM_SIZE && team[*active].hp == 0 {
        *active += 1;
    }
}

fn remaining_power(team: &[Fighter; TEAM_SIZE]) -> Result<u64> {
    team.iter().try_fold(0u64, |total, fighter| {
        total
            .checked_add(fighter.hp)
            .and_then(|value| value.checked_add(fighter.shield))
            .ok_or_else(|| error!(ErrorCode::BattleArithmeticOverflow))
    })
}

fn starting_power(team: &[BattleStats; TEAM_SIZE]) -> Result<u64> {
    team.iter().try_fold(0u64, |total, stats| {
        total
            .checked_add(u64::from(stats.hp))
            .and_then(|value| value.checked_add(u64::from(stats.shield)))
            .ok_or_else(|| error!(ErrorCode::BattleArithmeticOverflow))
    })
}

pub fn resolve_battle(
    creator_stats: [BattleStats; TEAM_SIZE],
    opponent_stats: [BattleStats; TEAM_SIZE],
) -> Result<BattleOutcome> {
    let creator_start = starting_power(&creator_stats)?;
    let opponent_start = starting_power(&opponent_stats)?;
    require!(
        creator_start > 0 && opponent_start > 0,
        ErrorCode::InvalidBattleStats
    );

    let mut creator_team = creator_stats.map(Fighter::from);
    let mut opponent_team = opponent_stats.map(Fighter::from);
    let mut creator_active = 0usize;
    let mut opponent_active = 0usize;

    for _ in 0..MAX_BATTLE_ROUNDS {
        advance_knocked_out(&creator_team, &mut creator_active);
        advance_knocked_out(&opponent_team, &mut opponent_active);
        match (creator_active == TEAM_SIZE, opponent_active == TEAM_SIZE) {
            (true, true) => return Ok(BattleOutcome::Tie),
            (true, false) => return Ok(BattleOutcome::Opponent),
            (false, true) => return Ok(BattleOutcome::Creator),
            (false, false) => {}
        }

        let creator = creator_team[creator_active];
        let opponent = opponent_team[opponent_active];
        let creator_damage = damage(creator.stats.attack, opponent.stats.defense)?;
        let opponent_damage = damage(opponent.stats.attack, creator.stats.defense)?;

        if creator.stats.speed > opponent.stats.speed {
            apply_damage(&mut opponent_team[opponent_active], creator_damage);
            if opponent_team[opponent_active].hp > 0 {
                apply_damage(&mut creator_team[creator_active], opponent_damage);
            }
        } else if opponent.stats.speed > creator.stats.speed {
            apply_damage(&mut creator_team[creator_active], opponent_damage);
            if creator_team[creator_active].hp > 0 {
                apply_damage(&mut opponent_team[opponent_active], creator_damage);
            }
        } else {
            apply_damage(&mut creator_team[creator_active], opponent_damage);
            apply_damage(&mut opponent_team[opponent_active], creator_damage);
        }
    }

    let creator_remaining = remaining_power(&creator_team)?;
    let opponent_remaining = remaining_power(&opponent_team)?;
    let creator_ratio = creator_remaining
        .checked_mul(opponent_start)
        .ok_or(ErrorCode::BattleArithmeticOverflow)?;
    let opponent_ratio = opponent_remaining
        .checked_mul(creator_start)
        .ok_or(ErrorCode::BattleArithmeticOverflow)?;

    Ok(match creator_ratio.cmp(&opponent_ratio) {
        core::cmp::Ordering::Greater => BattleOutcome::Creator,
        core::cmp::Ordering::Less => BattleOutcome::Opponent,
        core::cmp::Ordering::Equal => BattleOutcome::Tie,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn stats(hp: u16, attack: u16, defense: u16, speed: u16, shield: u16) -> BattleStats {
        BattleStats {
            hp,
            attack,
            defense,
            speed,
            shield,
        }
    }

    #[test]
    fn faster_creature_prevents_a_knocked_out_counterattack() {
        let fast = [stats(10, 1000, 0, 20, 0); TEAM_SIZE];
        let slow = [stats(1, 1000, 0, 10, 0); TEAM_SIZE];
        assert_eq!(resolve_battle(fast, slow).unwrap(), BattleOutcome::Creator);
    }

    #[test]
    fn equal_speed_attacks_resolve_simultaneously() {
        let team = [stats(1, 1000, 0, 10, 0); TEAM_SIZE];
        assert_eq!(resolve_battle(team, team).unwrap(), BattleOutcome::Tie);
    }

    #[test]
    fn shield_absorbs_damage_before_hp() {
        let defended = [stats(10, 1, u16::MAX, 10, 1000); TEAM_SIZE];
        let attacker = [stats(10, 100, 0, 9, 0); TEAM_SIZE];
        assert_eq!(
            resolve_battle(defended, attacker).unwrap(),
            BattleOutcome::Creator
        );
    }

    #[test]
    fn fifty_round_cutoff_uses_remaining_power_ratio() {
        let durable = [stats(1000, 1, u16::MAX, 10, 0); TEAM_SIZE];
        assert_eq!(
            resolve_battle(durable, durable).unwrap(),
            BattleOutcome::Tie
        );

        let damaged = [stats(100, 10, 0, 11, 0); TEAM_SIZE];
        assert_eq!(
            resolve_battle(durable, damaged).unwrap(),
            BattleOutcome::Creator
        );
    }
}
