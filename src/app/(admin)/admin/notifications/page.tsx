'use client'

import dynamic from 'next/dynamic'

const NotificationsContent = dynamic(
    () => import('@/components/pages/Notifications'),
    { ssr: false }
)

export default function NotificationsPage() {
    return <NotificationsContent />
}
