'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

const AUTH_STORAGE_KEY = 'avelon:isAuthenticated'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        const authStatus = window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
        setIsAuthenticated(authStatus)

        if (!authStatus) {
            router.push('/login')
        }
    }, [router])

    const handleLogout = () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
        setIsAuthenticated(false)
        router.push('/login')
    }

    // Get current page from pathname
    const getCurrentPage = () => {
        if (pathname === '/admin') return 'dashboard'
        const segments = pathname.split('/')
        return segments[segments.length - 1] || 'dashboard'
    }

    const handleNavigate = (page: string) => {
        if (page === 'dashboard') {
            router.push('/admin')
        } else {
            router.push(`/admin/${page}`)
        }
    }

    // Show loading while checking auth
    if (isAuthenticated === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    // If not authenticated, don't render (redirect will happen)
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
