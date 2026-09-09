use anchor_lang::prelude::*;

#[constant]
pub const COUNTER_SEED: &[u8] = b"counter";

#[constant]
pub const PLAYER_SEED: &[u8] = b"player";

#[constant]
pub const DISCOVERY_SEED: &[u8] = b"discovery";

#[constant]
pub const QUEST_SEED: &[u8] = b"quest";

#[constant]
pub const QUEST_COMPLETION_SEED: &[u8] = b"quest_completion";

#[constant]
pub const GAME_CONFIG_SEED: &[u8] = b"game_config";

#[constant]
pub const SPECIES_CONFIG_SEED: &[u8] = b"species_config";

#[constant]
pub const CREATURE_SEED: &[u8] = b"creature";

#[constant]
pub const MATCH_SEED: &[u8] = b"match";

#[constant]
pub const BALANCE_VERSION: u16 = 1;

#[constant]
pub const RULES_VERSION: u16 = 1;

#[constant]
pub const MATCH_STAKE_LAMPORTS: u64 = 10_000_000;

pub const BATTLE_CATALOGUE_IDS: [u64; 6] = [1001, 1002, 1003, 1004, 1005, 1006];

pub const BATTLE_MODEL_CLASS_IDS: [u16; 6] = [151, 207, 235, 281, 283, 323];

pub const BATTLE_STATS: [[u16; 5]; 6] = [
    [80, 55, 35, 95, 35],
    [115, 60, 55, 45, 25],
    [100, 72, 55, 55, 18],
    [90, 60, 40, 80, 30],
    [105, 55, 60, 35, 45],
    [75, 55, 35, 100, 35],
];

#[constant]
pub const HELLO_WORLD_LAMPORTS: u64 = 1;

#[constant]
pub const MAX_COUNT: u64 = 10;

#[constant]
pub const STARTING_LEVEL: u64 = 1;

#[constant]
pub const XP_PER_LEVEL: u64 = 100;

#[constant]
pub const BRONZE_GRADE: u8 = 1;

#[constant]
pub const SILVER_GRADE: u8 = 2;

#[constant]
pub const GOLD_GRADE: u8 = 3;

#[constant]
pub const BRONZE_XP: u64 = 50;

#[constant]
pub const SILVER_XP: u64 = 75;

#[constant]
pub const GOLD_XP: u64 = 100;

#[constant]
pub const MAX_RARITY: u8 = 4;

#[constant]
pub const DEMO_QUEST_ID: u64 = 1;

#[constant]
pub const DEMO_QUEST_TARGETS: [u64; 5] = [3, 5, 8, 9, 11];

#[constant]
pub const DEMO_QUEST_REWARD_XP: u64 = 100;
