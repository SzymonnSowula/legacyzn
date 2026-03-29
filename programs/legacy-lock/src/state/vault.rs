use anchor_lang::prelude::*;

/// The main state account for a Legacy Vault.
#[account]
#[derive(InitSpace)]
pub struct LegacyVault {
    /// The original owner of the vault.
    pub owner: Pubkey,
    /// An optional secondary key that can ping the vault or execute a veto.
    pub session_key: Pubkey,
    /// The Unix timestamp of the last activity (ping or initialization).
    pub last_ping_ts: i64,
    /// Number of days of inactivity required before witnesses can start voting.
    pub inactivity_threshold_days: u16,
    /// Number of days the owner has to veto the process once witnesses confirm inactivity.
    pub veto_period_days: u16,
    /// Minimum number of witness confirmations required to enter the Veto Period.
    pub witness_threshold: u8,
    /// Number of witnesses who have already confirmed the current inactivity cycle.
    pub witnesses_confirmed: u8,
    /// Current state of the vault.
    pub status: VaultStatus,
    /// The timestamp after which inheritance can be executed (end of veto period).
    pub veto_deadline: i64,
    /// PDA bump for the vault account.
    pub bump: u8,
}

impl LegacyVault {
    pub const SEED_PREFIX: &'static [u8] = b"vault";

    /// Checks if the vault is still within the "alive" window based on the last ping.
    pub fn is_within_activity_window(&self, now: i64) -> bool {
        let threshold_secs = (self.inactivity_threshold_days as i64) * 86400;
        now - self.last_ping_ts <= threshold_secs
    }

    /// Checks if the veto period has expired, allowing for final execution.
    pub fn is_veto_deadline_passed(&self, now: i64) -> bool {
        self.status == VaultStatus::VetoPeriod && now > self.veto_deadline
    }

    /// Returns true if a valid session key is currently set.
    pub fn has_session_key(&self) -> bool {
        self.session_key != Pubkey::default()
    }
}

/// Represents the lifecycle stages of a vault.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VaultStatus {
    /// Normal operation; owner is pinging and funds are locked.
    Active,
    /// Owner has been inactive; witnesses are currently confirming inactivity.
    WitnessVoting,
    /// Witnesses have confirmed inactivity; owner has X days to veto.
    VetoPeriod,
    /// Veto period ended without a veto; inheritance is executed and funds are claimable.
    Executed,
}
