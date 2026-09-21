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
pub const BALANCE_VERSION: u16 = 2;

#[constant]
pub const RULES_VERSION: u16 = 2;

#[constant]
pub const MAX_MATCH_TURNS: u16 = 30;

#[constant]
pub const MATCH_ACTIVE_TIMEOUT_SECONDS: i64 = 600;

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

// HP, attack, defense, max mana, Strike cost, Guard cost, Recharge gain,
// ability ID, ability cost.
pub const BATTLE_STATS: [[u16; 9]; 40] = [
    [78, 58, 30, 7, 2, 1, 4, 1, 3],
    [100, 56, 46, 6, 2, 2, 3, 2, 4],
    [86, 58, 44, 6, 2, 2, 3, 3, 4],
    [90, 62, 40, 7, 2, 2, 3, 4, 4],
    [104, 52, 64, 6, 3, 1, 3, 5, 3],
    [78, 72, 32, 6, 2, 2, 3, 6, 4],
    [88, 60, 40, 6, 2, 2, 3, 7, 3],
    [106, 50, 54, 6, 3, 1, 3, 8, 3],
    [106, 66, 52, 5, 3, 2, 3, 9, 4],
    [76, 58, 34, 8, 1, 2, 4, 10, 3],
    [82, 76, 34, 6, 2, 2, 3, 11, 5],
    [86, 58, 40, 8, 2, 2, 4, 12, 4],
    [84, 68, 34, 6, 2, 2, 3, 13, 4],
    [70, 60, 28, 8, 1, 2, 4, 14, 3],
    [104, 68, 44, 5, 3, 2, 3, 15, 4],
    [86, 60, 42, 7, 2, 2, 3, 16, 3],
    [100, 56, 46, 6, 2, 2, 3, 17, 4],
    [86, 60, 38, 7, 2, 2, 4, 18, 4],
    [88, 62, 40, 7, 2, 2, 3, 19, 3],
    [118, 54, 64, 5, 3, 1, 2, 20, 4],
    [90, 58, 38, 6, 2, 2, 3, 21, 4],
    [108, 50, 66, 6, 3, 1, 3, 22, 3],
    [98, 54, 48, 6, 2, 2, 3, 23, 4],
    [88, 63, 42, 7, 2, 2, 3, 24, 3],
    [80, 73, 32, 6, 2, 2, 3, 25, 4],
    [86, 58, 40, 7, 2, 2, 3, 26, 3],
    [70, 70, 26, 7, 1, 2, 4, 27, 4],
    [72, 62, 22, 8, 1, 1, 5, 28, 3],
    [76, 74, 28, 7, 2, 2, 4, 29, 4],
    [72, 62, 34, 8, 1, 2, 4, 30, 3],
    [80, 58, 36, 8, 2, 1, 4, 31, 3],
    [76, 56, 38, 8, 2, 1, 4, 32, 3],
    [100, 50, 68, 6, 3, 1, 3, 33, 4],
    [80, 58, 36, 8, 1, 1, 4, 34, 3],
    [105, 62, 46, 5, 3, 2, 3, 35, 4],
    [115, 52, 60, 5, 3, 1, 2, 36, 5],
    [72, 66, 26, 8, 1, 2, 5, 37, 3],
    [78, 58, 38, 8, 2, 1, 4, 38, 4],
    [70, 76, 28, 6, 2, 2, 3, 39, 5],
    [90, 60, 44, 6, 2, 2, 3, 40, 4],
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
pub const QUEST_OBJECTIVE_CAPTURE_COUNT: u8 = 1;

#[constant]
pub const QUEST_OBJECTIVE_CAPTURE_ANY: u8 = 2;

#[constant]
pub const QUEST_OBJECTIVE_BATTLE_PARTICIPATION: u8 = 3;

#[constant]
pub const QUEST_IDS: [u64; 5] = [1, 2, 3, 4, 5];

pub const BUTTERFLY_CATALOGUE_IDS: [u64; 2] = [1031, 1032];
pub const RARE_CATALOGUE_IDS: [u64; 1] = [1011];

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct QuestDefinition {
    pub objective: u8,
    pub required_count: u8,
    pub targets: &'static [u64],
    pub reward_xp: u64,
}

pub fn quest_definition(quest_id: u64) -> Option<QuestDefinition> {
    match quest_id {
        1 => Some(QuestDefinition {
            objective: QUEST_OBJECTIVE_CAPTURE_COUNT,
            required_count: 1,
            targets: &[],
            reward_xp: 25,
        }),
        2 => Some(QuestDefinition {
            objective: QUEST_OBJECTIVE_CAPTURE_COUNT,
            required_count: 3,
            targets: &[],
            reward_xp: 50,
        }),
        3 => Some(QuestDefinition {
            objective: QUEST_OBJECTIVE_CAPTURE_ANY,
            required_count: 1,
            targets: &BUTTERFLY_CATALOGUE_IDS,
            reward_xp: 75,
        }),
        4 => Some(QuestDefinition {
            objective: QUEST_OBJECTIVE_CAPTURE_ANY,
            required_count: 1,
            targets: &RARE_CATALOGUE_IDS,
            reward_xp: 100,
        }),
        5 => Some(QuestDefinition {
            objective: QUEST_OBJECTIVE_BATTLE_PARTICIPATION,
            required_count: 1,
            targets: &[],
            reward_xp: 150,
        }),
        _ => None,
    }
}
