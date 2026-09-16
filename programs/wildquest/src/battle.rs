use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::SpeciesConfig};

pub const TEAM_SIZE: usize = 3;
pub const MAX_BATTLE_ROUNDS: usize = 50;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct BattleStats {
    pub hp: u16,
    pub attack: u16,
    pub defense: u16,
    pub max_mana: u16,
    pub strike_cost: u16,
    pub guard_cost: u16,
    pub recharge_gain: u16,
    pub ability_id: u16,
    pub ability_cost: u16,
}

impl From<&SpeciesConfig> for BattleStats {
    fn from(config: &SpeciesConfig) -> Self {
        Self {
            hp: config.hp,
            attack: config.attack,
            defense: config.defense,
            max_mana: config.max_mana,
            strike_cost: config.strike_cost,
            guard_cost: config.guard_cost,
            recharge_gain: config.recharge_gain,
            ability_id: config.ability_id,
            ability_cost: config.ability_cost,
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BattleOutcome {
    Creator,
    Opponent,
    Tie,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BattleSide {
    Creator,
    Opponent,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct BattleEvent {
    pub round: u8,
    pub attacker_side: BattleSide,
    pub attacker_slot: u8,
    pub defender_slot: u8,
    pub damage: u64,
    pub hp_before: u64,
    pub hp_after: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BattleReport {
    pub outcome: BattleOutcome,
    pub events: Vec<BattleEvent>,
}

#[derive(Clone, Copy)]
struct Fighter {
    stats: BattleStats,
    hp: u64,
}

impl From<BattleStats> for Fighter {
    fn from(stats: BattleStats) -> Self {
        Self {
            hp: u64::from(stats.hp),
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
    fighter.hp = fighter.hp.saturating_sub(amount);
}

fn apply_damage_and_emit(
    defender: &mut Fighter,
    round: usize,
    attacker_side: BattleSide,
    attacker_slot: usize,
    defender_slot: usize,
    amount: u64,
    emit: &mut impl FnMut(BattleEvent),
) -> Result<()> {
    let hp_before = defender.hp;
    apply_damage(defender, amount);
    emit(BattleEvent {
        round: u8::try_from(round).map_err(|_| ErrorCode::BattleArithmeticOverflow)?,
        attacker_side,
        attacker_slot: u8::try_from(attacker_slot)
            .map_err(|_| ErrorCode::BattleArithmeticOverflow)?,
        defender_slot: u8::try_from(defender_slot)
            .map_err(|_| ErrorCode::BattleArithmeticOverflow)?,
        damage: amount,
        hp_before,
        hp_after: defender.hp,
    });
    Ok(())
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
            .and_then(|value| value.checked_add(0))
            .ok_or_else(|| error!(ErrorCode::BattleArithmeticOverflow))
    })
}

fn starting_power(team: &[BattleStats; TEAM_SIZE]) -> Result<u64> {
    team.iter().try_fold(0u64, |total, stats| {
        total
            .checked_add(u64::from(stats.hp))
            .and_then(|value| value.checked_add(0))
            .ok_or_else(|| error!(ErrorCode::BattleArithmeticOverflow))
    })
}

pub fn resolve_battle(
    creator_stats: [BattleStats; TEAM_SIZE],
    opponent_stats: [BattleStats; TEAM_SIZE],
) -> Result<BattleOutcome> {
    resolve_battle_with_events(creator_stats, opponent_stats, |_| {})
}

pub fn simulate_battle(
    creator_stats: [BattleStats; TEAM_SIZE],
    opponent_stats: [BattleStats; TEAM_SIZE],
) -> Result<BattleReport> {
    let mut events = Vec::new();
    let outcome =
        resolve_battle_with_events(creator_stats, opponent_stats, |event| events.push(event))?;
    Ok(BattleReport { outcome, events })
}

fn resolve_battle_with_events(
    creator_stats: [BattleStats; TEAM_SIZE],
    opponent_stats: [BattleStats; TEAM_SIZE],
    mut emit: impl FnMut(BattleEvent),
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

    for round in 1..=MAX_BATTLE_ROUNDS {
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

        apply_damage_and_emit(
            &mut opponent_team[opponent_active],
            round,
            BattleSide::Creator,
            creator_active,
            opponent_active,
            creator_damage,
            &mut emit,
        )?;
        apply_damage_and_emit(
            &mut creator_team[creator_active],
            round,
            BattleSide::Opponent,
            opponent_active,
            creator_active,
            opponent_damage,
            &mut emit,
        )?;
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
    fn stats(hp: u16, attack: u16, defense: u16) -> BattleStats {
        BattleStats {
            hp,
            attack,
            defense,
            max_mana: 5,
            strike_cost: 2,
            guard_cost: 1,
            recharge_gain: 3,
            ability_id: 1,
            ability_cost: 3,
        }
    }

    #[test]
    fn attacks_resolve_simultaneously() {
        let team = [stats(1, 1000, 0); TEAM_SIZE];
        assert_eq!(resolve_battle(team, team).unwrap(), BattleOutcome::Tie);
    }

    #[test]
    fn fifty_round_cutoff_uses_remaining_power_ratio() {
        let durable = [stats(1000, 1, u16::MAX); TEAM_SIZE];
        assert_eq!(
            resolve_battle(durable, durable).unwrap(),
            BattleOutcome::Tie
        );

        let damaged = [stats(100, 10, 0); TEAM_SIZE];
        assert_eq!(
            resolve_battle(durable, damaged).unwrap(),
            BattleOutcome::Creator
        );
    }

    #[test]
    fn event_log_records_hp_and_knockout_order() {
        let creator = [stats(10, 100, 0); TEAM_SIZE];
        let opponent = [stats(10, 1, 0); TEAM_SIZE];
        let report = simulate_battle(creator, opponent).unwrap();
        let first = report.events.first().unwrap();
        assert_eq!(first.round, 1);
        assert_eq!(first.attacker_side, BattleSide::Creator);
        assert_eq!(first.attacker_slot, 0);
        assert_eq!(first.defender_slot, 0);
        assert_eq!(first.damage, 100);
        assert_eq!((first.hp_before, first.hp_after), (10, 0));
        assert_eq!(report.events[2].defender_slot, 1);
        assert_eq!(report.outcome, BattleOutcome::Creator);
    }
}
