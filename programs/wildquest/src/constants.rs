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

pub const BATTLE_CATALOGUE_IDS: [u64; 40] = [
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016,
    1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032,
    1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040,
];

pub const BATTLE_MODEL_CLASS_IDS: [u16; 40] = [
    151, 207, 235, 281, 283, 323, 7, 8, 30, 31, 65, 87, 88, 158, 179, 195, 208, 217, 219, 243, 250,
    254, 258, 263, 284, 285, 309, 310, 319, 320, 322, 324, 332, 333, 341, 346, 311, 312, 315, 42,
];

pub const BATTLE_STATS: [[u16; 5]; 40] = [
    [80, 55, 35, 95, 35],
    [115, 60, 55, 45, 25],
    [100, 72, 55, 55, 18],
    [90, 60, 40, 80, 30],
    [105, 55, 60, 35, 45],
    [75, 55, 35, 100, 35],
    [92, 62, 42, 72, 20],
    [100, 55, 48, 55, 28],
    [96, 58, 38, 68, 36],
    [72, 52, 32, 94, 42],
    [82, 66, 36, 78, 24],
    [86, 58, 40, 82, 32],
    [88, 68, 34, 86, 18],
    [78, 57, 34, 96, 30],
    [104, 70, 52, 58, 20],
    [88, 62, 44, 84, 22],
    [112, 66, 52, 62, 24],
    [94, 64, 42, 82, 22],
    [92, 62, 40, 86, 24],
    [126, 68, 66, 38, 34],
    [108, 66, 50, 72, 26],
    [92, 58, 46, 70, 42],
    [106, 64, 52, 56, 38],
    [86, 60, 42, 88, 30],
    [88, 62, 38, 90, 28],
    [90, 58, 42, 82, 34],
    [68, 58, 28, 96, 28],
    [64, 54, 30, 98, 32],
    [72, 60, 32, 100, 26],
    [66, 52, 30, 102, 38],
    [74, 54, 36, 92, 38],
    [76, 56, 38, 88, 36],
    [84, 54, 42, 78, 44],
    [76, 50, 34, 84, 40],
    [122, 72, 54, 42, 28],
    [138, 68, 72, 34, 48],
    [70, 58, 32, 104, 26],
    [74, 56, 34, 100, 30],
    [78, 70, 36, 94, 22],
    [98, 64, 48, 76, 32],
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
