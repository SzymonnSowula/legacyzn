"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Wallet, ShieldCheck, History, Menu, X, ChevronRight } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { connected } = useWallet();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!connected && pathname.startsWith('/dashboard')) {
            router.push('/');
        }
    }, [connected, pathname, router]);

    if (!connected) return null;

    const navItems = [
        { name: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
        { name: "Assets", icon: <Wallet className="w-4 h-4" />, path: "/dashboard/assets" },
        { name: "Vault", icon: <ShieldCheck className="w-4 h-4" />, path: "/dashboard/vault" },
        { name: "History", icon: <History className="w-4 h-4" />, path: "/dashboard/history" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[0%] -left-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            {/* 1. SIDEBAR */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'} hidden md:flex flex-col border-r border-white/10 bg-[#0a0a0c]/60 backdrop-blur-3xl transition-all duration-500 ease-[0.16, 1, 0.3, 1] z-50 font-mono`}
            >
                <div className="p-8 flex items-center gap-3">
                    {isSidebarOpen && <span className="text-[16px] font-display font-bold tracking-tighter uppercase text-white">Legacy<span className="text-purple-500">ZN</span> &nbsp; -_-</span>}
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            href={item.path}
                            key={item.path}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all group ${pathname === item.path ? 'bg-white/5 text-white border-l-2 border-white' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className={`${pathname === item.path ? 'text-white' : 'text-white/50 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span className="text-[10px] uppercase tracking-widest font-bold font-mono">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/10 space-y-4">
                    <div className={`flex flex-col ${!isSidebarOpen && 'items-center'}`}>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">Network</span>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                            {isSidebarOpen && <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest font-mono">Solana Devnet</span>}
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-24 border-b border-white/10 flex items-center justify-between px-10 bg-[#0a0a0c]/60 backdrop-blur-md z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors rounded-lg">
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <h2 className="text-[10px] font-bold font-mono uppercase tracking-widest text-white/40">
                            {navItems.find(n => n.path === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <WalletMultiButton className="bg-white! text-black! hover:bg-neutral-200! hover:scale-[0.98]! transition-transform! font-display! font-bold! rounded-2xl! h-11! text-xs! uppercase! tracking-widest! px-8! shadow-xl!" />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
                    <div className="grain pointer-events-none opacity-5 shadow-inner" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-6xl mx-auto w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
