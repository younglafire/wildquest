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
