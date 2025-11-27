'use client'

import { useEffect, useState } from 'react'
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
import ProfitOrb from '@/components/Dashboard/ProfitOrb'
import OpportunityRadar from '@/components/Dashboard/OpportunityRadar'
import WishlistDrawer from '@/components/Dashboard/WishlistDrawer'

export default function Home() {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [totalSaved, setTotalSaved] = useState(125.00) // Demo initial value
  const [playCoin] = useSound('/sounds/coin.mp3', { volume: 0.5 })



  const handleProfit = (amount: number) => {
    playCoin()
    setTotalSaved(prev => prev + amount)
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold"
      >
        <span>💰 +${amount}</span>
      </motion.div>
    ))
  }

  if (loading) return <PageLoader />

  const [initialStep, setInitialStep] = useState(0)

  // ...

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

  return (
    <div className="min-h-screen bg-gray-50 pb-32 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="pt-8 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">早安, {user.displayName || '朋友'}</h1>
          <p className="text-sm text-gray-500">保持财务健康</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
          {user.email?.[0].toUpperCase()}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-start pt-8 pb-24 px-4 min-h-screen">
        <ProfitOrb totalSaved={totalSaved} />

        <div className="w-full max-w-md">
          <h2 className="text-lg font-bold text-gray-900 mb-2 px-4">机会雷达 📡</h2>
          <OpportunityRadar
            onAccept={(opp) => handleProfit(opp.savedAmount)}
            onReject={() => { }}
          />
        </div>
      </main>

      {/* Wishlist Drawer */}
      <WishlistDrawer onGiveUp={(item) => handleProfit(item.price)} />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-gray-900">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
    </div>
  )
}