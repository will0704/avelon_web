import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#f97316',
}

export const metadata: Metadata = {
    title: {
        default: 'Avelon Admin Dashboard',
        template: '%s | Avelon Admin',
    },
    description: 'Admin dashboard for Avelon — a decentralized crypto lending platform on Ethereum.',
    keywords: ['avelon', 'crypto lending', 'admin dashboard', 'ethereum', 'defi'],
    robots: { index: false, follow: false },
    icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.className}>
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
