use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{InheritanceExecuted, SolClaimed, TokenInheritanceExecuted};

#[derive(Accounts)]
pub struct ExecuteInheritance<'info> {
    /// The vault to be executed.
    #[account(mut)]
    pub vault: Account<'info, LegacyVault>,
    /// Any signer can trigger the execution once the veto period has passed.
    pub signer: Signer<'info>,
}

/// Executes the inheritance process.
/// This can be called by anyone after the VetoPeriod has passed (now > veto_deadline).
/// It sets the vault status to Executed, allowing beneficiaries to claim their shares.
pub fn execute_inheritance(ctx: Context<ExecuteInheritance>) -> Result<()> {
    let current_lamports = ctx.accounts.vault.to_account_info().lamports();
    let vault = &mut ctx.accounts.vault;

    // 1. Wymagany status: VetoPeriod.
    require!(
        vault.status == VaultStatus::VetoPeriod, 
        LegacyError::NotInVetoPeriod
    );

    let clock = Clock::get()?;

    // 2. Sprawdzenie czy okres veto minął.
    require!(
        vault.is_veto_deadline_passed(clock.unix_timestamp),
        LegacyError::VetoDeadlineNotPassed
    );

    // 3. Ustawienie statusu na Executed i wykonanie snapshotu balansu.
    vault.status = VaultStatus::Executed;
    vault.total_locked_sol = current_lamports;

    // 4. Emisja zdarzenia InheritanceExecuted.
    emit!(InheritanceExecuted {
        vault: vault.key(),
        owner: vault.owner,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(beneficiary_index: u8)]
pub struct ClaimSol<'info> {
    #[account(
        mut,
        seeds = [LegacyVault::SEED_PREFIX, vault.owner.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, LegacyVault>,
    
    #[account(
        mut,
        seeds = [BeneficiaryList::SEED_PREFIX, vault.key().as_ref()],
        bump = beneficiary_list.bump
    )]
    pub beneficiary_list: Account<'info, BeneficiaryList>,

    #[account(mut)]
    pub claimant: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn claim_sol(ctx: Context<ClaimSol>, beneficiary_index: u8) -> Result<()> {
    let vault = &ctx.accounts.vault;
    require!(vault.status == VaultStatus::Executed, LegacyError::NotExecuted);

    let beneficiary_list = &mut ctx.accounts.beneficiary_list;
    let entry = &mut beneficiary_list.entries[beneficiary_index as usize];
    
    require!(ctx.accounts.claimant.key() == entry.pubkey, LegacyError::Unauthorized);
    require!(!entry.sol_claimed, LegacyError::SolAlreadyClaimed);

    entry.sol_claimed = true;

    // Wyliczenie payout na podstawie zablokowanego snapshotu (total_locked_sol).
    // Zapobiega to błędowi, w którym wypłata jednego beneficjenta pomniejsza bazę dla kolejnych.
    let payout = ((vault.total_locked_sol as u128) * (entry.share_bps as u128) / 10000) as u64;

    ctx.accounts.vault.sub_lamports(payout)?;
    ctx.accounts.claimant.add_lamports(payout)?;

    let clock = Clock::get()?;
    emit!(SolClaimed {
        vault: vault.key(),
        beneficiary: ctx.accounts.claimant.key(),
        amount: payout,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
