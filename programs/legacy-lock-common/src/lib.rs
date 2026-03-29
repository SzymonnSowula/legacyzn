use anchor_lang::prelude::*;

declare_id!("J8k4XDzw1yKwXg2kKmL6Px1WzTJ4qfKKWEehfyDLRjSy");

pub const VAULT_SEED: &[u8] = b"vault";

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum VaultStatus {
    Active,
    WitnessVoting,
    VetoPeriod,
    Executed,
}

#[account]
#[derive(InitSpace)]
pub struct BeneficiaryList {
    pub vault: Pubkey,
    pub bump: u8,
    #[max_len(10)]
    pub entries: Vec<BeneficiaryEntry>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct BeneficiaryEntry {
    pub pubkey: Pubkey,
    pub share_bps: u16,
}

#[account]
#[derive(InitSpace)]
pub struct TokenClaimReceipt {
    pub vault: Pubkey,
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub claimed_amount: u64,
    pub claimed_at: i64,
    pub bump: u8,
}

impl TokenClaimReceipt {
    pub const SEED_PREFIX: &'static [u8] = b"claim-receipt";
}

impl LegacyVault {
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

impl BeneficiaryList {
    pub const SEED_PREFIX: &'static [u8] = b"beneficiaries";

    pub fn validate_shares(&self) -> bool {
        let mut total: u16 = 0;
        for entry in &self.entries {
            total += entry.share_bps;
        }
        total == 10000
    }
}
