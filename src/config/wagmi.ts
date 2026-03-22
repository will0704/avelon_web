import { cookieStorage, createStorage, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
    throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required');
}

// Only Sepolia chain configured — prevents mainnet connections.
export const wagmiConfig = createConfig({
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
});

export const walletConnectMetadata = {
    name: 'Avelon',
    description: 'Decentralized Lending Platform',
    url: 'https://avelon.app',
    icons: ['/favicon.ico'],
};

export { projectId };
