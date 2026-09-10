use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub wallet: Pubkey,
    pub xp: u64,
    pub level: u64,
    pub discovery_count: u64,
    pub badge_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Discovery {
    pub player: Pubkey,
    pub species_id: u64,
    pub timestamp: i64,
    pub grade: u8,
    pub rarity: u8,
    pub proof_hash: [u8; 32],
}

#[account]
#[derive(InitSpace)]
pub struct Quest {
    pub quest_id: u64,
    pub species_count: u8,
    #[max_len(5)]
    pub targets: Vec<u64>,
    pub reward_xp: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct QuestCompletion {
    pub quest: Pubkey,
    pub player: Pubkey,
    pub completed_at: i64,
    pub reward_xp: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    pub admin: Pubkey,
    pub capture_authority: Pubkey,
    pub balance_version: u16,
    pub rules_version: u16,
    pub stake_lamports: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SpeciesConfig {
    pub catalogue_id: u64,
    pub model_class_id: u16,
    pub hp: u16,
    pub attack: u16,
    pub defense: u16,
    pub speed: u16,
    pub shield: u16,
    pub balance_version: u16,
    pub active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Creature {
    pub owner: Pubkey,
    pub catalogue_id: u64,
    pub proof_hash: [u8; 32],
    pub captured_at: i64,
    pub balance_version: u16,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Eq, InitSpace, PartialEq)]
pub enum MatchStatus {
    Open,
    Settled,
    Cancelled,
    Claimable,
}

#[account]
#[derive(InitSpace)]
pub struct Match {
    pub match_id: u64,
    pub creator: Pubkey,
    pub opponent: Option<Pubkey>,
    pub creator_creatures: [Pubkey; 3],
    pub opponent_creatures: [Pubkey; 3],
    pub stake_lamports: u64,
    pub balance_version: u16,
    pub rules_version: u16,
    pub status: MatchStatus,
    pub winner: Option<Pubkey>,
    pub created_at: i64,
    pub settled_at: Option<i64>,
    pub bump: u8,
}
