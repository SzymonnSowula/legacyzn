use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use spl_transfer_hook_interface::instruction::TransferHookInstruction;
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta,
    seeds::Seed,
    state::ExtraAccountMetaList,
};
use legacy_lock_common::{LegacyVault, VaultStatus, VAULT_SEED};

// The program ID of the main Legacy Lock program
pub const LEGACY_LOCK_PROGRAM_ID: Pubkey = pubkey!("J8k4XDzw1yKwXg2kKmL6Px1WzTJ4qfKKWEehfyDLRjSy");

declare_id!("EP1HPZqUhFsLCXWLR9rzfXYr8KMEQTnEafHjBxf1FyYP");

#[program]
pub mod legacy_lock_hook {
    use super::*;

    /// Initializes the extra account meta list for a specific mint.
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        let extra_account_metas = vec![
            // Index 3 of the transfer instruction is the owner.
            // We derive the LegacyVault PDA: ["vault", owner_key]
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal { bytes: VAULT_SEED.to_vec() },
                    Seed::AccountKey { index: 3 },
                ],
                false, // is_signer
                false, // is_writable
            )?
        ];

        let account_info = ctx.accounts.extra_account_meta_list.to_account_info();
        let mut data = account_info.try_borrow_mut_data()?;
        ExtraAccountMetaList::init::<TransferHookInstruction>(
            &mut data,
            &extra_account_metas,
        )?;

        Ok(())
    }

    /// The actual transfer hook execution.
    pub fn execute(ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
        let vault_info = &ctx.remaining_accounts[0];
        
        // 1. DROBNE: Obsługa przypadku gdy vault nie istnieje (puste dane)
        if vault_info.data_is_empty() {
            return Err(error!(HookError::VaultNotFound));
        }

        // 2. ISTOTNE: Weryfikacja właściciela programu
        if vault_info.owner != &LEGACY_LOCK_PROGRAM_ID {
            return Err(error!(HookError::InvalidVaultOwner));
        }

        // 3. ISTOTNE: Weryfikacja PDA vaultu (czy to właściwy skarbiec dla tego ownera?)
        let (expected_vault, _) = Pubkey::find_program_address(
            &[VAULT_SEED, ctx.accounts.owner.key().as_ref()],
            &LEGACY_LOCK_PROGRAM_ID,
        );
        if vault_info.key() != expected_vault {
            return Err(error!(HookError::InvalidVaultPDA));
        }

        // 4. KRYTYCZNE: Bezpieczna deserializacja za pomocą współdzielonej struktury
        let mut vault_data: &[u8] = &vault_info.try_borrow_data()?;
        let vault = LegacyVault::try_deserialize(&mut vault_data)?;

        // 5. Logika blokowania
        match vault.status {
            VaultStatus::Active | VaultStatus::Executed => Ok(()),
            VaultStatus::WitnessVoting | VaultStatus::VetoPeriod => {
                Err(error!(HookError::TransferBlockedByInheritance))
            }
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This account stores the metadata.
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        payer = payer,
        space = EXTRA_META_LIST_SIZE
    )]
    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub system_program: Program<'info, SystemProgram>,
}

// KRYTYCZNE: Stosujemy bezpieczny bufor (ExtraAccountMetaList::size_of(1) to ok. 47-96 bajtów)
pub const EXTRA_META_LIST_SIZE: usize = 128;

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: Source token account
    pub source_token: UncheckedAccount<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    /// CHECK: Destination token account
    pub destination_token: UncheckedAccount<'info>,
    /// CHECK: Owner of the transfer - used for PDA derivation
    pub owner: UncheckedAccount<'info>,
    /// CHECK: The extra account meta list.
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
}

#[error_code]
pub enum HookError {
    #[msg("Transfer is blocked by an ongoing inheritance process (WitnessVoting or VetoPeriod).")]
    TransferBlockedByInheritance,
    #[msg("The vault provided does not belong to the Legacy Lock program.")]
    InvalidVaultOwner,
    #[msg("The vault account provided is not the correct PDA for this owner.")]
    InvalidVaultPDA,
    #[msg("Legacy Vault not found for this owner.")]
    VaultNotFound,
}
