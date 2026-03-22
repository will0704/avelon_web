import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Externalize optional peer deps pulled in by @reown/appkit-adapter-wagmi
    // via @coinbase/cdp-sdk (Solana, axios, zod) — we only use Ethereum/Sepolia.
    serverExternalPackages: [
        '@solana/kit',
        '@solana/signers',
        'axios',
        'zod',
        '@coinbase/cdp-sdk',
        '@base-org/account',
    ],
}

export default nextConfig
