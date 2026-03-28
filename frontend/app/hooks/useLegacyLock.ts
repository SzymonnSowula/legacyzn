"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { SystemProgram } from '@solana/web3.js';
import { 
    getVaultPDA, 
    getBeneficiaryListPDA, 
    getWitnessRegistryPDA,
    getLegacyLockProgram 
} from '../lib/anchor';
import { toast } from 'sonner';

// IMPORT YOUR IDL JSON FILE HERE
// import IDL from '../lib/legacy_lock_program.json';
const IDL: any = {}; // Zastąp zaimportowanym IDL gdy bedzie w folderze

export function useLegacyLock() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [vaultData, setVaultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getProvider = useCallback(() => {
        if (!wallet || !wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
        return new AnchorProvider(
            connection, 
            wallet as any, 
            AnchorProvider.defaultOptions()
        );
    }, [wallet, connection]);

    const refreshVault = useCallback(async () => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey) return;

        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(wallet.publicKey);
            const data = await program.account.legacyVault.fetchNullable(vaultPDA);
            setVaultData(data);
        } catch (error) {
            console.error("No vault found or error fetching", error);
            setVaultData(null);
        }
    }, [getProvider, wallet.publicKey]);

    // Auto-refresh co 10 sekund
    useEffect(() => {
        refreshVault();
        const interval = setInterval(refreshVault, 10000);
        return () => clearInterval(interval);
    }, [refreshVault]);

    const initializeVault = async (inactivityThresholdDays: number, vetoPeriodDays: number, witnessThreshold: number) => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(wallet.publicKey);
            const [beneficiaryPDA] = getBeneficiaryListPDA(vaultPDA);
            const [witnessRegistryPDA] = getWitnessRegistryPDA(vaultPDA);

            // Using dummy beneficiaries and witnesses for Hackathon MVP, mapping back to self just to satisfy constraints
            const dummyBeneficiaries = [{
                pubkey: wallet.publicKey,
                shareBps: 10000,
                solClaimed: false
            }];
            const dummyWitnesses = [wallet.publicKey];

            const tx = await program.methods.initializeVault(
                inactivityThresholdDays,
                vetoPeriodDays,
                witnessThreshold,
                dummyBeneficiaries,
                dummyWitnesses
            )
            .accounts({
                vault: vaultPDA,
                beneficiaryList: beneficiaryPDA,
                witnessRegistry: witnessRegistryPDA,
                owner: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

            toast.success("Vault Initialized!", { description: `TX: ${tx}` });
            await refreshVault();
        } catch (error: any) {
            toast.error("Failed to initialize vault", { description: error.message });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const pingAlive = async () => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(wallet.publicKey); // Assumes you ping your own vault

            const tx = await program.methods.pingAlive()
                .accounts({
                    vault: vaultPDA,
                    owner: wallet.publicKey,
                })
                .rpc();

            toast.success("Ping successful", { description: "Your activity has been confirmed." });
            await refreshVault();
        } catch (error: any) {
            toast.error("Ping failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const ownerCancelVeto = async () => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(wallet.publicKey);
            const [witnessRegistryPDA] = getWitnessRegistryPDA(vaultPDA);

            const tx = await program.methods.ownerCancel()
                .accounts({
                    vault: vaultPDA,
                    witnessRegistry: witnessRegistryPDA,
                    owner: wallet.publicKey,
                })
                .rpc();

            toast.success("Veto Successful", { description: "The execution has been cancelled." });
            await refreshVault();
        } catch (error: any) {
            toast.error("Veto failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmInactivity = async () => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey || !vaultData) return toast.error("Wallet not connected");
        
        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            // In a real app, you would pass the owner pubkey of the vault you want to witness
            // Here we assume it for MVP
            const [vaultPDA] = getVaultPDA(vaultData.owner); 
            const [witnessRegistryPDA] = getWitnessRegistryPDA(vaultPDA);

            const tx = await program.methods.confirmInactivity()
                .accounts({
                    vault: vaultPDA,
                    witnessRegistry: witnessRegistryPDA,
                    witness: wallet.publicKey,
                })
                .rpc();

            toast.success("Inactivity Confirmed", { description: "Your witness vote has been recorded." });
            await refreshVault();
        } catch (error: any) {
            toast.error("Witness vote failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const executeInheritance = async () => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey || !vaultData) return toast.error("Wallet not connected");

        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(vaultData.owner); 
            
            const tx = await program.methods.executeTransfer()
                .accounts({
                    vault: vaultPDA,
                    signer: wallet.publicKey,
                })
                .rpc();

            toast.success("Inheritance Executed", { description: "The vault has been triggered for claim." });
            await refreshVault();
        } catch (error: any) {
            toast.error("Execution failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        vaultData,
        isLoading,
        isModalOpen,
        setIsModalOpen,
        refreshVault,
        initializeVault,
        pingAlive,
        ownerCancelVeto,
        confirmInactivity,
        executeInheritance
    };
}
