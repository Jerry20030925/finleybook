'use client'

import { useEffect, useState } from 'react'

export default function DebugAuth() {
    const [envStatus, setEnvStatus] = useState<any>(null)

    useEffect(() => {
        setEnvStatus({
            apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
        })
    }, [])

    if (!envStatus) return null

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
            <h3 className="font-bold mb-2">Firebase Env Check</h3>
            {Object.entries(envStatus).map(([key, exists]) => (
                <div key={key} className="flex justify-between gap-4">
                    <span>{key}:</span>
                    <span className={exists ? 'text-green-400' : 'text-red-400'}>
                        {exists ? 'OK' : 'MISSING'}
                    </span>
                </div>
            ))}
        </div>
    )
}
