use anchor_lang::prelude::*;

#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VaultConfigUpdated {
    pub vault: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct BeneficiaryListUpdated {
    pub vault: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PingRecorded {
    pub vault: Pubkey,
    pub source: PingSource,
    pub days_to_threshold: i64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PingSource {
    Owner,
    SessionKey,
}

#[event]
pub struct SessionKeyAdded {
    pub vault: Pubkey,
    pub session_key: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SessionKeyRevoked {
    pub vault: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct InactivityConfirmed {
    pub vault: Pubkey,
    pub witness: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VetoPeriodStarted {
    pub vault: Pubkey,
    pub veto_deadline: i64,
    pub timestamp: i64,
}

#[event]
pub struct ProcessCancelled {
    pub vault: Pubkey,
    pub time_remaining_secs: i64,
    pub timestamp: i64,
}

#[event]
pub struct TransferExecuted {
    pub vault: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SolClaimed {
    pub vault: Pubkey,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
