use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{VaultInitialized, VaultConfigUpdated, BeneficiaryListUpdated};

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + LegacyVault::INIT_SPACE,
        seeds = [LegacyVault::SEED_PREFIX, owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, LegacyVault>,

    #[account(
        init,
        payer = owner,
        space = 8 + BeneficiaryList::INIT_SPACE,
        seeds = [BeneficiaryList::SEED_PREFIX, vault.key().as_ref()],
        bump
    )]
    pub beneficiary_list: Account<'info, BeneficiaryList>,

    #[account(
        init,
        payer = owner,
        space = 8 + WitnessRegistry::INIT_SPACE,
        seeds = [WitnessRegistry::SEED_PREFIX, vault.key().as_ref()],
        bump
    )]
    pub witness_registry: Account<'info, WitnessRegistry>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_vault(
    ctx: Context<InitializeVault>,
    inactivity_threshold_days: u16,
    veto_period_days: u16,
    witness_threshold: u8,
    beneficiaries: Vec<BeneficiaryEntry>,
    witnesses: Vec<Pubkey>,
) -> Result<()> {
    require!(witness_threshold <= witnesses.len() as u8, LegacyError::InvalidWitnessThreshold);

    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    vault.owner = ctx.accounts.owner.key();
    vault.session_key = Pubkey::default();
    vault.last_ping_ts = clock.unix_timestamp;
    vault.inactivity_threshold_days = inactivity_threshold_days;
    vault.veto_period_days = veto_period_days;
    vault.witness_threshold = witness_threshold;
    vault.witnesses_confirmed = 0;
    vault.status = VaultStatus::Active;
    vault.veto_deadline = 0;
    vault.bump = ctx.bumps.vault;

    let beneficiary_list = &mut ctx.accounts.beneficiary_list;
    beneficiary_list.vault = vault.key();
    beneficiary_list.bump = ctx.bumps.beneficiary_list;
    beneficiary_list.entries = beneficiaries;
    require!(beneficiary_list.validate_shares(), LegacyError::InvalidShares);

    let witness_registry = &mut ctx.accounts.witness_registry;
    witness_registry.vault = vault.key();
    witness_registry.bump = ctx.bumps.witness_registry;
    witness_registry.entries = witnesses.into_iter().map(|pubkey| WitnessEntry {
        pubkey,
        confirmed: false,
        confirmed_at: 0,
    }).collect();

    emit!(VaultInitialized {
        vault: vault.key(),
        owner: vault.owner,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    pub vault: Account<'info, LegacyVault>,
    
    #[account(
        mut,
        seeds = [BeneficiaryList::SEED_PREFIX, vault.key().as_ref()],
        bump = beneficiary_list.bump
    )]
    pub beneficiary_list: Account<'info, BeneficiaryList>,

    #[account(
        mut,
        seeds = [WitnessRegistry::SEED_PREFIX, vault.key().as_ref()],
        bump = witness_registry.bump
    )]
    pub witness_registry: Account<'info, WitnessRegistry>,

    pub owner: Signer<'info>,
}

pub fn update_config(
    ctx: Context<UpdateConfig>,
    inactivity_threshold_days: Option<u16>,
    veto_period_days: Option<u16>,
    witness_threshold: Option<u8>,
    beneficiaries: Option<Vec<BeneficiaryEntry>>,
    witnesses: Option<Vec<Pubkey>>,
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::Active, LegacyError::NotActive);

    let clock = Clock::get()?;

    if let Some(threshold) = inactivity_threshold_days {
        vault.inactivity_threshold_days = threshold;
    }
    if let Some(period) = veto_period_days {
        vault.veto_period_days = period;
    }

    if let Some(w_list) = witnesses {
        let threshold = witness_threshold.unwrap_or(vault.witness_threshold);
        require!(threshold <= w_list.len() as u8, LegacyError::InvalidWitnessThreshold);
        vault.witness_threshold = threshold;

        let witness_registry = &mut ctx.accounts.witness_registry;
        witness_registry.entries = w_list.into_iter().map(|pubkey| WitnessEntry {
            pubkey,
            confirmed: false,
            confirmed_at: 0,
        }).collect();
    } else if let Some(threshold) = witness_threshold {
        let witness_registry = &ctx.accounts.witness_registry;
        require!(threshold <= witness_registry.entries.len() as u8, LegacyError::InvalidWitnessThreshold);
        vault.witness_threshold = threshold;
    }

    if let Some(b_list) = beneficiaries {
        let beneficiary_list = &mut ctx.accounts.beneficiary_list;
        beneficiary_list.entries = b_list;
        require!(beneficiary_list.validate_shares(), LegacyError::InvalidShares);
        
        emit!(BeneficiaryListUpdated {
            vault: vault.key(),
            timestamp: clock.unix_timestamp,
        });
    }

    emit!(VaultConfigUpdated {
        vault: vault.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
