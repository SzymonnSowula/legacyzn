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
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl">Vault Overview</CardTitle>
                    <CardDescription>Manage and monitor your legacy lock</CardDescription>
                </div>
                <StatusBadge status={vaultData.status} />
            </CardHeader>
            <CardContent className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 rounded-lg p-4 border">
                        <p className="text-sm text-neutral-400 mb-1">Last Ping</p>
                        <p className="font-medium text-lg">{vaultData.status.vetoPeriod ? "N/A" : timeLeft}</p>
                    </div>
                    {vaultData.status.vetoPeriod && (
                        <div className="bg-orange-950/20 rounded-lg p-4 border border-orange-900/50">
                            <p className="text-sm text-orange-500 mb-1">Veto Deadline</p>
                            <p className="font-medium text-lg text-orange-400">{timeLeft}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Witness Confirmations</span>
                        <span className="font-medium">{vaultData.witnessesConfirmed} / {vaultData.witnessThreshold}</span>
                    </div>
                    <Progress value={confirmationProgress} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {vaultData.status.active && isOwner && (
                        <Button onClick={pingAlive} disabled={isLoading} className="flex-1">Ping Alive</Button>
                    )}
                    {vaultData.status.active && !isOwner && (
                        <Button variant="secondary" onClick={confirmInactivity} disabled={isLoading} className="flex-1">Confirm Inactivity</Button>
                    )}
                    {vaultData.status.witnessVoting && !isOwner && (
                        <Button variant="secondary" onClick={confirmInactivity} disabled={isLoading} className="flex-1">Confirm Inactivity</Button>
                    )}
                    {vaultData.status.vetoPeriod && isOwner && (
                        <Button variant="destructive" onClick={ownerCancelVeto} disabled={isLoading} className="flex-1">Veto</Button>
                    )}
                    {vaultData.status.vetoPeriod && !isOwner && timeLeft === "Deadline Passed" && (
                         <Button onClick={executeInheritance} disabled={isLoading} className="flex-1">Execute Inheritance</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
