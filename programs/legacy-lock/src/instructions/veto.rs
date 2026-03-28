use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::VetoExecuted;

#[derive(Accounts)]
pub struct Veto<'info> {
    /// The vault account being vetoed.
    #[account(mut)]
    pub vault: Account<'info, LegacyVault>,
    
    /// The witness registry associated with the vault, needs to be reset on veto.
    #[account(
        mut,
        seeds = [WitnessRegistry::SEED_PREFIX, vault.key().as_ref()],
        bump = witness_registry.bump
    )]
    pub witness_registry: Account<'info, WitnessRegistry>,

    /// The signer must be either the vault owner or the designated session key.
    pub signer: Signer<'info>,
}

/// Executes a veto on an ongoing inheritance process.
/// This can only be called during the VetoPeriod by the owner or a session key.
/// It resets the vault status to Active and clears all witness confirmations.
pub fn veto(ctx: Context<Veto>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let signer_key = ctx.accounts.signer.key();

    // 1. Sprawdzenie uprawnień: tylko owner lub session_key mogą wywołać veto.
    require!(
        signer_key == vault.owner || signer_key == vault.session_key,
        LegacyError::Unauthorized
    );

    // 2. Wymagany status: VetoPeriod.
    require!(
        vault.status == VaultStatus::VetoPeriod, 
        LegacyError::NotInVetoPeriod
    );

    let clock = Clock::get()?;

    // 3. Resetowanie stanu vaulta:
    // - powrót do statusu Active,
    // - wyzerowanie liczby potwierdzeń,
    // - usunięcie deadline'u veto.
    vault.status = VaultStatus::Active;
    vault.witnesses_confirmed = 0;
    vault.veto_deadline = 0;

    // 4. Resetowanie rejestru świadków:
    // Każdy świadek musi ponownie potwierdzić nieaktywność w przyszłości.
    let witness_registry = &mut ctx.accounts.witness_registry;
    for entry in witness_registry.entries.iter_mut() {
        entry.confirmed = false;
        entry.confirmed_at = 0;
    }

    // 5. Emisja zdarzenia VetoExecuted.
    emit!(VetoExecuted {
        vault: vault.key(),
        owner: vault.owner,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
