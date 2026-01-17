'use client'

import dynamic from 'next/dynamic'

const LoanRequestsContent = dynamic(
    () => import('@/components/pages/LoanRequests'),
    { ssr: false }
)

export default function LoanRequestsPage() {
    return <LoanRequestsContent />
}
