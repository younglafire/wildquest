use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only the counter authority can update this counter")]
    Unauthorized,
    #[msg("Counter has reached the maximum value")]
    CounterOverflow,
    #[msg("Capture grade must be Bronze, Silver, or Gold")]
    InvalidCaptureGrade,
    #[msg("Species rarity must be between Common and Legendary")]
    InvalidRarity,
    #[msg("Player account does not belong to the transaction signer")]
    PlayerWalletMismatch,
    #[msg("Player progression arithmetic overflowed")]
    ProgressionOverflow,
}
