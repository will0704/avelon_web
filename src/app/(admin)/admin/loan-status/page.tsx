'use client'

import dynamic from 'next/dynamic'

const LoanStatusContent = dynamic(
    () => import('@/components/pages/LoanStatus'),
    { ssr: false }
)

export default function LoanStatusPage() {
    return <LoanStatusContent />
}
