"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="w-full relative flex flex-col items-center bg-black">
      
      {/* 1. HERO BACKGROUND - NOW ABSOLUTE TO LIMIT TO FIRST VIEWPORT */}
      <div className="absolute top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <Image 
          src="/ImageBackground.jpg" 
          alt="Hero Background" 
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      {/* 2. MINIMAL NAVBAR */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-8 z-50 backdrop-blur-3xl bg-black/10">
        <div className="flex items-center gap-2 group cursor-pointer transition-all hover:scale-105">
          <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
          <span className="text-white text-[12px] font-black tracking-[0.3em] uppercase">LegacyZn</span>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { name: "Features", href: "#features" },
            { name: "Integrations", href: "#integrations" },
            { name: "Compare", href: "#compare" },
            { name: "Pricing", href: "#pricing" }
          ].map((item) => (
            <a 
              key={item.href} 
              href={item.href} 
              className="text-[9px] text-white/50 hover:text-white uppercase tracking-[0.25em] font-bold transition-all"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           {connected ? (
              <Link href="/dashboard" className="bg-white text-black px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all shadow-xl">
                 Dashboard
              </Link>
           ) : (
              <WalletMultiButton className="!bg-white !text-black hover:!opacity-90 !font-bold !rounded-none !h-10 !text-[9px] !uppercase !tracking-[0.25em] !px-8 transition-all shadow-2xl" />
           )}
        </div>
      </header>

      {/* 3. HERO CONTENT */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 max-w-6xl pt-20">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-[-0.04em] leading-[0.9] uppercase max-w-5xl mx-auto italic">
              Digital Heritage<br />
              Securely Defined.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/40 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed tracking-tight"
          >
            Lock your secrets. Secure your family. LegacyLock automates inheritance on Solana with cryptographic precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            {connected ? (
               <Link href="/dashboard" className="bg-white text-black px-12 py-6 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-2xl">
                 Go to Dashboard
               </Link>
            ) : (
               <>
                 <button className="bg-white text-black px-12 py-6 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-2xl">
                   Get Started
                 </button>
                 <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-12 py-6 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/20 transition-all">
                   Whitepaper
                 </button>
               </>
            )}
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="relative z-10 w-full max-w-7xl px-10 py-32 space-y-24 bg-black">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4">
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">Protocol Architecture</span>
             <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter italic">Engineered for Permanence.</h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Non-Custodial", desc: "Your keys, your legacy. Assets are secured in trustless smart contracts defined by you.", icon: "🔐" },
            { title: "Dead Man's Switch", desc: "Automated execution based on proof of life. Fail to ping, and the sequence begins.", icon: "⚡" },
            { title: "Witness Verification", desc: "Optional multi-sig witness protection to prevent accidental transfers.", icon: "👥" }
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="h-full p-10 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group backdrop-blur-3xl">
                 <span className="text-4xl mb-6 block grayscale group-hover:grayscale-0 transition-all">{feature.icon}</span>
                 <h3 className="text-xl font-bold uppercase tracking-widest italic text-white mb-4">{feature.title}</h3>
                 <p className="text-white/40 text-sm leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 5. INTEGRATIONS SECTION */}
      <section id="integrations" className="relative z-10 w-full bg-white/[0.01] border-y border-white/5 py-40 bg-black">
         <div className="max-w-7xl mx-auto px-10">
            <FadeIn>
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-8">
                    <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/30 italic">Ecosystem Partners</span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.9]">Deeply Integrated. <br />Solana Primary.</h2>
                    <p className="text-white/40 max-w-md text-lg font-light leading-relaxed">We leverage the high-performance capabilities of the Solana network and industry-leading protocols to ensure your legacy remains secure and executeable forever.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
                     {[
                       { name: "Helius", type: "RPC / Infrastructure" },
                       { name: "Pyth", type: "Oracle Network" },
                       { name: "Jupiter", type: "Liquidity / Swap" },
                       { name: "Anchor", type: "Safety / Framework" }
                     ].map((partner, i) => (
                       <div key={partner.name} className="bg-black p-8 space-y-2 hover:bg-neutral-900 transition-all border border-white/5">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{partner.name}</h4>
                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{partner.type}</p>
                       </div>
                     ))}
                 </div>
              </div>
            </FadeIn>
         </div>
      </section>

      {/* 6. COMPARE SECTION */}
      <section id="compare" className="relative z-10 w-full max-w-5xl px-10 py-32 space-y-20 bg-black">
         <FadeIn>
           <div className="text-center space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">Efficiency Comparison</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter italic">Digital vs Traditional.</h2>
           </div>
         </FadeIn>

         <FadeIn delay={0.2}>
            <div className="w-full border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                       <th className="p-8">Metric</th>
                       <th className="p-8">LegacyLock</th>
                       <th className="p-8">Traditional Will</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-bold uppercase tracking-wider">
                     <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="p-8 text-white/40">Execution Speed</td>
                        <td className="p-8 text-white">Instant / Automatic</td>
                        <td className="p-8 text-white/40">6+ Months (Probate)</td>
                     </tr>
                     <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="p-8 text-white/40">Setup Cost</td>
                        <td className="p-8 text-white">0.05 SOL</td>
                        <td className="p-8 text-white/40">$2,000+ (Legal Fees)</td>
                     </tr>
                     <tr className="hover:bg-white/[0.01]">
                        <td className="p-8 text-white/40">Privacy</td>
                        <td className="p-8 text-white">Cryptographic / Private</td>
                        <td className="p-8 text-white/40">Public Court Record</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </FadeIn>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="relative z-10 w-full max-w-7xl px-10 py-32 bg-white/[0.01] border-y border-white/5 bg-black">
         <FadeIn>
           <div className="text-center space-y-4 mb-20">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 italic">Global Pricing</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter italic">Simple. Transparent.</h2>
           </div>
         </FadeIn>

         <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <FadeIn delay={0.1}>
               <div className="p-10 border border-white/5 bg-white/[0.02] space-y-8 backdrop-blur-3xl">
                  <div className="flex justify-between items-start">
                     <h3 className="text-2xl font-black uppercase tracking-tighter italic">Standard</h3>
                     <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 font-bold tracking-widest uppercase italic">Live Now</span>
                  </div>
                  <p className="text-3xl font-black italic tracking-tighter">0.05 SOL <span className="text-xs text-white/30 font-bold uppercase tracking-widest italic ml-2">per vault</span></p>
                  <ul className="space-y-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                     <li className="flex gap-4">✓ Automated Dead Man's Switch</li>
                     <li className="flex gap-4">✓ Native SOL Support</li>
                     <li className="flex gap-4">✓ Single Witness Support</li>
                  </ul>
                  <button className="w-full bg-white text-black py-4 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-neutral-200 transition-all">Initialize</button>
               </div>
            </FadeIn>

            <FadeIn delay={0.2}>
               <div className="p-10 border border-white/10 bg-white/[0.04] space-y-8 backdrop-blur-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                  <div className="flex justify-between items-start">
                     <h3 className="text-2xl font-black uppercase tracking-tighter italic">Enterprise</h3>
                     <span className="text-[10px] border border-white/20 text-white/50 px-3 py-1 font-bold tracking-widest uppercase italic">Available Q3</span>
                  </div>
                  <p className="text-3xl font-black italic tracking-tighter">Custom Pricing</p>
                  <ul className="space-y-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                     <li className="flex gap-4 italic opacity-50">✓ Unlimited SPL Assets</li>
                     <li className="flex gap-4 italic opacity-50">✓ Bulk Witness Registry</li>
                     <li className="flex gap-4 italic opacity-50">✓ Priority RPC Infrastructure</li>
                  </ul>
                  <button className="w-full bg-transparent border border-white/20 text-white/50 py-4 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all">Request Access</button>
               </div>
            </FadeIn>
         </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative z-10 w-full py-20 px-10 flex flex-col items-center space-y-12 bg-black">
         <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
            <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase italic">Legacy</span>
         </div>
         <nav className="flex gap-10 text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
            <a href="#" className="hover:text-white transition-all">Twitter / X</a>
            <a href="#" className="hover:text-white transition-all">Discord</a>
            <a href="#" className="hover:text-white transition-all">Docs</a>
            <a href="#" className="hover:text-white transition-all">Github</a>
         </nav>
         <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/10 tracking-[0.8em]">© MMXXVI LEGACYLOCK PROTOCOL</p>
      </footer>

    </div>
  );
}
