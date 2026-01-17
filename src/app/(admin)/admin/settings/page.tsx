'use client'

import dynamic from 'next/dynamic'

const SettingsContent = dynamic(
    () => import('@/components/pages/Settings'),
    { ssr: false }
)

export default function SettingsPage() {
    return <SettingsContent />
}
