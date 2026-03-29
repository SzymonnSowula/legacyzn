"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./components/LandingPage";

export default function Home() {
    const { connected } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (connected) {
            router.push('/dashboard');
        }
    }, [connected, router]);

    return (
        <main className="min-h-screen relative selection:bg-white/30 text-white overflow-hidden">
            <div className="grain" />
            <LandingPage />
        </main>
    );
}
