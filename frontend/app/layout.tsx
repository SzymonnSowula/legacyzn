import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { WalletProviderComp } from './components/WalletProvider';
import { Toaster } from 'sonner';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'LEGACY LOCK // SECURE YOUR HERITAGE',
    description: 'Decentralized Inheritance Protocol. Automated. Secure. Immutable.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
            <body className="font-sans antialiased min-h-screen bg-black text-white selection:bg-white selection:text-black">
                <WalletProviderComp>
                    {children}
                </WalletProviderComp>
                <Toaster richColors position="bottom-right" theme="dark" />
            </body>
        </html>
    );
}
