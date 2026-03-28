import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProviderComp } from './components/WalletProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'LegacyLock',
    description: 'Decentralized Inheritance Protocol on Solana',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50`}>
                <WalletProviderComp>
                    {children}
                </WalletProviderComp>
                <Toaster richColors position="bottom-right" theme="dark" />
            </body>
        </html>
    );
}
