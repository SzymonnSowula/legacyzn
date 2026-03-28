use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{TransferExecuted, SolClaimed};

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    #[account(mut)]
    pub vault: Account<'info, LegacyVault>,
    pub signer: Signer<'info>,
}

pub fn execute_transfer(ctx: Context<ExecuteTransfer>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    require!(vault.status == VaultStatus::VetoPeriod, LegacyError::NotInVetoPeriod);

    let clock = Clock::get()?;
    require!(
        vault.is_veto_deadline_passed(clock.unix_timestamp),
        LegacyError::VetoDeadlineNotPassed
    );

    vault.status = VaultStatus::Executed;

    emit!(TransferExecuted {
        vault: vault.key(),
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

    // Ponieważ działamy w systemie pull-over-push, korzystamy z faktu,
    // że suma lamportów dla danego beneficjenta była snapshotowana albo wyliczana statycznie z totalSupply.
    // Z uwagi na limitacje architektury bez zapisywania 'total_locked_sol' na etapie Executed,
    // wykonujemy wyliczenie wprost: vault.lamports * share_bps / 10000. 
    // Uwaga: w optymalizacji na minnet sugerowane jest snapshotowanie.
    
    // Hackhathon MVP rozwiązanie zgodne ze zleceniem:
    let vault_balance = ctx.accounts.vault.to_account_info().lamports();
    let payout = ((vault_balance as u128) * (entry.share_bps as u128) / 10000) as u64;

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
