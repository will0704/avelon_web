'use client';

import { WagmiProvider, type State } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, walletConnectMetadata, projectId } from '@/config/wagmi';
import { createAppKit } from '@reown/appkit/react';
import { sepolia } from 'wagmi/chains';
import type { ReactNode } from 'react';

// Initialize AppKit (Web3Modal)
createAppKit({
    projectId,
    wagmiConfig,
    metadata: walletConnectMetadata,
    defaultChain: sepolia,
});

const queryClient = new QueryClient();

export function WalletProvider({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState?: State;
}) {
    return (
        <WagmiProvider config={wagmiConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
