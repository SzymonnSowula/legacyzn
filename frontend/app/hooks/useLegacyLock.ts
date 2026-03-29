"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { SystemProgram, PublicKey } from '@solana/web3.js';
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
    const [balance, setBalance] = useState<number>(0);
    const [solPrice, setSolPrice] = useState<number>(0);
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

            // Fetch everything in parallel
            const fetchPrice = async () => {
                try {
                    const response = await fetch('https://api.jup.ag/price/v2/simple?ids=So11111111111111111111111111111111111111112', {
                        headers: {
                            'x-api-key': '30c1c0c7-23e8-42c8-98c3-eb688e0cb0c4'
                        }
                    });
                    const json = await response.json();
                    return parseFloat(json.data.So11111111111111111111111111111111111111112.price);
                } catch (e) {
                    return 0;
                }
            };

            const [vaultAccount, currentBalance, price] = await Promise.all([
                (program.account as any).legacyVault.fetchNullable(vaultPDA),
                connection.getBalance(wallet.publicKey),
                fetchPrice()
            ]);

            setVaultData(vaultAccount);
            setBalance(currentBalance / 1000000000); // lamports to SOL
            setSolPrice(price);
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

    const initializeVault = async (
        inactivityThresholdDays: number,
        vetoPeriodDays: number,
        witnessThreshold: number,
        beneficiaries: { pubkey: string, shareBps: number }[],
        witnesses: string[]
    ) => {
        const provider = getProvider();
        if (!provider || !wallet.publicKey) return toast.error("Wallet not connected");

        setIsLoading(true);
        try {
            const program = getLegacyLockProgram(provider, IDL);
            const [vaultPDA] = getVaultPDA(wallet.publicKey);
            const [beneficiaryPDA] = getBeneficiaryListPDA(vaultPDA);
            const [witnessRegistryPDA] = getWitnessRegistryPDA(vaultPDA);

            // Validacja i konwersja do typów Anchor
            const formattedBeneficiaries = beneficiaries.map(b => ({
                pubkey: new PublicKey(b.pubkey),
                shareBps: b.shareBps,
                solClaimed: false
            }));
            const formattedWitnesses = witnesses.map(w => new PublicKey(w));

            const tx = await program.methods.initializeVault(
                inactivityThresholdDays,
                vetoPeriodDays,
                witnessThreshold,
                formattedBeneficiaries,
                formattedWitnesses
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
        balance,
        solPrice,
        usdValue: balance * solPrice,
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
