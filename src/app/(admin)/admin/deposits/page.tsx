'use client'

import dynamic from 'next/dynamic'

const DepositsContent = dynamic(
    () => import('@/components/pages/Deposits'),
    { ssr: false }
)

export default function DepositsPage() {
    return <DepositsContent />
}
