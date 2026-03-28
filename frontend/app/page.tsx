"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLegacyLock } from "./hooks/useLegacyLock";
import LegacyLockModal from "./components/LegacyLockModal";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { connected } = useWallet();
    const { vaultData, isModalOpen, setIsModalOpen, pingAlive, isLoading } = useLegacyLock();

    return (
        <main className="min-h-screen flex flex-col items-center selection:bg-[#9945FF]/30">
            {connected && (
                <header className="w-full max-w-5xl flex justify-between items-center p-6 mb-8 mt-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#9945FF] to-[#14F195]"></div>
                        <h1 className="text-xl font-bold tracking-tight">LegacyLock</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {vaultData && <Button variant="outline" className="border-white/10 hover:bg-white/10" onClick={pingAlive} disabled={isLoading}>Ping Alive</Button>}
                        <WalletMultiButton className="!bg-white !text-black hover:!bg-neutral-200 !font-semibold !rounded-xl !h-10" />
                    </div>
                </header>
            )}

            {!connected ? (
                <LandingPage />
            ) : (
                <div className="w-full max-w-5xl px-6">
                    {!vaultData ? (
                        <div className="flex flex-col items-center justify-center mt-24 text-center">
                            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center">
                                <span className="text-4xl text-neutral-500">🔒</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">No Vault Found</h2>
                            <p className="text-neutral-400 mb-8 max-w-md">You haven't initialized your Legacy Lock vault yet. Secure your digital assets today.</p>
                            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 text-lg px-8 py-6 rounded-xl font-semibold" onClick={() => setIsModalOpen(true)}>
                                Initialize Legacy Lock
                            </Button>
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
