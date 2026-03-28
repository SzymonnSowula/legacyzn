use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WitnessRegistry {
    pub vault: Pubkey,
    pub bump: u8,
    #[max_len(5)]
    pub entries: Vec<WitnessEntry>,
}

impl WitnessRegistry {
    pub const SEED_PREFIX: &'static [u8] = b"witnesses";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct WitnessEntry {
    pub pubkey: Pubkey,
    pub confirmed: bool,
    pub confirmed_at: i64,
}
