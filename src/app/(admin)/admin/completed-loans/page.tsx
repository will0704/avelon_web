'use client'

import dynamic from 'next/dynamic'

const CompletedLoansContent = dynamic(
    () => import('@/components/pages/CompletedLoans'),
    { ssr: false }
)

export default function CompletedLoansPage() {
    return <CompletedLoansContent />
}
