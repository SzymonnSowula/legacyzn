"use client";

import { useLegacyLock } from "../../hooks/useLegacyLock";
import Dashboard from "../../components/Dashboard";
import { Button } from "@/components/ui/button";
import LegacyLockModal from "../../components/LegacyLockModal";

export default function VaultPage() {
    const { vaultData, isModalOpen, setIsModalOpen } = useLegacyLock();

    return (
        <div className="w-full space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Vault Control</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">Manage your automated legacy protocols</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-black px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-xl rounded-none"
                >
                    {vaultData ? 'Update Vault Settings' : 'Initialize Vault'}
                </Button>
            </header>

            {!vaultData ? (
                <div className="flex flex-col items-center justify-center p-20 border border-white/5 bg-white/[0.02] backdrop-blur-3xl text-center">
                    <span className="text-5xl mb-6">🔒</span>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Your Legacy is Not Secured</h3>
                    <p className="text-white/30 max-w-sm mt-4 text-sm font-medium leading-relaxed">Secure your Solana assets with an automated dead man's switch. You control the inactivity threshold and beneficiaries.</p>
                </div>
            ) : (
                <Dashboard />
            )}

            <LegacyLockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}
