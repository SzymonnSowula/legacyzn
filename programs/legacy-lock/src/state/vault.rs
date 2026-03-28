use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LegacyVault {
    pub owner: Pubkey,
    pub session_key: Pubkey,
    pub last_ping_ts: i64,
    pub inactivity_threshold_days: u16,
    pub veto_period_days: u16,
    pub witness_threshold: u8,
    pub witnesses_confirmed: u8,
    pub status: VaultStatus,
    pub veto_deadline: i64,
    pub bump: u8,
}

impl LegacyVault {
    pub const SEED_PREFIX: &'static [u8] = b"vault";

    pub fn is_within_activity_window(&self, now: i64) -> bool {
        let threshold_secs = (self.inactivity_threshold_days as i64) * 86400;
        now - self.last_ping_ts <= threshold_secs
    }

    pub fn is_veto_deadline_passed(&self, now: i64) -> bool {
        self.status == VaultStatus::VetoPeriod && now > self.veto_deadline
    }

    pub fn has_session_key(&self) -> bool {
        self.session_key != Pubkey::default()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VaultStatus {
    Active,
    WitnessVoting,
    VetoPeriod,
    Executed,
}
