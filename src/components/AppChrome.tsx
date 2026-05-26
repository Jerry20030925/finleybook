'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false })
const BottomNavigation = dynamic(() => import('@/components/BottomNavigation'), { ssr: false })

const HIDDEN_CHROME_PATHS = new Set(['/', '/privacy', '/terms'])

export default function AppChrome() {
    const pathname = usePathname() || '/'

    if (HIDDEN_CHROME_PATHS.has(pathname)) {
        return null
    }

    return (
        <>
            <Navigation />
            <BottomNavigation />
        </>
    )
}
