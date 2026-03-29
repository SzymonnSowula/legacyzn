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
            icon: <Shield className="w-5 h-5 text-white/50" />
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
                        className="p-8 bg-[#0a0a0c]/80 border border-white/10 backdrop-blur-3xl space-y-4 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-300 rounded-3xl"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest">{stat.label}</span>
                            {stat.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-display font-bold text-white tracking-tighter uppercase">{stat.value}</h3>
                            <p className="text-xs font-bold text-white/40 uppercase font-mono tracking-widest leading-none">{stat.subValue}</p>
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
                        className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 bg-[#0a0a0c]/50 backdrop-blur-3xl text-center rounded-3xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/2 pointer-events-none" />
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                            <Shield className="w-8 h-8 text-white/40" />
                        </div>
                        <h2 className="text-4xl font-display font-bold mb-4 tracking-tighter">No Security Protocol Active</h2>
                        <p className="text-white/40 mb-12 max-w-md text-sm font-medium leading-relaxed">Initialize your digital heritage protocol to automate inheritance and secure your legacy.</p>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-12 py-7 text-xs font-display font-bold uppercase tracking-widest hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl rounded-none">
                            Initialize Protocol
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase font-mono tracking-widest text-white/30">Active Vault Protocols</h3>
                            <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent mx-6" />
                        </div>
                        <Dashboard />
                    </div>
                )}
            </section>

            <LegacyLockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}
