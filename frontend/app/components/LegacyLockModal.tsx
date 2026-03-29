"use client";

import { useLegacyLock } from "../hooks/useLegacyLock";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function LegacyLockModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const { initializeVault, isLoading } = useLegacyLock();
    const [inactivityDays, setInactivityDays] = useState("180");
    const [vetoDays, setVetoDays] = useState("30");
    const [witnessThreshold, setWitnessThreshold] = useState("1");
    const [beneficiaries, setBeneficiaries] = useState([{ pubkey: "", share: "100" }]);
    const [witnesses, setWitnesses] = useState([""]);

    const addBeneficiary = () => setBeneficiaries([...beneficiaries, { pubkey: "", share: "0" }]);
    const removeBeneficiary = (index: number) => setBeneficiaries(beneficiaries.filter((_, i) => i !== index));

    const addWitness = () => setWitnesses([...witnesses, ""]);
    const removeWitness = (index: number) => setWitnesses(witnesses.filter((_, i) => i !== index));

    const handleCreate = async () => {
        try {
            // 1. Walidacja udziałów (BPS)
            const totalShare = beneficiaries.reduce((sum, b) => sum + parseFloat(b.share || "0"), 0);
            if (Math.abs(totalShare - 100) > 0.001) {
                return toast.error("Udziały muszą sumować się do 100%");
            }

            // 2. Walidacja kluczy publicznych
            try {
                beneficiaries.forEach(b => new PublicKey(b.pubkey));
                witnesses.forEach(w => new PublicKey(w));
            } catch (e) {
                return toast.error("Niepoprawny adres portfela (Base58)");
            }

            // 3. Sprawdzenie progu świadków
            if (parseInt(witnessThreshold) > witnesses.length) {
                return toast.error("Próg świadków nie może być większy niż liczba świadków");
            }

            // 4. Auto generate session key
            const sessionKeypair = Keypair.generate();
            const sessionSecret = Buffer.from(sessionKeypair.secretKey).toString('base64');
            window.localStorage.setItem('legacyLockSessionKey', sessionSecret);
            
            await initializeVault(
                parseInt(inactivityDays),
                parseInt(vetoDays),
                parseInt(witnessThreshold),
                beneficiaries.map(b => ({ pubkey: b.pubkey, shareBps: Math.round(parseFloat(b.share) * 100) })),
                witnesses
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
                        <Input id="witness" type="number" min="1" max={witnesses.length} value={witnessThreshold} onChange={(e) => setWitnessThreshold(e.target.value)} />
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <Label className="text-white font-black uppercase text-[10px] tracking-widest italic">Beneficiaries</Label>
                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/5" onClick={addBeneficiary}><Plus className="w-3 h-3" /></Button>
                        </div>
                        {beneficiaries.map((b, i) => (
                            <div key={i} className="flex gap-2">
                                <Input 
                                    placeholder="Wallet Address" 
                                    className="flex-1 text-[10px] uppercase font-bold tracking-wider" 
                                    value={b.pubkey} 
                                    onChange={(e) => {
                                        const n = [...beneficiaries];
                                        n[i].pubkey = e.target.value;
                                        setBeneficiaries(n);
                                    }} 
                                />
                                <Input 
                                    className="w-20 text-[10px] font-bold" 
                                    type="number" 
                                    placeholder="%" 
                                    value={b.share} 
                                    onChange={(e) => {
                                        const n = [...beneficiaries];
                                        n[i].share = e.target.value;
                                        setBeneficiaries(n);
                                    }} 
                                />
                                {beneficiaries.length > 1 && (
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5" onClick={() => removeBeneficiary(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Witnesses Section */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <Label className="text-white font-black uppercase text-[10px] tracking-widest italic">Witness Registry</Label>
                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/5" onClick={addWitness}><Plus className="w-3 h-3" /></Button>
                        </div>
                        {witnesses.map((w, i) => (
                            <div key={i} className="flex gap-2">
                                <Input 
                                    placeholder="Witness Wallet Address" 
                                    className="flex-1 text-[10px] uppercase font-bold tracking-wider" 
                                    value={w} 
                                    onChange={(e) => {
                                        const n = [...witnesses];
                                        n[i] = e.target.value;
                                        setWitnesses(n);
                                    }} 
                                />
                                {witnesses.length > 1 && (
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5" onClick={() => removeWitness(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                )}
                            </div>
                        ))}
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
