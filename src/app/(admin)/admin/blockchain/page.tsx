'use client'

import dynamic from 'next/dynamic'

const BlockchainContent = dynamic(
    () => import('@/components/pages/Blockchain'),
    { ssr: false }
)

export default function BlockchainPage() {
    return <BlockchainContent />
}
