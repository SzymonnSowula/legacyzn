use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::ProcessCancelled;

#[derive(Accounts)]
pub struct OwnerCancel<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    pub vault: Account<'info, LegacyVault>,
    
    #[account(
        mut,
        seeds = [WitnessRegistry::SEED_PREFIX, vault.key().as_ref()],
        bump = witness_registry.bump
    )]
    pub witness_registry: Account<'info, WitnessRegistry>,

    pub owner: Signer<'info>,
}

pub fn owner_cancel(ctx: Context<OwnerCancel>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::VetoPeriod, LegacyError::NotInVetoPeriod);

    let clock = Clock::get()?;
    require!(
        !vault.is_veto_deadline_passed(clock.unix_timestamp),
        LegacyError::VetoDeadlinePassed
    );

    let time_remaining = vault.veto_deadline - clock.unix_timestamp;

    vault.status = VaultStatus::Active;
    vault.witnesses_confirmed = 0;
    vault.veto_deadline = 0;

    let witness_registry = &mut ctx.accounts.witness_registry;
    for entry in witness_registry.entries.iter_mut() {
        entry.confirmed = false;
        entry.confirmed_at = 0;
    }

    emit!(ProcessCancelled {
        vault: vault.key(),
        time_remaining_secs: time_remaining,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
