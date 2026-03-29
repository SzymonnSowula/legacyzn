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
            <DialogContent className="sm:max-w-[500px] bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-3xl font-display font-bold tracking-tighter uppercase text-white">Initialize Protocol</DialogTitle>
                    <DialogDescription className="text-white/40 text-xs font-mono leading-relaxed uppercase tracking-widest">
                        Configure vault parameters. A local session key will be generated for immutable heritage automation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 mt-4 border-t border-white/10">
                    <div className="grid gap-3">
                        <Label htmlFor="inactivity" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">Inactivity Threshold (Days)</Label>
                        <Input id="inactivity" type="number" min="1" value={inactivityDays} onChange={(e) => setInactivityDays(e.target.value)} className="bg-white/5 border-white/10 text-white font-mono rounded-xl h-12 focus:border-white/30 transition-colors" />
                        <p className="text-[10px] text-white/20 font-mono italic">SEC_EQUIV: {(parseInt(inactivityDays) || 0) * 86400}S</p>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="veto" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">Veto Period (Days)</Label>
                        <Input id="veto" type="number" min="1" value={vetoDays} onChange={(e) => setVetoDays(e.target.value)} className="bg-white/5 border-white/10 text-white font-mono rounded-xl h-12 focus:border-white/30 transition-colors" />
                        <p className="text-[10px] text-white/20 font-mono italic">SEC_EQUIV: {(parseInt(vetoDays) || 0) * 86400}S</p>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <Label className="text-white font-mono font-bold uppercase text-[10px] tracking-widest">Beneficiaries List</Label>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5 text-white/40" onClick={addBeneficiary}><Plus className="w-4 h-4" /></Button>
                        </div>
                        {beneficiaries.map((b, i) => (
                            <div key={i} className="flex gap-2 group">
                                <Input
                                    placeholder="WALLET_ADDR_BASE58"
                                    className="flex-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-white/5 border-white/10 rounded-xl h-10"
                                    value={b.pubkey}
                                    onChange={(e) => {
                                        const n = [...beneficiaries];
                                        n[i].pubkey = e.target.value;
                                        setBeneficiaries(n);
                                    }}
                                />
                                <Input
                                    className="w-20 text-[10px] font-mono font-bold bg-white/5 border-white/10 rounded-xl h-10"
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
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/5 transition-all" onClick={() => removeBeneficiary(i)}><Trash2 className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Witnesses Section */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center">
                            <Label className="text-white font-mono font-bold uppercase text-[10px] tracking-widest">Witness Registry</Label>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5 text-white/40" onClick={addWitness}><Plus className="w-4 h-4" /></Button>
                        </div>
                        {witnesses.map((w, i) => (
                            <div key={i} className="flex gap-2">
                                <Input
                                    placeholder="WITNESS_ADDR_BASE58"
                                    className="flex-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-white/5 border-white/10 rounded-xl h-10"
                                    value={w}
                                    onChange={(e) => {
                                        const n = [...witnesses];
                                        n[i] = e.target.value;
                                        setWitnesses(n);
                                    }}
                                />
                                {witnesses.length > 1 && (
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/5 transition-all" onClick={() => removeWitness(i)}><Trash2 className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                        <div className="grid gap-3 pt-2">
                            <Label htmlFor="witness" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50">Required Approvals</Label>
                            <Input id="witness" type="number" min="1" max={witnesses.length} value={witnessThreshold} onChange={(e) => setWitnessThreshold(e.target.value)} className="bg-white/5 border-white/10 text-white font-mono rounded-xl h-12" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 pt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-white/10 text-white/40 hover:bg-white/5 h-14 font-mono font-bold uppercase text-xs tracking-widest rounded-xl">Cancel</Button>
                    <Button onClick={handleCreate} disabled={isLoading} className="flex-1 bg-white text-black hover:bg-neutral-200 h-14 font-display font-bold uppercase text-xs tracking-widest rounded-xl shadow-2xl">Deploy Protocol</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
