import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const WSOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface TokenAsset {
    mint: string;
    symbol: string;
    name: string;
    balance: number;
    uiAmountString: string;
    price: number;
    valueUsd: number;
    icon?: string;
}

export function useTokenAssets() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [assets, setAssets] = useState<TokenAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalValueUsd, setTotalValueUsd] = useState(0);

    const fetchAssets = useCallback(async () => {
        if (!wallet.publicKey) {
            setAssets([]);
            setTotalValueUsd(0);
            return;
        }

        setIsLoading(true);
        try {
            // 1. Fetch SOL balance
            const solBalance = await connection.getBalance(wallet.publicKey);
            const solUiAmount = solBalance / 1e9;

            // 2. Fetch SPL Token Accounts
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
                programId: TOKEN_PROGRAM_ID
            });

            const balances = tokenAccounts.value
                .map(ta => {
                    const info = ta.account.data.parsed.info;
                    return {
                        mint: info.mint,
                        uiAmount: info.tokenAmount.uiAmount,
                        uiAmountString: info.tokenAmount.uiAmountString,
                    };
                })
                .filter(b => b.uiAmount > 0);

            // Construct list of mints to fetch prices
            const mintsToFetch = [WSOL_MINT, ...balances.map(b => b.mint)];

            // 3. Fetch Prices from Jupiter
            const prices: Record<string, number> = {};
            if (mintsToFetch.length > 0) {
                try {
                    // Jupiter limits to 100 ids per request usually, we slice to first 50 just in case
                    const ids = mintsToFetch.slice(0, 50).join(",");
                    const priceRes = await fetch(`https://api.jup.ag/price/v2/simple?ids=${ids}`, {
                        headers: {
                            'x-api-key': '30c1c0c7-23e8-42c8-98c3-eb688e0cb0c4'
                        }
                    });
                    if (priceRes.ok) {
                        const priceJson = await priceRes.json();
                        if (priceJson.data) {
                            for (const [mint, data] of Object.entries(priceJson.data)) {
                                const pdata = data as Record<string, unknown>;
                                prices[mint] = parseFloat((pdata.price as string) || "0");
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch from Jupiter API, using default/mock prices for devnet.", e);
                }
            }

            // 4. Construct Final Assets array
            const finalAssets: TokenAsset[] = [];

            // Add SOL
            const solPrice = prices[WSOL_MINT] || 148.55;
            finalAssets.push({
                mint: WSOL_MINT,
                symbol: "SOL",
                name: "Solana",
                balance: solUiAmount,
                uiAmountString: solUiAmount.toFixed(4),
                price: solPrice,
                valueUsd: solUiAmount * solPrice,
                icon: "☀️"
            });

            // Very basic token metadata mapping for common tokens (since we don't have Metaplex API handy here)
            const getMeta = (mint: string) => {
                if (mint === USDC_MINT) return { symbol: "USDC", name: "USD Coin", icon: "💵" };
                // fallback UI
                return { symbol: mint.slice(0, 4).toUpperCase(), name: "Unknown Token", icon: "🪙" };
            };

            for (const b of balances) {
                // Fallback to random mock price for devnet tokens if 0
                const price = prices[b.mint] || (Math.random() * 10 + 0.5);
                const meta = getMeta(b.mint);
                finalAssets.push({
                    mint: b.mint,
                    symbol: meta.symbol,
                    name: meta.name,
                    balance: b.uiAmount,
                    uiAmountString: b.uiAmountString,
                    price: price,
                    valueUsd: b.uiAmount * price,
                    icon: meta.icon
                });
            }

            // Sort by USD value
            finalAssets.sort((a, b) => b.valueUsd - a.valueUsd);

            setAssets(finalAssets);
            setTotalValueUsd(finalAssets.reduce((acc, curr) => acc + curr.valueUsd, 0));

        } catch (error) {
            console.error("Error fetching token assets:", error);
        } finally {
            setIsLoading(false);
        }
    }, [wallet.publicKey, connection]);

    useEffect(() => {
        fetchAssets();
        const interval = setInterval(fetchAssets, 30000); // 30s auto-refresh for tokens
        return () => clearInterval(interval);
    }, [fetchAssets]);

    return { assets, totalValueUsd, isLoading, refreshAssets: fetchAssets };
}
