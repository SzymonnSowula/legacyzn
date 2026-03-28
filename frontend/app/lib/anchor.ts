import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// PODMIEŃ TUTAJ SWÓJ PROGRAM ID:
export const LEGACY_LOCK_PROGRAM_ID = new PublicKey("J8k4XDzw1yKwXg2kKmL6Px1WzTJ4qfKKWEehfyDLRjSy");

// To będzie pochodzić z pliku IDL (możesz skopiować swój idl.json do folderu lib/ i odkomentować to)
// import idl from './legacy_lock_program.json'; 

// Jeśli posiadasz IDL z Coral/Anchor mozesz uzyc prawdziwego IDL. Tutaj uzywamy any jako placeholder:
export function getLegacyLockProgram(provider: AnchorProvider, idlRaw: any) {
    return new Program(idlRaw as any, provider);
}

export function getVaultPDA(owner: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), owner.toBuffer()],
        LEGACY_LOCK_PROGRAM_ID
    );
}

export function getBeneficiaryListPDA(vault: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("beneficiaries"), vault.toBuffer()],
        LEGACY_LOCK_PROGRAM_ID
    );
}

export function getWitnessRegistryPDA(vault: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("witnesses"), vault.toBuffer()],
        LEGACY_LOCK_PROGRAM_ID
    );
}
