"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLegacyLock } from "./hooks/useLegacyLock";
import LegacyLockModal from "./components/LegacyLockModal";
import Dashboard from "./components/Dashboard";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { connected } = useWallet();
    const { vaultData, isModalOpen, setIsModalOpen, pingAlive, isLoading } = useLegacyLock();

    return (
        <main className="min-h-screen p-6 flex flex-col items-center">
            <header className="w-full max-w-5xl flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary"></div>
                    <h1 className="text-2xl font-bold">LegacyLock</h1>
                </div>
                <div className="flex items-center gap-4">
                    {connected && vaultData && <Button variant="outline" onClick={pingAlive} disabled={isLoading}>Ping Alive</Button>}
                    <WalletMultiButton className="!bg-neutral-800 hover:!bg-neutral-700 !rounded-md" />
                </div>
            </header>

            {!connected ? (
                <div className="flex flex-col items-center justify-center mt-24 text-center">
                    <h2 className="text-4xl font-extrabold mb-4">Secure Your Legacy</h2>
                    <p className="text-neutral-400 max-w-lg mb-8 text-lg">
                        A decentralized inheritance protocol on Solana. Lock your assets and pass them on safely to your desired beneficiaries.
                    </p>
                    <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !rounded-md" />
                </div>
            ) : (
                <div className="w-full max-w-5xl">
                    {!vaultData ? (
                        <div className="flex flex-col items-center justify-center mt-24">
                            <h2 className="text-3xl font-bold mb-4">No Vault Found</h2>
                            <p className="text-neutral-400 mb-8">You haven't initialized your Legacy Lock vault yet.</p>
                            <Button size="lg" onClick={() => setIsModalOpen(true)}>Initialize Legacy Lock</Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-12">
                            <div className="md:col-span-12 lg:col-span-8">
                                <Dashboard />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <LegacyLockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </main>
    );
}
