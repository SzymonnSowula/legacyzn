use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{InactivityConfirmed, VetoPeriodStarted};

#[derive(Accounts)]
pub struct ConfirmInactivity<'info> {
    #[account(mut)]
    pub vault: Account<'info, LegacyVault>,
    
    #[account(
        mut,
        seeds = [WitnessRegistry::SEED_PREFIX, vault.key().as_ref()],
        bump = witness_registry.bump
    )]
    pub witness_registry: Account<'info, WitnessRegistry>,

    pub witness: Signer<'info>,
}

pub fn confirm_inactivity(ctx: Context<ConfirmInactivity>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    // 1. Sprawdzenie czy vault jest w stanie pozwalającym na głosowanie świadków.
    require!(
        vault.status == VaultStatus::Active || vault.status == VaultStatus::WitnessVoting,
        LegacyError::NotActive
    );

    let clock = Clock::get()?;
    // 2. Sprawdzenie czy minął czas bezczynności właściciela (inactivity_threshold).
    require!(
        !vault.is_within_activity_window(clock.unix_timestamp),
        LegacyError::ThresholdNotReached
    );

    let witness_registry = &mut ctx.accounts.witness_registry;
    let witness_key = ctx.accounts.witness.key();

    // 3. Znalezienie świadka w rejestrze i oznaczenie potwierdzenia.
    let entry = witness_registry.entries.iter_mut()
        .find(|e| e.pubkey == witness_key)
        .ok_or(LegacyError::WitnessNotFound)?;

    require!(!entry.confirmed, LegacyError::WitnessAlreadyConfirmed);

    entry.confirmed = true;
    entry.confirmed_at = clock.unix_timestamp;

    vault.witnesses_confirmed += 1;
    // Zmiana statusu na WitnessVoting po pierwszym głosie.
    if vault.status == VaultStatus::Active {
        vault.status = VaultStatus::WitnessVoting;
    }

    emit!(InactivityConfirmed {
        vault: vault.key(),
        witness: witness_key,
        timestamp: clock.unix_timestamp,
    });

    // 4. Jeśli osiągnięto próg (witness_threshold), przechodzimy do okresu Veto.
    if vault.witnesses_confirmed >= vault.witness_threshold {
        vault.status = VaultStatus::VetoPeriod;
        // Obliczenie deadline'u: teraz + liczba dni veto.
        vault.veto_deadline = clock.unix_timestamp + (vault.veto_period_days as i64) * 86400;

        emit!(VetoPeriodStarted {
            vault: vault.key(),
            veto_deadline: vault.veto_deadline,
            timestamp: clock.unix_timestamp,
        });
    }

    Ok(())
}
