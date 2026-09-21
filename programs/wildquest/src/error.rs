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
    #[msg("The submitted quest evidence count is invalid")]
    InvalidQuestEvidenceCount,
    #[msg("A submitted quest evidence account is invalid")]
    InvalidQuestEvidence,
    #[msg("A submitted Creature does not belong to this player")]
    QuestCreatureOwnerMismatch,
    #[msg("The previous quest must be completed first")]
    QuestPrerequisiteIncomplete,
    #[msg("The submitted accounts do not complete this quest objective")]
    QuestObjectiveIncomplete,
    #[msg("Only the configured game administrator can perform this action")]
    GameAdminMismatch,
    #[msg("The capture authority does not match the configured authority")]
    CaptureAuthorityMismatch,
    #[msg("The catalogue ID is not part of the active balance version")]
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
    #[msg("Battle stats must contain positive HP")]
    InvalidBattleStats,
    #[msg("The GameConfig account does not use the active balance version")]
    GameBalanceVersionMismatch,
    #[msg("Battle arithmetic overflowed")]
    BattleArithmeticOverflow,
    #[msg("The Match account is not open")]
    MatchNotOpen,
    #[msg("The Match payout is not ready to be claimed")]
    MatchNotClaimable,
    #[msg("Only the stored Match winner can claim the payout")]
    MatchWinnerMismatch,
    #[msg("The Match creator cannot join as the opponent")]
    MatchSelfJoin,
    #[msg("The Match account does not match the active GameConfig")]
    MatchConfigMismatch,
    #[msg("The submitted creator team does not match the Match account")]
    MatchCreatorTeamMismatch,
    #[msg("Match escrow arithmetic overflowed")]
    MatchEscrowOverflow,
    #[msg("The Match is not active")]
    MatchNotActive,
    #[msg("The configured authority did not sign this Match result")]
    MatchResolverMismatch,
    #[msg("The Match result hash cannot be all zeroes")]
    InvalidMatchResultHash,
    #[msg("The Match turn count is outside the supported range")]
    InvalidMatchTurnCount,
    #[msg("The Match winner must be one of its two players")]
    InvalidMatchWinner,
    #[msg("The active Match deadline has passed")]
    MatchResolutionExpired,
    #[msg("The active Match deadline has not passed")]
    MatchRefundUnavailable,
    #[msg("Only a Match participant can request its stale refund")]
    MatchParticipantMismatch,
}
