'use client'

import dynamic from 'next/dynamic'

const TransactionsContent = dynamic(
    () => import('@/components/pages/Transaction'),
    { ssr: false }
)

export default function TransactionsPage() {
    return <TransactionsContent />
}
