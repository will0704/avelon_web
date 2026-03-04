import Link from 'next/link'

/**
 * Global 404 page.
 */
export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md text-center">
                <p className="text-7xl font-bold text-orange-500 mb-4">404</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-sm text-gray-500 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/admin"
                    className="inline-block rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
