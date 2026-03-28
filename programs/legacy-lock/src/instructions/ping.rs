use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{PingRecorded, PingSource, SessionKeyAdded, SessionKeyRevoked};

pub const MIN_PING_INTERVAL_SECS: i64 = 3600; // 1h

#[derive(Accounts)]
pub struct PingAlive<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    pub vault: Account<'info, LegacyVault>,
    pub owner: Signer<'info>,
}

/// Owner pings the vault to prove they are still active.
/// This resets the inactivity countdown.
pub fn ping_alive(ctx: Context<PingAlive>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    // Ping jest możliwy tylko gdy vault jest w stanie Active (normalna praca).
    require!(vault.status == VaultStatus::Active, LegacyError::NotActive);

    let clock = Clock::get()?;
    // Anty-spam: ping nie częściej niż co 1h.
    require!(
        clock.unix_timestamp - vault.last_ping_ts >= MIN_PING_INTERVAL_SECS,
        LegacyError::PingTooFrequent
    );

    // Aktualizacja czasu ostatniej aktywności.
    vault.last_ping_ts = clock.unix_timestamp;

    let threshold_secs = (vault.inactivity_threshold_days as i64) * 86400;
    
    emit!(PingRecorded {
        vault: vault.key(),
        source: PingSource::Owner,
        days_to_threshold: threshold_secs / 86400,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct PingAliveSession<'info> {
    #[account(
        mut,
        has_one = session_key,
    )]
    pub vault: Account<'info, LegacyVault>,
    pub session_key: Signer<'info>,
}

pub fn ping_alive_session(ctx: Context<PingAliveSession>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::Active, LegacyError::NotActive);
    require!(vault.has_session_key(), LegacyError::MissingSessionKey);

    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp - vault.last_ping_ts >= MIN_PING_INTERVAL_SECS,
        LegacyError::PingTooFrequent
    );

    vault.last_ping_ts = clock.unix_timestamp;

    let threshold_secs = (vault.inactivity_threshold_days as i64) * 86400;

    emit!(PingRecorded {
        vault: vault.key(),
        source: PingSource::SessionKey,
        days_to_threshold: threshold_secs / 86400,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct ManageSessionKey<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    pub vault: Account<'info, LegacyVault>,
    pub owner: Signer<'info>,
}

/// Adds a session key that can ping the vault or veto processes.
/// Session key is useful for automated pings or when the owner's main key is cold.
pub fn add_session_key(ctx: Context<ManageSessionKey>, new_session_key: Pubkey) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::Active, LegacyError::NotActive);

    // Przypisanie nowego klucza sesyjnego.
    vault.session_key = new_session_key;

    let clock = Clock::get()?;
    emit!(SessionKeyAdded {
        vault: vault.key(),
        session_key: new_session_key,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

pub fn revoke_session_key(ctx: Context<ManageSessionKey>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::Active, LegacyError::NotActive);

    vault.session_key = Pubkey::default();

    let clock = Clock::get()?;
    emit!(SessionKeyRevoked {
        vault: vault.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
