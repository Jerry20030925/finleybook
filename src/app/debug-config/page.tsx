'use client'

import { useEffect, useState } from 'react'
import { initializeFirebase } from '@/lib/firebase'
import { getApp } from 'firebase/app'

export default function DebugConfigPage() {
    const [config, setConfig] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkConfig = async () => {
            try {
                await initializeFirebase()
                const app = getApp()
                setConfig(app.options)
            } catch (err: any) {
                setError(err.message)
            }
        }
        checkConfig()
    }, [])

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Firebase Configuration Debug</h1>

            {error && (
                <div className="bg-red-100 p-4 mb-4 rounded text-red-700">
                    Error: {error}
                </div>
            )}

            {config && (
                <div className="bg-gray-100 p-4 rounded">
                    <pre>{JSON.stringify(config, null, 2)}</pre>
                </div>
            )}

            <div className="mt-8">
                <h2 className="font-bold">Expected API Key:</h2>
                <p>AIzaSyBQkaR0Bq9sIqFaLvlCUpQEVBWKu2AT5zc</p>
            </div>
        </div>
    )
}
