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

import IDL from '../lib/legacy_lock_program.json';

export function useLegacyLock() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [vaultData, setVaultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleError = useCallback((error: any, defaultTitle: string) => {
        const msg = error.message || "";
        console.error(`${defaultTitle}:`, error);
        
        if (msg.includes("Attempt to debit an account but found no record of a prior credit")) {
            toast.error("Brak środków", { 
                description: "Nie masz wystarczającej ilości SOL na koncie, aby opłacić transakcję. Skorzystaj z 'airdrop' na devnecie." 
            });
        } else {
            toast.error(defaultTitle, { description: msg });
        }
    }, []);

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
            const data = await (program.account as any).legacyVault.fetchNullable(vaultPDA);
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
            handleError(error, "Failed to initialize vault");
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
            handleError(error, "Ping failed");
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

            const tx = await program.methods.veto()
                .accounts({
                    vault: vaultPDA,
                    witnessRegistry: witnessRegistryPDA,
                    signer: wallet.publicKey,
                })
                .rpc();

            toast.success("Veto Successful", { description: "The execution has been cancelled." });
            await refreshVault();
        } catch (error: any) {
            handleError(error, "Veto failed");
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
            handleError(error, "Witness vote failed");
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
            
            const tx = await program.methods.executeInheritance()
                .accounts({
                    vault: vaultPDA,
                    signer: wallet.publicKey,
                })
                .rpc();

            toast.success("Inheritance Executed", { description: "The vault has been triggered for claim." });
            await refreshVault();
        } catch (error: any) {
            handleError(error, "Execution failed");
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
