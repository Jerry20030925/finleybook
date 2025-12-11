'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import PageLoader from '@/components/PageLoader'
import OnboardingWizard from '@/components/Onboarding/OnboardingWizard'
import LandingPage from '@/components/LandingPage'

export default function HomePage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [initialStep, setInitialStep] = useState(0)

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard')
        }
    }, [user, loading, router])

    // Optimized for SEO: Render Landing Page immediately.
    // If user is logged in, the useEffect above will redirect them.
    // We only show Onboarding if explicitly triggered or needed.

    if (showOnboarding) {
        return <OnboardingWizard initialStep={initialStep} />
    }

    // Always render LandingPage by default (SSR friendly)
    // The auth redirect happens client-side if needed
    return (
        <LandingPage
            onStart={() => {
                setInitialStep(0)
                setShowOnboarding(true)
            }}
            onLogin={() => {
                setInitialStep(3) // Jump to auth step
                setShowOnboarding(true)
            }}
        />
    )
}
