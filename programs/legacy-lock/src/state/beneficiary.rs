use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BeneficiaryList {
    pub vault: Pubkey,
    pub bump: u8,
    #[max_len(10)]
    pub entries: Vec<BeneficiaryEntry>,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct BeneficiaryEntry {
    pub pubkey: Pubkey,
    pub share_bps: u16,
    pub sol_claimed: bool,
}
