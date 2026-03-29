"use client";

import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ShieldHalf, Activity, Fingerprint, Lock, Zap, Users, ArrowRight, Share2, ShieldCheck, Globe } from "lucide-react";

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
  const { setVisible } = useWalletModal();

  return (
    <div className="w-full relative flex flex-col items-center bg-[#0a0a0c] overflow-hidden">
      <div className="grain pointer-events-none opacity-5 shadow-inner fixed inset-0 z-100" />

      {/* Background ambient glows - Color-matched to tech/solana theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] -right-[15%] w-[60%] h-[60%] bg-emerald-500/5 blur-[180px] rounded-full mix-blend-screen" />
        <div className="absolute top-[15%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[60%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[160px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[5%] left-[5%] w-[50%] h-[50%] bg-white/5 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      {/* 1. HERO BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-[110vh] z-0 overflow-hidden">
        <Image
          src="/image.png"
          alt="Hero Background"
          fill
          className="object-cover opacity-60 scale-105 transition-opacity duration-1000"
          priority
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0c] via-[#0a0a0c]/5 to-[#0a0a0c]/60" />
        <div className="absolute inset-0 bg-black/5 " />
      </div>

      {/* 2. MINIMAL NAVBAR */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-6 z-100 backdrop-blur-3xl bg-black/5 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer transition-all hover:scale-105">
          <div className="relative w-4 h-4">
            <Image src="/sol.png" alt="Solana" fill className="object-contain filter brightness-100 group-hover:brightness-125 transition-all" />
          </div>
          <span className="text-white text-[14px] font-display font-medium tracking-tighter uppercase">Legacy<span className="text-white/40 font-light">ZN</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-12 font-sans">
          {[
            { name: "Protocol", href: "#features" },
            { name: "Nodes", href: "#integrations" },
            { name: "Analytics", href: "#compare" },
            { name: "Pricing", href: "#pricing" }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[10px] text-white/60 hover:text-white uppercase tracking-widest font-medium transition-all hover:scale-110 active:scale-95"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {connected ? (
            <Link href="/dashboard" className="bg-white text-black px-8 py-3.5 text-[10px] font-display font-medium uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all shadow-2xl rounded-2xl">
              Access Console
            </Link>
          ) : (
            <WalletMultiButton className="bg-white! text-black! hover:bg-neutral-200! hover:scale-105! active:scale-95! transition-all! font-display! font-medium! rounded-2xl! h-11! text-[10px]! uppercase! tracking-widest! px-10 shadow-2xl!" />
          )}
        </div>
      </header>

      {/* 3. HERO CONTENT */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 max-w-7xl pt-32 pb-20">
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-xl">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-sans font-medium text-white/70 uppercase tracking-widest">We're live!</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-display font-medium tracking-tighter leading-[0.9] uppercase max-w-6xl mx-auto text-white drop-shadow-2xl">
              Digital Heritage<br />
              <span className="text-white/60 font-light">Securely Defined.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-sans font-normal leading-relaxed tracking-wide"
          >
            Secure your digital legacy. Automate inheritance with trustless execution on Solana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            {connected ? (
              <Link href="/dashboard" className="bg-white text-black px-16 py-6 text-[12px] font-display font-medium uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_100px_rgba(255,255,255,0.15)] rounded-3xl group">
                Launch Console
                <ArrowRight className="w-4 h-4 ml-3 inline group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setVisible(true)}
                  className="bg-white text-black px-16 py-6 text-[12px] font-display font-medium uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] rounded-3xl"
                >
                  Get Started
                </button>
                <button className="bg-white/10 backdrop-blur-2xl border border-white/10 text-white/60 px-16 py-6 text-[12px] font-display font-medium uppercase tracking-widest cursor-not-allowed rounded-3xl hover:bg-white/15 transition-all">
                  Technical Docs <span className="text-[8px] opacity-60 ml-2">(Soon)</span>
                </button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="relative z-10 w-full max-w-7xl px-10 py-48 space-y-32">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-[10px] font-sans font-medium uppercase tracking-[0.4em] text-white/40">Protocol Architecture</span>
            <h2 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter text-white">Engineered for Permanence.</h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "Non-Custodial", desc: "Your keys, your legacy. Assets are secured in trustless smart contracts defined by you.", icon: <ShieldHalf className="w-8 h-8 text-white/80" /> },
            { title: "Dead Man's Switch", desc: "Automated execution based on proof of life. Fail to ping, and the sequence begins.", icon: <Activity className="w-8 h-8 text-white/80" /> },
            { title: "Witness Registry", desc: "Optional multi-sig witness protection to prevent accidental transfers.", icon: <Fingerprint className="w-8 h-8 text-white/80" /> }
          ].map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="h-full p-12 bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all group backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/5 transition-all" />
                <div className="mb-10 p-4 w-fit bg-white/5 rounded-2xl group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100">{feature.icon}</div>
                <h3 className="text-2xl font-display font-medium uppercase tracking-tighter text-white mb-6 leading-tight transition-colors">{feature.title}</h3>
                <p className="text-white/80 text-[13px] leading-relaxed font-sans font-normal group-hover:text-white transition-colors">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 5. INTEGRATIONS SECTION */}
      <section id="integrations" className="relative z-10 w-full bg-[#0a0a0c]/40 border-y border-white/5 py-48">
        <div className="max-w-7xl mx-auto px-10">
          <FadeIn>
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <span className="text-[10px] font-sans font-medium uppercase tracking-[0.4em] text-white/60">Infrastructure Nodes</span>
                <h2 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter leading-[0.9] text-white">Deeply Integrated. <br /><span className="text-white/50 font-light">Solana Primary.</span></h2>
                <p className="text-white/80 max-w-md text-lg font-sans font-normal leading-relaxed">We leverage high-performance capabilities of the Solana network and industry protocols to ensure your legacy remains secure.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Helius", type: "RPC / INFRA", icon: <Zap className="w-4 h-4" /> },
                  { name: "Pyth", type: "ORACLE DATA", icon: <Globe className="w-4 h-4" /> },
                  { name: "Jupiter", type: "LIQUIDITY", icon: <Share2 className="w-4 h-4" /> },
                  { name: "Anchor", type: "TRUSTLESS", icon: <ShieldCheck className="w-4 h-4" /> }
                ].map((partner, i) => (
                  <div key={partner.name} className="bg-white/2 p-8 space-y-4 hover:bg-white/5 transition-all border border-white/5 rounded-3xl group">
                    <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors">{partner.icon}</div>
                    <div>
                      <h4 className="text-lg font-display font-medium text-white/80 uppercase tracking-tighter group-hover:text-white transition-colors">{partner.name}</h4>
                      <p className="text-[9px] font-sans font-medium text-white/30 uppercase tracking-widest mt-1 group-hover:text-white/50 transition-colors">{partner.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 6. ANALYTICS SECTION */}
      <section id="compare" className="relative z-10 w-full max-w-5xl px-10 py-48 space-y-24">
        <FadeIn>
          <div className="text-center space-y-6">
            <span className="text-[10px] font-sans font-medium uppercase tracking-[0.4em] text-white/40">Efficiency Analytics</span>
            <h2 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter transition-colors select-none text-white">Digital vs Traditional.</h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="w-full border border-white/5 bg-white/2 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-sans font-medium uppercase tracking-widest text-white/40">
                  <th className="p-10">Metric Parameter</th>
                  <th className="p-10 text-white/90 font-medium">LegacyLock Protocol</th>
                  <th className="p-10">Traditional Juris</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-sans font-normal text-white/80">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-10">Execution Latency</td>
                  <td className="p-10 text-emerald-400 font-medium tracking-widest bg-emerald-500/5">INSTANT / AUTO</td>
                  <td className="p-10">6+ MONTHS</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-10">Capital Overhead</td>
                  <td className="p-10 text-emerald-400 font-medium tracking-widest bg-emerald-500/5">0.05 SOL</td>
                  <td className="p-10">$2K+ AVG. FEES</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-10">Data Integrity</td>
                  <td className="p-10 text-emerald-400 font-medium tracking-widest uppercase bg-emerald-500/5">On-Chain</td>
                  <td className="p-10">CENTRAL REGISTRY</td>
                </tr>
              </tbody>
            </table>
          </div>
        </FadeIn>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="relative z-10 w-full max-w-7xl px-10 py-48 bg-white/1 border-y border-white/5 rounded-xl">
        <FadeIn>
          <div className="text-center space-y-6 mb-24">
            <span className="text-[10px] font-sans font-medium uppercase tracking-[0.4em] text-white/40">Global Protocol Fees</span>
            <h2 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter text-white">Simple. Transparent.</h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <FadeIn delay={0.1}>
            <div className="p-12 border border-white/5 bg-white/2 space-y-10 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group shadow-2xl hover:bg-white/5 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[50px] rounded-full translate-x-10 translate-y-10 group-hover:bg-emerald-500/10 transition-all" />
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-display font-medium uppercase tracking-tighter text-white">Standard Console</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-4 py-1.5 font-sans font-medium tracking-widest uppercase rounded-full border border-emerald-500/20">Production</span>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-display font-medium tracking-tighter text-white italic">$0.00 <span className="text-2xl font-light text-white/60 non-italic ml-2"> + 0.05 SOL</span></p>
                <p className="text-[9px] font-sans font-medium text-white/50 uppercase tracking-widest mt-2">NETWORK ACTIVATION</p>
              </div>
              <ul className="space-y-6 text-[11px] font-sans font-normal text-white/80">
                <li className="flex items-center gap-4 transition-colors hover:text-white"><Lock className="w-3.5 h-3.5 opacity-80" /> Dead Man's Switch Automation</li>
                <li className="flex items-center gap-4 transition-colors hover:text-white"><ShieldCheck className="w-3.5 h-3.5 opacity-80" /> Native Solana Ledger Support</li>
                <li className="flex items-center gap-4 transition-colors hover:text-white"><Users className="w-3.5 h-3.5 opacity-80" /> Witness Validation Registry</li>
              </ul>
              <button className="w-full bg-white text-black py-5 font-display font-medium uppercase text-[11px] tracking-widest hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-3xl shadow-xl">Access Console</button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="p-12 border border-white/5 bg-white/1 space-y-10 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group border-dashed">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-display font-medium uppercase tracking-tighter text-white/30">Developer SDK</h3>
                <span className="text-[9px] border border-white/10 text-white/30 px-4 py-1.5 font-sans font-medium tracking-widest uppercase rounded-full">Coming Q3</span>
              </div>
              <div className="space-y-1">
                <p className="text-5xl font-display font-medium tracking-tighter text-white/20 italic">Custom</p>
                <p className="text-[9px] font-sans font-medium text-white/10 uppercase tracking-widest mt-2">ENTERPRISE API</p>
              </div>
              <ul className="space-y-6 text-[11px] font-sans font-normal text-white/10">
                <li className="flex items-center gap-4">✓ Unlimited SPL Token Channels</li>
                <li className="flex items-center gap-4">✓ Multi-Chain Heritage Sync</li>
                <li className="flex items-center gap-4">✓ Dedicated RPC Pipeline</li>
              </ul>
              <button className="w-full bg-transparent border border-white/5 text-white/10 py-5 font-display font-medium uppercase text-[11px] tracking-widest hover:bg-white/5 hover:text-white transition-all rounded-3xl">Request Specs</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative z-10 w-full py-32 px-10 flex flex-col items-center space-y-16 bg-[#0a0a0c]">
        <div className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
          <div className="relative w-4 h-4">
            <Image src="/sol.png" alt="Solana" fill className="object-contain" />
          </div>
          <span className="text-white text-[12px] font-display font-medium tracking-tighter uppercase">Legacy<span className="text-white/40 font-light">ZN</span></span>
        </div>
        <nav className="flex flex-wrap justify-center gap-12 text-[9px] font-sans font-medium uppercase tracking-widest text-white/40">
          <a href="#" className="hover:text-white transition-all">Console</a>
          <a href="#" className="hover:text-white transition-all">Discord</a>
          <a href="#" className="hover:text-white transition-all">Whitepaper</a>
          <a href="#" className="hover:text-white transition-all">Github</a>
        </nav>
        <div className="text-center space-y-4">
          <p className="text-[9px] font-sans font-medium uppercase tracking-[0.4em] text-white/20">© MMXXVI LEGACYLOCK PROTOCOL CO.</p>
        </div>
      </footer>

    </div>
  );
}
