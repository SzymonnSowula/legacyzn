use anchor_lang::prelude::*;

#[error_code]
pub enum LegacyError {
    #[msg("Vault is not active.")]
    NotActive,
    #[msg("Vault is not in veto period.")]
    NotInVetoPeriod,
    #[msg("Vault is not in witness voting status.")]
    NotInWitnessVoting,
    #[msg("Vault is not executed.")]
    NotExecuted,
    
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Missing session key.")]
    MissingSessionKey,

    #[msg("Time since last ping is too short.")]
    PingTooFrequent,
    #[msg("Inactivity threshold not reached.")]
    ThresholdNotReached,
    #[msg("Veto deadline has not passed yet.")]
    VetoDeadlineNotPassed,
    #[msg("Veto deadline has already passed.")]
    VetoDeadlinePassed,

    #[msg("Total beneficiary shares must equal 10000 basis points.")]
    InvalidShares,
    #[msg("Witness threshold must be less than or equal to number of witnesses.")]
    InvalidWitnessThreshold,

    #[msg("Beneficiary has already claimed SOL.")]
    SolAlreadyClaimed,
    #[msg("Witness has already confirmed.")]
    WitnessAlreadyConfirmed,
    #[msg("Witness not found in registry.")]
    WitnessNotFound,
}
