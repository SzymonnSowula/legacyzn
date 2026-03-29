use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::errors::LegacyError;
use crate::events::{InheritanceExecuted, TokenInheritanceExecuted};

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

    // 3. Ustawienie statusu na Executed.
    vault.status = VaultStatus::Executed;

    // 4. Emisja zdarzenia InheritanceExecuted.
    emit!(InheritanceExecuted {
        vault: vault.key(),
        owner: vault.owner,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}



#[derive(Accounts)]
pub struct ExecuteTokenInheritance<'info> {
    #[account(
        seeds = [LegacyVault::SEED_PREFIX, vault.owner.as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, LegacyVault>,

    #[account(
        seeds = [BeneficiaryList::SEED_PREFIX, vault.key().as_ref()],
        bump = beneficiary_list.bump
    )]
    pub beneficiary_list: Account<'info, BeneficiaryList>,

    #[account(
        mut,
        constraint = owner_token_account.owner == vault.owner @ LegacyError::InvalidTokenOwner,
        constraint = owner_token_account.mint == mint.key() @ LegacyError::InvalidMint,
    )]
    pub owner_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = claimant,
        associated_token::mint = mint,
        associated_token::authority = claimant,
        associated_token::token_program = token_program,
    )]
    pub beneficiary_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = claimant,
        space = 8 + TokenClaimReceipt::INIT_SPACE,
        seeds = [
            TokenClaimReceipt::SEED_PREFIX,
            vault.key().as_ref(),
            claimant.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub claim_receipt: Account<'info, TokenClaimReceipt>,

    #[account(mut)]
    pub claimant: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: InterfaceProgram<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn execute_token_inheritance(ctx: Context<ExecuteTokenInheritance>) -> Result<()> {
    let vault = &ctx.accounts.vault;
    require!(vault.status == VaultStatus::Executed, LegacyError::NotExecuted);

    let beneficiary_list = &ctx.accounts.beneficiary_list;
    let owner_token_account = &ctx.accounts.owner_token_account;

    require!(owner_token_account.amount > 0, LegacyError::NoTokensToTransfer);

    // Find the share for this claimant
    let entry = beneficiary_list.entries.iter()
        .find(|e| e.pubkey == ctx.accounts.claimant.key())
        .ok_or(LegacyError::Unauthorized)?;

    // Calculate share (floor division)
    let amount = (owner_token_account.amount as u128)
        .checked_mul(entry.share_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;

    require!(amount > 0, LegacyError::NoTokensToTransfer);

    // Cross-program invocation – Transfer tokens
    // Authority is the vault PDA as Permanent Delegate
    let owner_key = vault.owner;
    let seeds = &[
        LegacyVault::SEED_PREFIX,
        owner_key.as_ref(),
        &[vault.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = TransferChecked {
        from: owner_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.beneficiary_token_account.to_account_info(),
        authority: vault.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );

    token_interface::transfer_checked(
        cpi_ctx,
        amount,
        ctx.accounts.mint.decimals,
    )?;

    // Record the receipt
    let receipt = &mut ctx.accounts.claim_receipt;
    receipt.vault = vault.key();
    receipt.beneficiary = ctx.accounts.claimant.key();
    receipt.mint = ctx.accounts.mint.key();
    receipt.claimed_amount = amount;
    receipt.claimed_at = Clock::get()?.unix_timestamp;
    receipt.bump = ctx.bumps.claim_receipt;

    emit!(TokenInheritanceExecuted {
        vault: vault.key(),
        claimant: ctx.accounts.claimant.key(),
        mint: ctx.accounts.mint.key(),
        amount,
        timestamp: receipt.claimed_at,
    });

    Ok(())
}
