"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { ArrowUpRight, History, ShieldAlert, Check, Clock, RefreshCw } from "lucide-react";

interface TransactionItem {
    signature: string;
    slot: number;
    err: unknown | null;
    blockTime?: number | null;
    status: string;
}

export default function HistoryPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!wallet.publicKey) {
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch the last 20 signatures for the wallet
            const sigs = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 20 });

            const formatted = sigs.map(sig => ({
                signature: sig.signature,
                slot: sig.slot,
                err: sig.err,
                blockTime: sig.blockTime,
                status: sig.err === null ? "Success" : "Failed",
            }));

            setTransactions(formatted);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    }, [connection, wallet.publicKey]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const formatTime = (unixTime?: number | null) => {
        if (!unixTime) return "Unknown time";
        const date = new Date(unixTime * 1000);
        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const shortenSig = (sig: string) => {
        return `${sig.slice(0, 6)}...${sig.slice(-6)}`;
    };

    return (
        <div className="w-full space-y-10">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-display font-bold tracking-tighter uppercase text-white">Transaction History</h2>
                    <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-2">Recent network activities</p>
                </div>
                <div>
                    <button
                        onClick={fetchHistory}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white uppercase font-mono tracking-widest transition-colors font-bold disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="bg-[#0a0a0c]/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] p-5 border-b border-white/10 bg-[#0a0a0c] sticky top-0 z-10">
                    <span className="text-[10px] font-bold text-white/30 uppercase font-mono tracking-widest">Signature</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase font-mono tracking-widest">Date & Time</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase font-mono tracking-widest">Slot</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase font-mono tracking-widest text-right">Status</span>
                </div>

                <div className="divide-y divide-white/5 bg-[#0a0a0c]/60 backdrop-blur-md">
                    {transactions.length === 0 && !isLoading ? (
                        <div className="p-16 text-center text-white/40 text-[10px] tracking-widest font-mono font-bold uppercase">
                            No transactions found for this wallet.
                        </div>
                    ) : (
                        transactions.map((tx, i) => (
                            <motion.div
                                key={tx.signature}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] p-6 items-center hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-full border ${tx.err === null ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                        {tx.err === null ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                    </div>
                                    <a
                                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-mono font-bold text-white/70 group-hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        {shortenSig(tx.signature)}
                                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/80" />
                                    </a>
                                </div>

                                <div className="flex items-center gap-2 text-white/60">
                                    <Clock className="w-4 h-4 opacity-50" />
                                    <span className="text-xs font-mono font-bold">{formatTime(tx.blockTime)}</span>
                                </div>

                                <div className="text-xs font-mono font-bold text-white/40">
                                    {tx.slot.toLocaleString()}
                                </div>

                                <div className={`text-right text-[10px] font-mono font-bold uppercase tracking-widest ${tx.err === null ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tx.status}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
