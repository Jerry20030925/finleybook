'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import PageLoader from '@/components/PageLoader'
import SafeRing from '@/components/Navigator/SafeRing'
import EmojiTray from '@/components/Navigator/EmojiTray'
import { getUserFinancialSummary, addTransaction } from '@/lib/dataService'
import useSound from 'use-sound'
import toast, { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingWizard from '@/components/Onboarding/OnboardingWizard'

export default function Home() {
  const { user, loading } = useAuth()
  const [dailyBudget, setDailyBudget] = useState(50) // Default budget
  const [currentSpent, setCurrentSpent] = useState(0)
  const [playCrunch] = useSound('/sounds/crunch.mp3', { volume: 0.5 }) // Placeholder path
  const [playCoin] = useSound('/sounds/coin.mp3', { volume: 0.5 })

  useEffect(() => {
    if (user) {
      // Fetch today's spending
      // For MVP, we'll just calculate from recent transactions or use a dummy value
      // Real implementation would query Firestore for today's transactions
      getUserFinancialSummary(user.uid).then(summary => {
        // Approximate daily spent from monthly expenses / 30 for demo
        // Ideally we query "transactions where date == today"
        // Let's start with 0 for the "fresh day" feel
        setCurrentSpent(15) // Demo starting value
      })
    }
  }, [user])

  const handleExpense = async (item: any) => {
    if (!user) return

    // Play sound
    playCrunch()

    // Optimistic UI update
    const newSpent = currentSpent + item.defaultAmount
    setCurrentSpent(newSpent)

    // Show toast
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white px-6 py-4 rounded-full shadow-xl border border-gray-100 flex items-center gap-3"
      >
        <span className="text-2xl">{item.emoji}</span>
        <div>
          <p className="font-bold text-gray-900">-${item.defaultAmount}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      </motion.div>
    ))

    // Save to DB
    try {
      await addTransaction({
        userId: user.uid,
        amount: item.defaultAmount,
        category: item.category,
        description: `Quick add: ${item.label}`,
        date: new Date(),
        type: 'expense'
      })
    } catch (error) {
      console.error('Failed to save transaction:', error)
      toast.error('保存失败')
      setCurrentSpent(currentSpent) // Revert on failure
    }
  }

  if (loading) return <PageLoader />

  if (!user) {
    return <OnboardingWizard />
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

      {/* Main Ring */}
      <main className="flex flex-col items-center justify-center pt-12">
        <SafeRing dailyBudget={dailyBudget} currentSpent={currentSpent} />

        {/* Contextual Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 max-w-xs mx-auto mt-4"
        >
          {dailyBudget - currentSpent > 20
            ? "资金充足，喝杯奶茶没问题 🥤"
            : "余额告急，控制一下双手 💸"}
        </motion.p>
      </main>

      {/* Drag Tray */}
      <EmojiTray onDrop={handleExpense} />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20" />
      </div>
    </div>
  )
}