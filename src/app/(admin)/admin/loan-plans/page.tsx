'use client'

import dynamic from 'next/dynamic'

const LoanPlansContent = dynamic(
    () => import('@/components/pages/Loan Plans'),
    { ssr: false }
)

export default function LoanPlansPage() {
    return <LoanPlansContent />
}
