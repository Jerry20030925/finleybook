'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'

const SmartNotificationManager = dynamic(() => import('@/components/SmartNotificationManager'), { ssr: false })
const GlobalTransactionWrapper = dynamic(() => import('@/components/GlobalTransactionWrapper'), { ssr: false })

const PUBLIC_PATHS = new Set(['/', '/privacy', '/terms'])

export default function AuthenticatedRuntimeFeatures() {
    const { user } = useAuth()
    const pathname = usePathname() || '/'

    if (!user || PUBLIC_PATHS.has(pathname)) {
        return null
    }

    return (
        <>
            <SmartNotificationManager />
            <GlobalTransactionWrapper />
        </>
    )
}
