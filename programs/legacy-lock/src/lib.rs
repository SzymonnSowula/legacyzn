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

    /// Initialize a new vault with configuration for inactivity threshold and veto period.
    /// Inactivity threshold: time in days after which inheritance can be triggered.
    /// Veto period: timeframe for the owner to cancel (veto) the process.
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

    /// Update the configuration of an existing vault. Only the owner can call this.
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

    /// Owner pings the vault to reset the inactivity timer.
    pub fn ping_alive(ctx: Context<PingAlive>) -> Result<()> {
        instructions::ping_alive(ctx)
    }

    /// Authorized session key pings the vault to reset the inactivity timer.
    pub fn ping_alive_session(ctx: Context<PingAliveSession>) -> Result<()> {
        instructions::ping_alive_session(ctx)
    }

    /// Adds or updates a session key that can ping the vault or veto processes.
    pub fn add_session_key(ctx: Context<ManageSessionKey>, new_session_key: Pubkey) -> Result<()> {
        instructions::add_session_key(ctx, new_session_key)
    }

    /// Removes the current session key.
    pub fn revoke_session_key(ctx: Context<ManageSessionKey>) -> Result<()> {
        instructions::revoke_session_key(ctx)
    }

    /// Witnesses call this to confirm the owner is inactive once the threshold has passed.
    pub fn confirm_inactivity(ctx: Context<ConfirmInactivity>) -> Result<()> {
        instructions::confirm_inactivity(ctx)
    }

    /// Owner or session key cancels the inheritance process during the veto period.
    pub fn veto(ctx: Context<Veto>) -> Result<()> {
        instructions::veto(ctx)
    }

    /// Finalizes the inheritance process after the veto period ends, making funds claimable.
    pub fn execute_inheritance(ctx: Context<ExecuteInheritance>) -> Result<()> {
        instructions::execute_inheritance(ctx)
    }

    /// Beneficiaries call this to withdraw their share of SOL from an executed vault.
    pub fn claim_sol(ctx: Context<ClaimSol>, beneficiary_index: u8) -> Result<()> {
        instructions::claim_sol(ctx, beneficiary_index)
    }

    /// Automatically transfers Token-2022 assets to a beneficiary if the heartbeat threshold is passed.
    /// Uses the Permanent Delegate extension.
    pub fn execute_token_inheritance(ctx: Context<ExecuteTokenInheritance>) -> Result<()> {
        instructions::execute_token_inheritance(ctx)
    }
}