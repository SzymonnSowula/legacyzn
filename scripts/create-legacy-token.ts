import * as anchor from "@coral-xyz/anchor";
import { 
    Connection, 
    Keypair, 
    PublicKey, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction 
} from "@solana/web3.js";
import { 
    createInitializeMintInstruction, 
    TOKEN_2022_PROGRAM_ID, 
    getMintLen, 
    ExtensionType, 
    createInitializePermanentDelegateInstruction,
    createInitializeTransferHookInstruction,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction
} from "@solana/spl-token";

/**
 * LUSDC Token Creation Script
 * Protocol: LegacyLock
 */

async function main() {
    const provider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    const payer = (provider.wallet as any).payer as Keypair;

    console.log("Starting LUSDC Token Creation...");
    console.log("Payer:", payer.publicKey.toBase58());

    // 1. Program IDs
    const LEGACY_LOCK_PROGRAM_ID = new PublicKey("J8k4XDzw1yKwXg2kKmL6Px1WzTJ4qfKKWEehfyDLRjSy");
    const HOOK_PROGRAM_ID = new PublicKey("EP1HPZqUhFsLCXWLR9rzfXYr8KMEQTnEafHjBxf1FyYP");

    // 2. Calculate Vault PDA (for Permanent Delegate)
    const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), payer.publicKey.toBuffer()],
        LEGACY_LOCK_PROGRAM_ID
    );
    console.log("Vault PDA (Permanent Delegate):", vaultPda.toBase58());

    // 3. Mint Setup
    const mint = Keypair.generate();
    const decimals = 6;
    
    // Extensions: PermanentDelegate + TransferHook
    const extensions = [ExtensionType.PermanentDelegate, ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    console.log("Mint Address:", mint.publicKey.toBase58());

    const transaction = new Transaction().add(
        // Create account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        // Register Permanent Delegate BEFORE mint initialization
        createInitializePermanentDelegateInstruction(
            mint.publicKey,
            vaultPda,
            TOKEN_2022_PROGRAM_ID
        ),
        // Register Transfer Hook
        createInitializeTransferHookInstruction(
            mint.publicKey,
            payer.publicKey, // Authority to update hook (set to owner for now)
            HOOK_PROGRAM_ID,
            TOKEN_2022_PROGRAM_ID
        ),
        // Initialize Mint
        createInitializeMintInstruction(
            mint.publicKey,
            decimals,
            payer.publicKey, // Mint Authority
            payer.publicKey, // Freeze Authority
            TOKEN_2022_PROGRAM_ID
        )
    );

    // 4. Initial Supply (Minting to creator)
    const ata = getAssociatedTokenAddressSync(mint.publicKey, payer.publicKey, false, TOKEN_2022_PROGRAM_ID);
    transaction.add(
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            ata,
            payer.publicKey,
            mint.publicKey,
            TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
            mint.publicKey,
            ata,
            payer.publicKey,
            1000_000_000, // 1000 LUSDC
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, mint]);
    console.log("✅ LUSDC Mint Created Successfully!");
    console.log("Transaction Signature:", signature);
    console.log("Mint Address:", mint.publicKey.toBase58());
}

main().catch(err => {
    console.error(err);
});
