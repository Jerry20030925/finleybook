'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../AuthProvider'
import MobileSplashScreen from './MobileSplashScreen'
import MobileLogin from './MobileLogin'
import MobileOnboarding from './MobileOnboarding'
import Dashboard from '../Dashboard' // Or we can use a wrapper to show sub-routes, but on root page we likely show Dashboard
import BottomNavigation from '../BottomNavigation'
// If we are on the root page, we want to show Dashboard?
// Actually, AppEntry is on page.tsx. The children of layout will include BottomNavigation.
// But MobileAppShell overrides the content of page.tsx.
// It doesn't override layout. 
// So layout (with BottomNavigation) surrounds this.
// We need to ensure BottomNavigation is hidden if we are in Splash/Login/Onboarding.
// We handled that in BottomNavigation by checking `!user`.
// But user exists during Onboarding? Yes.
// So BottomNavigation check for `!user` is good for Login.
// For Splash, `loading` is true usually, or user is null.
// For Onboarding, user IS logged in. We might want to hide BottomNav during onboarding.
// We can use a context or just accept it's there. 
// Or better: Onboarding overlays everything (z-index 50). 
// My MobileOnboarding has `fixed inset-0 z-50`. So it covers BottomNav. Good.

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const [showSplash, setShowSplash] = useState(true)
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        // Determine if we should show onboarding
        if (user && !loading && !showSplash) {
            // Check local storage or user profile
            const hasSeenOnboarding = localStorage.getItem('mobile_onboarding_completed')
            if (!hasSeenOnboarding) {
                setShowOnboarding(true)
            }
        }
    }, [user, loading, showSplash])

    // Complete Splash
    const handleSplashComplete = () => {
        setShowSplash(false)
    }

    // Complete Onboarding
    const handleOnboardingComplete = () => {
        setShowOnboarding(false)
        localStorage.setItem('mobile_onboarding_completed', 'true')
    }

    return (
        <AnimatePresence mode="wait">
            {(showSplash || loading) && (
                <motion.div key="splash" exit={{ opacity: 0 }} className="fixed inset-0 z-50">
                    <MobileSplashScreen onComplete={handleSplashComplete} />
                </motion.div>
            )}

            {!user && !showSplash && !loading && (
                <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <MobileLogin />
                </motion.div>
            )}

            {user && !showSplash && !loading && (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {showOnboarding && <MobileOnboarding onComplete={handleOnboardingComplete} />}
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
