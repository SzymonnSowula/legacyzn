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
        <div className="min-h-screen bg-black text-white flex">
            {/* 1. SIDEBAR */}
            <aside 
                 className={`${isSidebarOpen ? 'w-72' : 'w-20'} hidden md:flex flex-col border-r border-white/5 bg-neutral-950/20 backdrop-blur-3xl transition-all duration-500 ease-[0.16, 1, 0.3, 1] z-50`}
            >
                <div className="p-8 flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] shrink-0"></div>
                   {isSidebarOpen && <span className="text-[14px] font-black tracking-[0.3em] uppercase italic">LegacyZn</span>}
                </div>

                <nav className="flex-1 px-4 py-10 space-y-2">
                    {navItems.map((item) => (
                        <Link 
                            href={item.path} 
                            key={item.path}
                            className={`flex items-center gap-4 px-4 py-4 rounded-none transition-all group ${pathname === item.path ? 'bg-white/5 text-white' : 'text-white/30 hover:text-white hover:bg-white/[0.02]'}`}
                        >
                            <span className={`${pathname === item.path ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                                {item.name}
                              </span>
                            )}
                            {pathname === item.path && isSidebarOpen && (
                               <motion.div layoutId="activeNav" className="ml-auto">
                                  <ChevronRight className="w-3 h-3 text-white/20" />
                               </motion.div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/5 space-y-4">
                     <div className={`flex flex-col ${!isSidebarOpen && 'items-center'}`}>
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold">Network</span>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           {isSidebarOpen && <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.1em]">Devnet</span>}
                        </div>
                     </div>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/50 backdrop-blur-md z-40">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                         {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                      </button>
                      <div className="h-4 w-px bg-white/5 mx-2" />
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 italic">
                         {navItems.find(n => n.path === pathname)?.name || "Dashboard"}
                      </h2>
                   </div>

                   <div className="flex items-center gap-6">
                      <WalletMultiButton className="!bg-white !text-black hover:!opacity-90 !font-bold !rounded-none !h-11 !text-[9px] !uppercase !tracking-[0.25em] !px-10 transition-all shadow-2xl" />
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
