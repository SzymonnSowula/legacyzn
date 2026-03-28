use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use instructions::*;
use state::*;

declare_id!("J8k4XDzw1yKwXg2kKmL6Px1WzTJ4qfKKWEehfyDLRjSy");

#[program]
pub mod legacy_lock_program {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        inactivity_threshold_days: u16,
        veto_period_days: u16,
        witness_threshold: u8,
        beneficiaries: Vec<BeneficiaryEntry>,
        witnesses: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::initialize_vault(
            ctx,
            inactivity_threshold_days,
            veto_period_days,
            witness_threshold,
            beneficiaries,
            witnesses,
        )
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        inactivity_threshold_days: Option<u16>,
        veto_period_days: Option<u16>,
        witness_threshold: Option<u8>,
        beneficiaries: Option<Vec<BeneficiaryEntry>>,
        witnesses: Option<Vec<Pubkey>>,
    ) -> Result<()> {
        instructions::update_config(
            ctx,
            inactivity_threshold_days,
            veto_period_days,
            witness_threshold,
            beneficiaries,
            witnesses,
        )
    }

    pub fn ping_alive(ctx: Context<PingAlive>) -> Result<()> {
        instructions::ping_alive(ctx)
    }

    pub fn ping_alive_session(ctx: Context<PingAliveSession>) -> Result<()> {
        instructions::ping_alive_session(ctx)
    }

    pub fn add_session_key(ctx: Context<ManageSessionKey>, new_session_key: Pubkey) -> Result<()> {
        instructions::add_session_key(ctx, new_session_key)
    }

    pub fn revoke_session_key(ctx: Context<ManageSessionKey>) -> Result<()> {
        instructions::revoke_session_key(ctx)
    }

    pub fn confirm_inactivity(ctx: Context<ConfirmInactivity>) -> Result<()> {
        instructions::confirm_inactivity(ctx)
    }

    pub fn owner_cancel(ctx: Context<OwnerCancel>) -> Result<()> {
        instructions::owner_cancel(ctx)
    }

    pub fn execute_transfer(ctx: Context<ExecuteTransfer>) -> Result<()> {
        instructions::execute_transfer(ctx)
    }

    pub fn claim_sol(ctx: Context<ClaimSol>, beneficiary_index: u8) -> Result<()> {
        instructions::claim_sol(ctx, beneficiary_index)
    }
}