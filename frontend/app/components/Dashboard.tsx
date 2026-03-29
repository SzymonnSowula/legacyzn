"use client";

import { useLegacyLock } from "../hooks/useLegacyLock";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "./StatusBadge";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Clock, Users, ArrowRight, ShieldAlert } from "lucide-react";

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
                    const seconds = diff % 60;
                    setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
                }
            } else {
                const now = Math.floor(Date.now() / 1000);
                const diff = now - vaultData.lastPingTs.toNumber();
                const days = Math.floor(diff / 86400);
                const hours = Math.floor((diff % 86400) / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;

                if (days > 0) {
                    setTimeLeft(`${days}d ${hours}h ${minutes}m ago`);
                } else if (hours > 0) {
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s ago`);
                } else {
                    setTimeLeft(`${minutes}m ${seconds}s ago`);
                }
            }
        };
        updateTimer();
        const int = setInterval(updateTimer, 1000);
        return () => clearInterval(int);
    }, [vaultData]);

    if (!vaultData) return null;

    const isOwner = publicKey?.toBase58() === vaultData.owner.toBase58();
    const confirmationProgress = (vaultData.witnessesConfirmed / vaultData.witnessThreshold) * 100;

    return (
        <div className="w-full relative overflow-hidden bg-neutral-950/40 border border-white/5 backdrop-blur-3xl p-10 space-y-12 rounded-[2.5rem]">

            <header className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                        Security Protocol
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest">Active Legacy Vault Monitoring</p>
                </div>
                <StatusBadge status={vaultData.status} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timer Area */}
                <div className={`p-8 border ${vaultData.status.vetoPeriod ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/2 border-white/5'} transition-all rounded-2xl`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Last Observed Activity</span>
                    </div>
                    <p className={`font-display font-bold text-5xl tracking-tighter uppercase ${vaultData.status.vetoPeriod ? 'text-rose-400' : 'text-white'}`}>
                        {vaultData.status.vetoPeriod ? "LOCKED" : timeLeft}
                    </p>
                    {vaultData.status.vetoPeriod && (
                        <p className="text-[10px] text-rose-500/60 font-mono font-bold mt-2 uppercase tracking-widest">Veto Period Active</p>
                    )}
                </div>

                {/* Veto Area */}
                {vaultData.status.vetoPeriod && (
                    <div className="p-8 bg-neutral-900 border border-white/10 shadow-2xl relative overflow-hidden group rounded-2xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Veto Expiry</span>
                        </div>
                        <p className="font-display font-bold text-5xl text-rose-500 tracking-tighter uppercase">{timeLeft}</p>
                    </div>
                )}

                {/* Confirmations Area (if not veto period) */}
                {!vaultData.status.vetoPeriod && (
                    <div className="bg-white/2 border border-white/10 p-8 space-y-6 rounded-2xl">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                                <Users className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">Witness Registry</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-white tracking-tighter uppercase">{vaultData.witnessesConfirmed} <span className="text-white/20 text-sm">/ {vaultData.witnessThreshold}</span></span>
                        </div>
                        <Progress value={confirmationProgress} className="h-[2px] bg-white/5 [&>div]:bg-white rounded-full" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <footer className="flex flex-wrap gap-4 pt-4">
                {vaultData.status.active && isOwner && (
                    <Button onClick={pingAlive} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 transition-all font-display font-bold h-16 text-xs uppercase tracking-widest rounded-2xl shadow-2xl group">
                        Confirm Presence
                        <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
                {vaultData.status.active && !isOwner && (
                    <Button variant="outline" onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-transparent border-white/10 text-white/50 hover:text-white hover:bg-white/5 h-16 text-xs uppercase tracking-widest rounded-2xl font-bold">Report Inactivity</Button>
                )}
                {vaultData.status.witnessVoting && !isOwner && (
                    <Button onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 h-16 text-xs uppercase tracking-widest rounded-2xl font-bold shadow-2xl">Certify Absence</Button>
                )}
                {vaultData.status.vetoPeriod && isOwner && (
                    <Button onClick={ownerCancelVeto} disabled={isLoading} className="flex-1 bg-rose-600 text-white hover:bg-rose-700 h-16 text-xs uppercase tracking-widest rounded-2xl font-bold shadow-2xl border-none">
                        Cancel Protocol Execution
                    </Button>
                )}
                {vaultData.status.vetoPeriod && !isOwner && timeLeft === "Deadline Passed" && (
                    <Button onClick={executeInheritance} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 h-16 text-xs uppercase tracking-widest rounded-2xl font-bold shadow-2xl">
                        Finalize Legacy Transfer
                    </Button>
                )}
            </footer>
        </div>
    );
}
