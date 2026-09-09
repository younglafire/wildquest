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
    #[msg("Only the configured game administrator can perform this action")]
    GameAdminMismatch,
    #[msg("The capture authority does not match the configured authority")]
    CaptureAuthorityMismatch,
    #[msg("The catalogue ID is not part of balance version one")]
    UnsupportedBattleSpecies,
    #[msg("The SpeciesConfig account does not match the requested creature")]
    SpeciesConfigMismatch,
    #[msg("The SpeciesConfig account is not active")]
    InactiveSpeciesConfig,
    #[msg("The capture proof hash cannot be all zeroes")]
    InvalidCaptureProof,
    #[msg("A battle team must contain three distinct Creature accounts")]
    InvalidBattleTeam,
    #[msg("A Creature account does not belong to the expected player")]
    CreatureOwnerMismatch,
    #[msg("A Creature account uses the wrong balance version")]
    CreatureBalanceVersionMismatch,
    #[msg("Battle stats must contain positive total HP or Shield")]
    InvalidBattleStats,
    #[msg("Battle arithmetic overflowed")]
    BattleArithmeticOverflow,
    #[msg("The Match account is not open")]
    MatchNotOpen,
    #[msg("The Match creator cannot join as the opponent")]
    MatchSelfJoin,
    #[msg("The Match account does not match the active GameConfig")]
    MatchConfigMismatch,
    #[msg("The submitted creator team does not match the Match account")]
    MatchCreatorTeamMismatch,
    #[msg("Match escrow arithmetic overflowed")]
    MatchEscrowOverflow,
}
