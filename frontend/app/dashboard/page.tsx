"use client";

import { useLegacyLock } from "../hooks/useLegacyLock";
import { Button } from "@/components/ui/button";
import Dashboard from "../components/Dashboard";
import { motion } from "framer-motion";
import LegacyLockModal from "../components/LegacyLockModal";
import { TrendingUp, Shield, Activity, Users } from "lucide-react";

export default function DashboardPage() {
    const { vaultData, balance, solPrice, usdValue, isModalOpen, setIsModalOpen, isLoading } = useLegacyLock();

    const stats = [
        { 
            label: "Net Worth", 
            value: `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            subValue: `${balance.toFixed(4)} SOL`, 
            icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> 
        },
        { 
            label: "SOL Price", 
            value: `$${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            subValue: "Jupiter Real-time", 
            icon: <Activity className="w-4 h-4 text-blue-400" /> 
        },
        { 
            label: "Vault Status", 
            value: vaultData ? (vaultData.status.active ? "ACTIVE" : "PENDING") : "OFFLINE", 
            subValue: vaultData ? "Secured" : "Unprotected", 
            icon: <Shield className="w-4 h-4 text-white/40" /> 
        }
    ];

    return (
        <div className="w-full space-y-12">
            
            {/* 1. TOP CARDS - WEB3 STYLE */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="p-8 bg-neutral-950/40 border border-white/5 backdrop-blur-3xl space-y-4 hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-bold text-white/20 mb-2 uppercase tracking-[0.3em]">{stat.label}</span>
                           {stat.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">{stat.subValue}</p>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* 2. VAULT AREA */}
            <section className="relative">
                {!vaultData ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-3xl text-center"
                    >
                         <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-10">
                            <Shield className="w-6 h-6 text-white/20" />
                         </div>
                         <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">No Security Protocol Active</h2>
                         <p className="text-white/30 mb-12 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-wider">Initialize your digital heritage protocol to automate inheritance and secure your legacy.</p>
                         <Button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-7 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all shadow-2xl rounded-none italic">
                            Initialize Protocol
                         </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic">Active Vault Protocols</h3>
                            <div className="h-px flex-1 bg-white/5 mx-6" />
                        </div>
                        <Dashboard />
                    </div>
                )}
            </section>

            <LegacyLockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}
