'use client'

import dynamic from 'next/dynamic'

const UsersContent = dynamic(
    () => import('@/components/pages/Users'),
    { ssr: false }
)

export default function UsersPage() {
    return <UsersContent />
}
