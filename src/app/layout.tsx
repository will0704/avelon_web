import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
    title: 'Avelon Admin Dashboard',
    description: 'Decentralized Crypto Lending Platform - Admin Dashboard',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
