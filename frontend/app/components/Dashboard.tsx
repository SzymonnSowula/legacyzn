"use client";

import { useLegacyLock } from "../hooks/useLegacyLock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "./StatusBadge";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Dashboard() {
    const { publicKey } = useWallet();
    const { vaultData, isLoading, pingAlive, ownerCancelVeto, confirmInactivity, executeInheritance } = useLegacyLock();
    const [timeLeft, setTimeLeft] = useState<string>("");
    
    useEffect(() => {
        if (!vaultData) return;
        const updateTimer = () => {
            if (vaultData.status.vetoPeriod) {
                const now = Math.floor(Date.now() / 1000);
                const diff = vaultData.vetoDeadline.toNumber() - now;
                if (diff <= 0) {
                    setTimeLeft("Deadline Passed");
                } else {
                    const days = Math.floor(diff / 86400);
                    const hours = Math.floor((diff % 86400) / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    setTimeLeft(`${days}d ${hours}h ${minutes}m`);
                }
            } else {
                const now = Math.floor(Date.now() / 1000);
                const diff = now - vaultData.lastPingTs.toNumber();
                const days = Math.floor(diff / 86400);
                const hours = Math.floor((diff % 86400) / 3600);
                setTimeLeft(`${days}d ${hours}h ago`);
            }
        };
        updateTimer();
        const int = setInterval(updateTimer, 60000);
        return () => clearInterval(int);
    }, [vaultData]);

    if (!vaultData) return null;

    const isOwner = publicKey?.toBase58() === vaultData.owner.toBase58();
    const confirmationProgress = (vaultData.witnessesConfirmed / vaultData.witnessThreshold) * 100;

    return (
        <Card className="w-full relative overflow-hidden bg-black/40 border border-[#14F195]/20 backdrop-blur-xl shadow-[0_0_40px_rgba(20,241,149,0.05)] rounded-2xl">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#14F195]/5 blur-[80px] rounded-full pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 bg-white/[0.02]">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse shadow-[0_0_8px_#14F195]"></span>
                        Vault Overview
                    </CardTitle>
                    <CardDescription className="text-neutral-400">Manage and monitor your legacy lock</CardDescription>
                </div>
                <StatusBadge status={vaultData.status} />
            </CardHeader>
            <CardContent className="space-y-6 mt-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/[0.07]">
                        <p className="text-sm font-medium text-[#14F195] mb-1 opacity-80 uppercase tracking-wider">Last Ping</p>
                        <p className="font-bold text-2xl text-white tracking-tight">{vaultData.status.vetoPeriod ? "N/A" : timeLeft}</p>
                    </div>
                    {vaultData.status.vetoPeriod && (
                        <div className="bg-orange-500/10 rounded-xl p-5 border border-orange-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                            <p className="text-sm font-medium text-orange-400 mb-1 uppercase tracking-wider">Veto Deadline</p>
                            <p className="font-bold text-2xl text-orange-300 tracking-tight">{timeLeft}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-neutral-400 font-medium">Witness Confirmations</span>
                        <span className="font-bold text-[#14F195]">{vaultData.witnessesConfirmed} <span className="text-neutral-500">/ {vaultData.witnessThreshold}</span></span>
                    </div>
                    <Progress value={confirmationProgress} className="h-2 bg-neutral-800 [&>div]:bg-gradient-to-r [&>div]:from-[#14F195] [&>div]:to-[#9945FF]" />
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                    {vaultData.status.active && isOwner && (
                        <Button onClick={pingAlive} disabled={isLoading} className="flex-1 bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/30 hover:bg-[#14F195]/20 hover:text-[#14F195] hover:shadow-[0_0_15px_rgba(20,241,149,0.2)] transition-all font-bold h-12 text-md rounded-xl">
                            Ping Alive (Reset Timer)
                        </Button>
                    )}
                    {vaultData.status.active && !isOwner && (
                        <Button variant="secondary" onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10 h-12 text-md rounded-xl font-medium">Verify Inactivity</Button>
                    )}
                    {vaultData.status.witnessVoting && !isOwner && (
                        <Button variant="secondary" onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/30 hover:bg-[#14F195]/20 hover:shadow-[0_0_15px_rgba(20,241,149,0.2)] h-12 text-md rounded-xl font-bold">Vote Inactive</Button>
                    )}
                    {vaultData.status.vetoPeriod && isOwner && (
                        <Button variant="destructive" onClick={ownerCancelVeto} disabled={isLoading} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] h-12 text-md rounded-xl font-bold">
                            Veto (Cancel Transfer)
                        </Button>
                    )}
                    {vaultData.status.vetoPeriod && !isOwner && timeLeft === "Deadline Passed" && (
                         <Button onClick={executeInheritance} disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#14F195] to-[#9945FF] text-white hover:opacity-90 shadow-[0_0_20px_rgba(20,241,149,0.3)] h-12 text-md rounded-xl font-bold border-none">
                             Execute Inheritance
                         </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
