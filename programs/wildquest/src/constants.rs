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
