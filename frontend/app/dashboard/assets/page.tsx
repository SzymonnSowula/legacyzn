"use client";

import { useLegacyLock } from "../../hooks/useLegacyLock";
import { motion } from "framer-motion";
import { Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AssetsPage() {
    const { balance, solPrice, usdValue } = useLegacyLock();

    const assets = [
        { 
            name: "Solana", 
            symbol: "SOL", 
            amount: balance.toFixed(4), 
            value: usdValue.toFixed(2), 
            price: solPrice.toFixed(2),
            change: "+2.4%",
            isPositive: true,
            icon: "☀️" 
        },
        { 
            name: "USD Coin", 
            symbol: "USDC", 
            amount: "0.00", 
            value: "0.00", 
            price: "1.00",
            change: "0.0%",
            isPositive: true,
            icon: "💵" 
        },
    ];

    return (
        <div className="w-full space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Portfolio Assets</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">Live valuation across Solana network</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Total Balance</span>
                    <p className="text-2xl font-black italic tracking-tighter uppercase">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </header>

            <div className="grid gap-px bg-white/5 border border-white/5">
                {assets.map((asset, i) => (
                    <motion.div 
                        key={asset.symbol}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-neutral-950 p-8 flex justify-between items-center hover:bg-white/[0.02] transition-all group"
                    >
                        <div className="flex items-center gap-10">
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{asset.icon}</span>
                            <div className="space-y-1">
                                <h3 className="font-black text-xl tracking-tight uppercase italic">{asset.name}</h3>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{asset.amount} {asset.symbol}</span>
                                   <div className="h-1 w-1 rounded-full bg-white/10" />
                                   <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">${asset.price} / UNIT</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="font-black text-2xl italic tracking-tighter uppercase">${asset.value}</p>
                            <div className={`flex items-center justify-end gap-1 ${asset.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {asset.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                <span className="text-[9px] font-bold uppercase tracking-widest">{asset.change}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="pt-10 border-t border-white/5 flex gap-4">
                 <button className="bg-white text-black px-10 py-5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all italic">
                    Deposit Legacy Assets
                 </button>
                 <button className="bg-transparent border border-white/10 text-white/40 px-10 py-5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all italic">
                    Scan Wallet
                 </button>
            </div>
        </div>
    );
}
