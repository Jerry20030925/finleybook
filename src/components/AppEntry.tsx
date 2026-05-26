'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import HomePage from './HomePage'
import ErrorBoundary from './ErrorBoundary'
import { isMobileApp } from '@/lib/mobileUtils'

const MobileAppShell = dynamic(() => import('./Mobile/MobileAppShell'), { ssr: false })
const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false })

// AppEntry handles the decision between Web and Mobile views
export default function AppEntry() {
    const isNativeMobileApp = isMobileApp()

    // 1. Mobile App View (Client-side only check)
    if (isNativeMobileApp) {
        return (
            <ErrorBoundary>
                <MobileAppShell>
                    {/* If logged in and past onboarding, MobileAppShell renders children */}
                    <Dashboard />
                </MobileAppShell>
            </ErrorBoundary>
        )
    }

    // 2. Web View (Default for SSR and Web)
    // If user is logged in on web, they might still want to see Landing Page first?
    // Or do they go straight to Dashboard?
    // Current logic in page.tsx was just <HomePage />.
    // And Dashboard is at /dashboard.
    // So for Web, we stick to Landing Page at root.
    return (
        <ErrorBoundary>
            <HomePage />
        </ErrorBoundary>
    )
}
