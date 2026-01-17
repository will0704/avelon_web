'use client'

import dynamic from 'next/dynamic'

const WalletContent = dynamic(
    () => import('@/components/pages/Wallet'),
    { ssr: false }
)

export default function WalletPage() {
    return <WalletContent />
}
