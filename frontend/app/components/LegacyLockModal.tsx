"use client";

import { useLegacyLock } from "../hooks/useLegacyLock";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Keypair } from "@solana/web3.js";
import { toast } from "sonner";

export default function LegacyLockModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { initializeVault, isLoading } = useLegacyLock();
    const [inactivityDays, setInactivityDays] = useState("180");
    const [vetoDays, setVetoDays] = useState("30");
    const [witnessThreshold, setWitnessThreshold] = useState("1");

    const handleCreate = async () => {
        try {
            // Auto generate session key
            const sessionKeypair = Keypair.generate();
            const sessionSecret = Buffer.from(sessionKeypair.secretKey).toString('base64');
            window.localStorage.setItem('legacyLockSessionKey', sessionSecret);
            
            await initializeVault(
                parseInt(inactivityDays),
                parseInt(vetoDays),
                parseInt(witnessThreshold)
            );
            toast.success("Session Key Saved", { description: "Your temporary session key has been generated and saved securely." });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Initialize Legacy Lock</DialogTitle>
                    <DialogDescription>
                        Set up your vault parameters. A session key will be automatically generated and stored locally.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 mt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="inactivity">Inactivity Threshold (Days)</Label>
                        <Input id="inactivity" type="number" min="1" value={inactivityDays} onChange={(e) => setInactivityDays(e.target.value)} />
                        <p className="text-xs text-neutral-500">{(parseInt(inactivityDays) || 0) * 86400} seconds</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="veto">Veto Period (Days)</Label>
                        <Input id="veto" type="number" min="1" value={vetoDays} onChange={(e) => setVetoDays(e.target.value)} />
                        <p className="text-xs text-neutral-500">{(parseInt(vetoDays) || 0) * 86400} seconds</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="witness">Required Confirmations</Label>
                        <Input id="witness" type="number" min="1" max="10" value={witnessThreshold} onChange={(e) => setWitnessThreshold(e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isLoading}>Create Legacy Lock</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
