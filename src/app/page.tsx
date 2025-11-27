'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import PageLoader from '@/components/PageLoader'
import SafeRing from '@/components/Navigator/SafeRing'
import EmojiTray from '@/components/Navigator/EmojiTray'
import { addTransaction } from '@/lib/dataService'
import useSound from 'use-sound'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingWizard from '@/components/Onboarding/OnboardingWizard'
import LandingPage from '@/components/LandingPage'


export default function Home() {
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

  if (loading) return <PageLoader />

  if (!user) {
    if (showOnboarding) {
      return <OnboardingWizard initialStep={initialStep} />
    }
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

  // Show loading while redirecting
  return <PageLoader />
}