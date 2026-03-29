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
        <div className="w-full relative overflow-hidden bg-neutral-950/40 border border-white/5 backdrop-blur-3xl p-10 space-y-12">
            
            <header className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                        Security Protocol
                    </h3>
                    <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-black">Active Legacy Vault Monitoring</p>
                </div>
                <StatusBadge status={vaultData.status} />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timer Area */}
                <div className={`p-8 border ${vaultData.status.vetoPeriod ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/[0.02] border-white/5'} transition-all`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Last Observed Activity</span>
                    </div>
                    <p className={`font-black text-4xl tracking-tighter uppercase italic ${vaultData.status.vetoPeriod ? 'text-rose-400' : 'text-white'}`}>
                        {vaultData.status.vetoPeriod ? "LOCKED" : timeLeft}
                    </p>
                    {vaultData.status.vetoPeriod && (
                        <p className="text-[10px] text-rose-500/60 font-black mt-2 uppercase tracking-[0.2em] italic">Veto Period Active</p>
                    )}
                </div>

                {/* Veto Area */}
                {vaultData.status.vetoPeriod && (
                    <div className="p-8 bg-neutral-900 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Veto Expiry</span>
                        </div>
                        <p className="font-black text-4xl text-rose-500 tracking-tighter uppercase italic">{timeLeft}</p>
                    </div>
                )}

                {/* Confirmations Area (if not veto period) */}
                {!vaultData.status.vetoPeriod && (
                    <div className="p-8 bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                               <Users className="w-3.5 h-3.5 text-white/30" />
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Witness Registry</span>
                            </div>
                            <span className="text-xl font-black text-white italic tracking-tighter uppercase">{vaultData.witnessesConfirmed} <span className="text-white/20 text-xs">/ {vaultData.witnessThreshold}</span></span>
                        </div>
                        <Progress value={confirmationProgress} className="h-[2px] bg-white/5 [&>div]:bg-white rounded-none" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <footer className="flex flex-wrap gap-4 pt-4">
                {vaultData.status.active && isOwner && (
                    <Button onClick={pingAlive} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 transition-all font-black h-16 text-[10px] uppercase tracking-[0.4em] rounded-none shadow-2xl italic group">
                        Confirm Presence
                        <ArrowRight className="w-3 h-3 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
                {vaultData.status.active && !isOwner && (
                    <Button variant="outline" onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-transparent border-white/10 text-white/40 hover:text-white hover:bg-white/5 h-16 text-[10px] uppercase tracking-[0.3em] rounded-none font-black italic">Report Inactivity</Button>
                )}
                {vaultData.status.witnessVoting && !isOwner && (
                    <Button onClick={confirmInactivity} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 h-16 text-[10px] uppercase tracking-[0.4em] rounded-none font-black shadow-2xl italic">Certify Absence</Button>
                )}
                {vaultData.status.vetoPeriod && isOwner && (
                    <Button onClick={ownerCancelVeto} disabled={isLoading} className="flex-1 bg-rose-600 text-white hover:bg-rose-700 h-16 text-[10px] uppercase tracking-[0.4em] rounded-none font-black shadow-2xl italic">
                        Cancel Protocol Execution
                    </Button>
                )}
                {vaultData.status.vetoPeriod && !isOwner && timeLeft === "Deadline Passed" && (
                    <Button onClick={executeInheritance} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 h-16 text-[10px] uppercase tracking-[0.4em] rounded-none font-black shadow-2xl italic">
                        Finalize Legacy Transfer
                    </Button>
                )}
            </footer>
        </div>
    );
}
