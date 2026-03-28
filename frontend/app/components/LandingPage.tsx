"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Activity, Users, Clock, ArrowRight, Lock, KeyRound } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Helper for scroll reveal animation
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="w-full relative overflow-hidden flex flex-col items-center">
      
      {/* Ambient Background Blobs (Green Glass Style) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14F195]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-[#14F195]/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#14F195]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 max-w-5xl mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium rounded-full bg-[#14F195]/10 border border-[#14F195]/30 text-[#14F195] backdrop-blur-md shadow-[0_0_20px_rgba(20,241,149,0.15)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#14F195] animate-pulse shadow-[0_0_10px_#14F195]" />
          Live on Solana Mainnet & Devnet
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          Secure Your Legacy <br />
          with a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#14F195] to-emerald-300">
            Dead Man's Switch
          </span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-2xl text-emerald-100/60 max-w-3xl mb-12 font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          A trustless inheritance protocol on Solana. Lock your assets and pass them on safely to your loved ones automatically when you're no longer active.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
           className="flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(20,241,149,0.4)] rounded-xl">
             <WalletMultiButton className="!bg-gradient-to-r !from-[#14F195] !to-emerald-400 !text-black hover:!opacity-90 !font-extrabold !px-8 !py-5 !h-auto !rounded-xl !text-lg transition-all" />
          </div>
          <a href="#how-it-works" className="text-[#14F195] hover:text-white flex items-center gap-2 font-medium transition-colors px-6 py-4 rounded-xl hover:bg-[#14F195]/10 border border-transparent hover:border-[#14F195]/30">
            See how it works <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="relative z-10 w-full max-w-6xl px-4 py-24">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Why LegacyLock?</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Traditional inheritance is slow, expensive, and requires trusting middlemen. We replaced them with math and cryptography.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="w-8 h-8 text-[#14F195]" />,
              title: "100% Non-Custodial",
              desc: "Your keys, your crypto. Funds stay locked in a smart contract that only you or your designated protocol rules control."
            },
            {
              icon: <Activity className="w-8 h-8 text-[#14F195]" />,
              title: "Automated Execution",
              desc: "Based on Proof of Life. Fail to check-in (ping) within your chosen timeframe, and the inheritance sequence begins automatically."
            },
            {
              icon: <Users className="w-8 h-8 text-[#14F195]" />,
              title: "Witness Verification",
              desc: "A built-in veto system where trusted witnesses must confirm your inactivity before assets are irrevocably transferred."
            }
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="h-full p-8 rounded-3xl bg-black/40 border border-[#14F195]/20 backdrop-blur-xl hover:bg-[#14F195]/5 hover:border-[#14F195]/50 hover:shadow-[0_0_30px_rgba(20,241,149,0.1)] transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#14F195]/10 blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#14F195]/10 border border-[#14F195]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(20,241,149,0.05)]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-emerald-100/60 leading-relaxed">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 w-full max-w-5xl px-4 py-24 mb-20">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Setting up your digital will takes less than 3 minutes.
          </p>
        </FadeIn>

        <div className="space-y-12">
          {[
            {
              step: "01",
              icon: <Lock className="w-6 h-6 text-[#14F195]" />,
              title: "Initialize Your Vault",
              desc: "Deposit SOL into your secure vault. Define your inactivity threshold (e.g. 365 days) and assign your beneficiaries."
            },
            {
              step: "02",
              icon: <Activity className="w-6 h-6 text-[#14F195]" />,
              title: "Stay Alive (Ping)",
              desc: "Periodically click 'Ping Alive' to confirm you still have access. This resets the countdown timer back to zero."
            },
            {
              step: "03",
              icon: <KeyRound className="w-6 h-6 text-[#14F195]" />,
              title: "Automated Handover",
              desc: "If the timer hits zero, witnesses confirm your status. If no veto occurs, assets are securely distributed to beneficiaries."
            }
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-black/40 backdrop-blur-xl border border-[#14F195]/20 hover:border-[#14F195]/50 transition-colors p-8 rounded-3xl shadow-[0_0_20px_rgba(20,241,149,0.02)] relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#14F195] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#14F195]/10 border border-[#14F195]/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(20,241,149,0.1)]">
                  <span className="absolute -top-3 -left-3 text-4xl font-black text-[#14F195]/20">{item.step}</span>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-lg text-emerald-100/60">{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 flex flex-col items-center justify-center py-12 bg-black/50 backdrop-blur-lg z-10">
        <div className="flex items-center gap-3 mb-6 opacity-80">
           <div className="w-6 h-6 rounded bg-[#14F195] shadow-[0_0_10px_#14F195]"></div>
           <span className="text-xl font-bold tracking-tight text-white/90">LegacyLock</span>
        </div>
        <p className="text-emerald-500/50 mb-6 font-medium">Built with precision on Solana.</p>
        <div className="flex gap-6 text-sm text-neutral-400">
           <a href="#" className="hover:text-white transition-colors">Documentation</a>
           <a href="#" className="hover:text-white transition-colors">GitHub</a>
           <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
