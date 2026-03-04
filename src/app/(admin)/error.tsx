'use client'

/**
 * Error boundary for the admin route segment.
 * Catches errors within admin pages without breaking the entire app.
 */
export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex min-h-full items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Page Error</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Something went wrong loading this page. The sidebar and navigation should still work.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-400 mb-4 font-mono">Error ID: {error.digest}</p>
                )}
                <button
                    onClick={reset}
                    className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}
