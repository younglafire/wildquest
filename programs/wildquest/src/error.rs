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
    #[msg("The requested quest is not defined by this program")]
    UnsupportedQuest,
    #[msg("The quest account does not match the requested quest ID")]
    QuestIdMismatch,
    #[msg("The quest definition is invalid")]
    InvalidQuestDefinition,
    #[msg("The number of submitted discoveries does not match the quest target count")]
    InvalidQuestDiscoveryCount,
    #[msg("A submitted discovery account is invalid")]
    InvalidQuestDiscovery,
    #[msg("A submitted discovery belongs to another player")]
    QuestDiscoveryPlayerMismatch,
    #[msg("The player has not discovered every quest target")]
    QuestTargetsIncomplete,
}
