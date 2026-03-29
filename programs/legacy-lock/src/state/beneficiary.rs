use anchor_lang::prelude::*;

// Re-exporting from common crate.
pub use legacy_lock_common::{BeneficiaryList, BeneficiaryEntry};

impl BeneficiaryList {
    pub const SEED_PREFIX: &'static [u8] = b"beneficiaries";
}
