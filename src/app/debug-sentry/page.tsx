'use client'

import { useState } from 'react'

export default function SentryDebugPage() {
    const [errorCount, setErrorCount] = useState(0)

    const throwError = () => {
        setErrorCount(c => c + 1)
        throw new Error(`Sentry Test Error from Client Component (${new Date().toISOString()})`)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Sentry Debugger</h1>
                <p className="text-gray-600">
                    This page is used to verify that Sentry is correctly capturing errors on the client side.
                </p>

                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm text-left">
                    <strong>Note:</strong> Ensure you have added <code>NEXT_PUBLIC_SENTRY_DSN</code> to your <code>.env.local</code> file.
                </div>

                <button
                    onClick={throwError}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                    🚨 Throw Client Error
                </button>

                <p className="text-xs text-gray-400">
                    Error will be thrown instantly when clicked.
                </p>
            </div>
        </div>
    )
}
