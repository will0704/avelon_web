'use client'

import dynamic from 'next/dynamic'

const PaymentHistoryContent = dynamic(
    () => import('@/components/pages/Paymenthistory'),
    { ssr: false }
)

export default function PaymentHistoryPage() {
    return <PaymentHistoryContent />
}
