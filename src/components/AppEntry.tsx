'use client'

import React from 'react'
import { isMobileApp } from '@/lib/mobileUtils'
import HomePage from './HomePage'
import MobileAppShell from './Mobile/MobileAppShell'
import Dashboard from './Dashboard'
import { useAuth } from './AuthProvider'

// AppEntry handles the decision between Web and Mobile views
export default function AppEntry() {
    const { user } = useAuth()

    // 1. Mobile App View
    if (isMobileApp()) {
        return (
            <MobileAppShell>
                {/* If logged in and past onboarding, MobileAppShell renders children */}
                <Dashboard />
            </MobileAppShell>
        )
    }

    // 2. Web View (Existing behavior)
    // If user is logged in on web, they might still want to see Landing Page first?
    // Or do they go straight to Dashboard?
    // Current logic in page.tsx was just <HomePage />.
    // And Dashboard is at /dashboard.
    // So for Web, we stick to Landing Page at root.
    return <HomePage />
}
