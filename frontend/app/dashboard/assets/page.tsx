"use client";

import { useLegacyLock } from "../../hooks/useLegacyLock";
import { useTokenAssets } from "../../hooks/useTokenAssets";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function AssetsPage() {
    const { usdValue } = useLegacyLock();
    const { assets, totalValueUsd, isLoading, refreshAssets } = useTokenAssets();

    return (
        <div className="w-full space-y-10">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-display font-medium tracking-tighter text-white">Portfolio Assets</h2>
                    <p className="text-white/40 text-[10px] font-sans uppercase tracking-widest mt-2">Live valuation across Solana network</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-[10px] font-sans font-medium text-white/30 uppercase tracking-widest">Total Balance</span>
                    <p className="text-4xl font-display font-medium tracking-tighter text-white">${totalValueUsd > 0 ? totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <button
                        onClick={refreshAssets}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-[10px] text-white/50 hover:text-white uppercase tracking-widest transition-colors font-medium disabled:opacity-50 mt-1"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="space-y-6 bg-white/2 p-4 rounded-[2.5rem] backdrop-blur-3xl">
                {isLoading ? (
                    <div className="p-20 text-center animate-pulse text-white/20 font-sans text-[10px] uppercase tracking-widest">Accessing Ledger Data...</div>
                ) : assets.length === 0 ? (
                    <div className="p-20 text-center text-white/30 font-sans text-[10px] uppercase tracking-widest">No assets detected on this protocol.</div>
                ) : (
                    assets.map((asset, i) => (
                        <motion.div
                            key={asset.symbol}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0a0a0c]/80 p-8 flex justify-between items-center hover:bg-white/5 transition-all group rounded-2xl border border-white/5 hover:border-white/10"
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 shadow-2xl group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
                                    {asset.symbol === 'SOL' ? (
                                        <Image src="/sol.png" alt="SOL" fill className="p-2 object-contain" />
                                    ) : (
                                        <span className="text-2xl grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{asset.icon}</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-display font-medium text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">{asset.name || asset.symbol}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-sans font-medium text-white/50 uppercase tracking-widest">{asset.balance.toFixed(4)} {asset.symbol}</span>
                                        <div className="h-0.5 w-0.5 rounded-full bg-white/20" />
                                        <span className="text-[10px] font-sans font-medium text-white/30 uppercase tracking-widest">${asset.price.toFixed(4)} <span className="opacity-40">/ unit</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="font-display font-medium text-3xl tracking-tighter text-white">${asset.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <div className={`flex items-center justify-end gap-1 ${asset.price > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {asset.price > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    <span className="text-[9px] font-medium uppercase tracking-widest">LIVE VALUATION</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="pt-10 flex gap-4">
                <button className="bg-white text-black px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 hover:-translate-y-1 transition-all shadow-xl rounded-xl">
                    Deposit Legacy Assets
                </button>
                <button className="bg-[#0a0a0c]/50 backdrop-blur-md border border-white/10 text-white/60 px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all rounded-xl">
                    Scan Wallet
                </button>
            </div>
        </div>
    );
}
