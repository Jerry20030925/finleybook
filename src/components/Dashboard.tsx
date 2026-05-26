import { useState, useEffect, useCallback, lazy, Suspense, useMemo, useRef, useDeferredValue, startTransition, type ReactNode } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useInView } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { useIsMobile } from '@/hooks/useIsMobile'
import PageLoader from './PageLoader'
import FinancialOverview from './FinancialOverview'
import RecentTransactions from './RecentTransactions'
import SmartSuggestions from './Dashboard/SmartSuggestions'
import QuickActions from './QuickActions'
import TouchableScale from './TouchableScale'
import VisionBoard from './VisionBoard'
import { getUserTransactions, Transaction, getBudgets, Goal } from '@/lib/dataService'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useLanguage } from './LanguageProvider'
import { getUserDisplayName } from '@/lib/userUtils'
import toast from 'react-hot-toast'
import InviteFriendModal from './Dashboard/InviteFriendModal'
import GettingStartedGuide from './Dashboard/GettingStartedGuide'

import { useRouter } from 'next/navigation'
import StreakCounter from './Dashboard/StreakCounter'
import PullToRefresh from '@/components/Mobile/PullToRefresh'
import DashboardBackground from './Dashboard/DashboardBackground'
import PlanValueCard from './Dashboard/PlanValueCard'
import MobileShortcutBar from './Dashboard/MobileShortcutBar'
import BackToTop from './BackToTop'
import { useConfetti } from '@/hooks/useConfetti'
import AuthModal from './AuthModal'
import ReferralStatsCard from './Referral/ReferralStats'
import { useExperience } from '@/components/ExperienceProvider'

// Lazy Load Heavy Components
const WealthAnalytics = lazy(() => import('./WealthAnalytics'))
const TransactionModal = lazy(() => import('./TransactionModal'))
const ReceiptUploadModal = lazy(() => import('./ReceiptUploadModal'))
const CsvImportModal = lazy(() => import('./CsvImportModal'))
const AIChatInput = dynamic(() => import('./AIChatInput'), { ssr: false })

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`rounded bg-slate-100 animate-pulse ${className}`} />
}

function PanelSkeleton({ className = '', children }: { className?: string, children?: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white/70 shadow-sm p-4 ${className}`}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const isMobile = useIsMobile() // Correct usage for hydration safety
  const { reduceMotion, allowRichMotion, lowPowerDevice } = useExperience()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [aiPrefill, setAiPrefill] = useState('')
  const [aiPrefillKey, setAiPrefillKey] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [shouldMountAI, setShouldMountAI] = useState(false)
  const [shouldMountBackground, setShouldMountBackground] = useState(false)
  const [shouldMountQuickActions, setShouldMountQuickActions] = useState(false)
  const [shouldMountSecondaryChrome, setShouldMountSecondaryChrome] = useState(false)
  const [shouldMountBackToTop, setShouldMountBackToTop] = useState(false)
  const { fire: fireConfetti } = useConfetti()
  const loadedUserIdRef = useRef<string | null>(null)
  const inFlightTransactionsFetchRef = useRef<{ userId: string | null, promise: Promise<Transaction[]> | null, key: symbol | null }>({ userId: null, promise: null, key: null })
  const analyticsRef = useRef<HTMLDivElement | null>(null)
  const analyticsInView = useInView(analyticsRef, { once: true, margin: '220px' })
  const [shouldRenderAnalytics, setShouldRenderAnalytics] = useState(false)
  const smartSuggestionsRef = useRef<HTMLDivElement | null>(null)
  const smartSuggestionsInView = useInView(smartSuggestionsRef, { once: true, margin: '220px' })
  const [shouldRenderSmartSuggestions, setShouldRenderSmartSuggestions] = useState(false)
  const rightWidgetsRef = useRef<HTMLDivElement | null>(null)
  const rightWidgetsInView = useInView(rightWidgetsRef, { once: true, margin: '220px' })
  const [shouldRenderRightWidgets, setShouldRenderRightWidgets] = useState(false)
  const enableScrollAnimations = !isMobile && allowRichMotion
  const showAnimatedBackground = !isMobile && allowRichMotion && !lowPowerDevice
  const deferredTransactions = useDeferredValue(transactions)
  const deferredMonthlyBudget = useDeferredValue(monthlyBudget)

  const sectionRevealProps = enableScrollAnimations ? {
    initial: { opacity: 1, y: isMobile ? 8 : 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.28, ease: 'easeOut' }
  } : {}
  const cardHoverProps = !isMobile && !reduceMotion
    ? { whileHover: { y: -4, transition: { duration: 0.2 } } }
    : {}

  // Real streak from userProfile
  const currentStreak = userProfile?.streak || 0
  const longestStreak = userProfile?.longestStreak || 0
  const streakMilestones = userProfile?.streakMilestones || []
  const activeDays = userProfile?.loginDates || []
  const { fire: triggerConfetti } = useConfetti()

  const isStreakActive = useMemo(() => {
    try {
      if (!userProfile?.lastLogin) return true
      const now = new Date()
      const last = typeof userProfile.lastLogin.toDate === 'function'
        ? userProfile.lastLogin.toDate()
        : new Date(userProfile.lastLogin)
      const diff = now.getTime() - last.getTime()
      const hours = diff / (1000 * 60 * 60)
      return hours < 48
    } catch (e) {
      return true
    }
  }, [userProfile?.lastLogin])

  // Celebrate new streak milestones
  useEffect(() => {
    const newMilestone = userProfile?.newMilestone
    if (newMilestone && typeof newMilestone === 'number') {
      const labels: Record<number, string> = { 7: '1 Week', 30: '1 Month', 100: '100 Days', 365: '1 Year' }
      triggerConfetti()
      toast.success(`🏆 Streak milestone: ${labels[newMilestone] || newMilestone + ' days'}!`, { duration: 5000 })
    }
  }, [userProfile?.newMilestone, triggerConfetti])

  const displayName = useMemo(() => getUserDisplayName(user), [user])
  const hasReportReady = deferredTransactions.length > 0

  useEffect(() => {
    if (!enableScrollAnimations || analyticsInView) {
      setShouldRenderAnalytics(true)
    }
  }, [analyticsInView, enableScrollAnimations])

  useEffect(() => {
    if (!enableScrollAnimations || smartSuggestionsInView) {
      setShouldRenderSmartSuggestions(true)
    }
  }, [enableScrollAnimations, smartSuggestionsInView])

  useEffect(() => {
    if (!enableScrollAnimations || rightWidgetsInView) {
      setShouldRenderRightWidgets(true)
    }
  }, [enableScrollAnimations, rightWidgetsInView])

  useEffect(() => {
    if (!showAnimatedBackground) {
      setShouldMountBackground(false)
      return
    }
    if (typeof window === 'undefined') {
      setShouldMountBackground(true)
      return
    }

    let timeoutId: number | undefined
    let idleId: number | undefined
    const mount = () => setShouldMountBackground(true)

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 1200 })
    } else {
      timeoutId = window.setTimeout(mount, 500)
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [showAnimatedBackground])

  useEffect(() => {
    if (isAiOpen) {
      setShouldMountAI(true)
      return
    }

    if (typeof window === 'undefined') return

    let timeoutId: number | undefined
    let idleId: number | undefined
    const enableMount = () => setShouldMountAI(true)

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(enableMount, { timeout: 1500 })
    } else {
      timeoutId = window.setTimeout(enableMount, 900)
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [isAiOpen])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShouldMountQuickActions(true)
      return
    }

    let timeoutId: number | undefined
    let idleId: number | undefined
    const mount = () => setShouldMountQuickActions(true)

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 900 })
    } else {
      timeoutId = window.setTimeout(mount, 180)
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShouldMountSecondaryChrome(true)
      setShouldMountBackToTop(true)
      return
    }

    let rafId: number | undefined
    let timeoutId: number | undefined
    let idleId: number | undefined
    let backToTopTimeoutId: number | undefined

    rafId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => setShouldMountSecondaryChrome(true), 140)
    })

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => setShouldMountBackToTop(true), { timeout: 1200 })
    } else {
      backToTopTimeoutId = window.setTimeout(() => setShouldMountBackToTop(true), 420)
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      if (timeoutId) window.clearTimeout(timeoutId)
      if (backToTopTimeoutId) window.clearTimeout(backToTopTimeoutId)
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [])

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hydration safe user check
  useEffect(() => {
    if (user?.metadata?.creationTime) {
      const created = new Date(user.metadata.creationTime).getTime()
      const now = new Date().getTime()
      setIsNewUser((now - created) < 7 * 24 * 60 * 60 * 1000)
    }
  }, [user?.metadata?.creationTime])

  const fetchTransactions = useCallback(async (userId: string) => {
    const currentInFlight = inFlightTransactionsFetchRef.current
    if (currentInFlight.userId === userId && currentInFlight.promise) {
      return currentInFlight.promise
    }

    const requestKey = Symbol('transactions-fetch')
    const requestPromise = (async () => {
      try {
        // Fetch more for comprehensive stats and "Show More" in RecentTransactions
        const txs = await getUserTransactions(userId, 200)
        startTransition(() => {
          setTransactions(txs)
        })
        return txs
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return [] as Transaction[]
      } finally {
        if (inFlightTransactionsFetchRef.current.key === requestKey) {
          inFlightTransactionsFetchRef.current = { userId: null, promise: null, key: null }
        }
      }
    })()

    inFlightTransactionsFetchRef.current = { userId, promise: requestPromise, key: requestKey }
    return requestPromise
  }, [])

  // Failsafe Timeout to prevent infinite blank screen
  useEffect(() => {
    if (loading && user?.uid) {
      const timeoutId = setTimeout(() => {
        console.warn('[Dashboard] Loading timed out (3s). Forcing content display.')
        setLoading(false)
      }, 3000)
      return () => clearTimeout(timeoutId)
    }
  }, [loading, user?.uid])

  // Data Fetching Effect
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined
    let unsubscribeGoals: (() => void) | undefined
    let isCancelled = false

    const fetchData = async () => {
      if (!user?.uid) return

      const isInitialLoad = loadedUserIdRef.current !== user.uid

      try {
        if (isInitialLoad) {
          setLoading(true)
        }

        const userRef = doc(db, 'users', user.uid)
        unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
          if (isCancelled) return
          if (snapshot.exists()) {
            startTransition(() => {
              setUserProfile(snapshot.data())
            })
          }
        })

        const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid))
        unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
          if (isCancelled) return
          const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal))
          startTransition(() => {
            setPrimaryGoal(goals.length > 0 ? goals[0] : null)
          })
        })

        const [, budgets] = await Promise.all([
          fetchTransactions(user.uid),
          getBudgets(user.uid)
        ])
        if (isCancelled) return

        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
        startTransition(() => {
          setMonthlyBudget(totalBudget)
        })
        loadedUserIdRef.current = user.uid

      } catch (error) {
        if (isCancelled) return
        console.error("[Dashboard] Failed to fetch data:", error)
        toast.error(t('common.errorLoading'))
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    if (!authLoading && user?.uid) {
      fetchData()
    } else if (!authLoading && !user) {
      loadedUserIdRef.current = null
      setLoading(false)
    }

    return () => {
      isCancelled = true
      if (unsubscribeProfile) unsubscribeProfile()
      if (unsubscribeGoals) unsubscribeGoals()
    }
  }, [user?.uid, authLoading, t, fetchTransactions])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [authLoading, user, router])

  // Fix: create a stable wrapper for child components that don't know userId
  const handleDataRefresh = useCallback(async () => {
    if (user?.uid) {
      await fetchTransactions(user.uid)
    }
  }, [user?.uid, fetchTransactions])


  const handleRefresh = useCallback(async () => {
    if (user?.uid) {
      await fetchTransactions(user.uid)
    }
    await new Promise(resolve => setTimeout(resolve, 800))
  }, [user?.uid, fetchTransactions])

  const openAiCoach = useCallback((prompt: string) => {
    setAiPrefill(prompt)
    setAiPrefillKey((prev) => prev + 1)
    setIsAiOpen(true)
  }, [])

  const isGuest = user?.isAnonymous

  const shouldShowLoader = !isMounted || authLoading || loading || !user?.uid

  return (
    <>
      {shouldShowLoader ? (
        <PageLoader />
      ) : (
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-[100dvh] bg-[#F8FAFC] pb-24 transition-colors duration-500 relative overflow-x-hidden">
            {/* Memoized Background */}
            {showAnimatedBackground && shouldMountBackground && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <DashboardBackground />
              </div>
            )}

            {/* GUEST BANNER */}
            {isGuest && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm relative z-50 px-4 py-3"
              >
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 text-orange-800">
                    <span className="text-xl">👻</span>
                    <span>You are currently in <strong>Guest Mode</strong>. Your data is saved locally but will be lost if you clear cookies.</span>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-orange-500/20"
                  >
                    Sign Up to Save
                  </button>
                </div>
              </motion.div>
            )}

            <motion.main
              className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 relative z-10"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              {/* Header */}
              <motion.div
                className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2 relative z-10"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                <div className="text-left">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
                    {t('dashboard.welcomeBack', { name: displayName })}
                  </h1>
                  <p className="text-base md:text-lg text-slate-500 font-medium mt-2 flex items-center gap-2">
                    <span className="w-8 h-px bg-slate-200"></span>
                    {t('dashboard.wealthCommandCenter')}
                  </p>
                </div>

                <div className="self-start md:self-auto">
                  <StreakCounter streak={currentStreak} isActive={isStreakActive} longestStreak={longestStreak} milestones={streakMilestones} activeDays={activeDays} />
                </div>
              </motion.div>

              {/* Getting Started Guide */}
              {/* Getting Started Guide */}
              <motion.div
                className="relative z-10 content-auto"
                {...sectionRevealProps}
              >
                <GettingStartedGuide
                  hasTransactions={deferredTransactions.length > 0}
                  hasBudget={deferredMonthlyBudget > 0}
                  hasReportReady={hasReportReady}
                  hasProfile={!!user?.displayName || !!userProfile?.displayName}
                  onAddTransaction={() => setActiveModal('transaction')}
                  onImportCsv={() => setActiveModal('csv')}
                  isNewUser={isNewUser}
                />
              </motion.div>

              {/* 1. HERO: Financial Overview (Top Anchor) */}
              {/* 1. HERO: Financial Overview (Top Anchor) */}
              <motion.div
                className="relative z-10 content-auto"
                {...sectionRevealProps}
              >
                <TouchableScale
                  className="mb-8 block"
                  scale={0.98}
                >
                  <FinancialOverview
                    transactions={deferredTransactions}
                    monthlyBudget={deferredMonthlyBudget}
                    onAskAI={openAiCoach}
                  />
                </TouchableScale>
              </motion.div>

              {/* Main Grid Layout (66% Left / 33% Right) */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 relative z-10 content-auto"
                {...sectionRevealProps}
              >
                {/* Left Column (66% -> col-span-8) - DATA HEAVY */}
                <div className="lg:col-span-8 space-y-4 md:space-y-8">

                  {/* 2. Quick Actions (Prioritized for Mobile) */}
                  <motion.div className="lg:hidden content-auto" {...sectionRevealProps}>
                    {shouldMountSecondaryChrome ? (
                      <PlanValueCard />
                    ) : (
                      <PanelSkeleton className="h-[116px]">
                        <SkeletonLine className="h-4 w-36" />
                        <SkeletonLine className="mt-3 h-6 w-2/3" />
                        <SkeletonLine className="mt-4 h-9 w-full rounded-xl" />
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  <motion.div className="lg:hidden content-auto" {...sectionRevealProps}>
                    {shouldMountSecondaryChrome ? (
                      <MobileShortcutBar />
                    ) : (
                      <PanelSkeleton className="h-[78px] p-3">
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <SkeletonLine key={idx} className="h-12 rounded-xl" />
                          ))}
                        </div>
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  <motion.div className="mb-2 content-auto" {...sectionRevealProps}>
                    {shouldMountQuickActions ? (
                      <QuickActions onInvite={() => setShowInviteModal(true)} onDataRefresh={handleDataRefresh} />
                    ) : (
                      <PanelSkeleton className="p-3">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {Array.from({ length: 6 }).map((_, idx) => (
                            <SkeletonLine key={idx} className="h-12 rounded-xl" />
                          ))}
                        </div>
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  {/* 3. Recent Transactions (High Usage) */}
                  <motion.div {...sectionRevealProps} {...cardHoverProps}>
                    <TouchableScale
                      scale={0.99}
                    // Note: We don't need router.push anymore because RecentTransactions handles its own display
                    // onClick={() => router.push('/transactions')} 
                    >
                      <RecentTransactions
                        transactions={deferredTransactions}
                        onTransactionUpdate={handleDataRefresh}
                      />
                    </TouchableScale>
                  </motion.div>

                  {/* 4. Charts (Secondary) - Deferred Loading */}
                  <motion.div ref={analyticsRef} {...sectionRevealProps} {...cardHoverProps}>
                    <Suspense fallback={
                      <PanelSkeleton className="h-[300px]">
                        <SkeletonLine className="h-4 w-36" />
                        <SkeletonLine className="h-3 w-24 mt-2" />
                        <div className="mt-6 h-[220px] rounded-xl bg-slate-50 animate-pulse" />
                      </PanelSkeleton>
                    }>
                      {shouldRenderAnalytics ? (
                        <TouchableScale scale={0.99}>
                          <WealthAnalytics transactions={deferredTransactions} />
                        </TouchableScale>
                      ) : (
                        <PanelSkeleton className="h-[300px]">
                          <SkeletonLine className="h-4 w-36" />
                          <SkeletonLine className="h-3 w-24 mt-2" />
                          <div className="mt-6 h-[220px] rounded-xl bg-slate-50 animate-pulse" />
                        </PanelSkeleton>
                      )}
                    </Suspense>
                  </motion.div>
                </div>

                {/* Right Column (33% -> col-span-4) - ACTION & INSIGHTS */}
                <div className="lg:col-span-4 space-y-4 md:space-y-6">
                  <motion.div className="hidden lg:block content-auto" {...sectionRevealProps} {...cardHoverProps}>
                    {shouldMountSecondaryChrome ? (
                      <PlanValueCard />
                    ) : (
                      <PanelSkeleton className="h-[132px]">
                        <SkeletonLine className="h-4 w-40" />
                        <SkeletonLine className="mt-3 h-7 w-3/4" />
                        <SkeletonLine className="mt-4 h-10 w-full rounded-xl" />
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  {/* 2. Finley AI (Insights First) */}
                  <motion.div ref={smartSuggestionsRef} className="min-h-[180px]" {...sectionRevealProps} {...cardHoverProps}>
                    {shouldRenderSmartSuggestions ? (
                      <SmartSuggestions transactions={deferredTransactions} monthlyBudget={deferredMonthlyBudget} />
                    ) : (
                      <PanelSkeleton className="h-[180px]">
                        <SkeletonLine className="h-4 w-40" />
                        <SkeletonLine className="mt-3 h-3 w-5/6" />
                        <SkeletonLine className="mt-2 h-3 w-2/3" />
                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <SkeletonLine className="h-10 rounded-xl" />
                          <SkeletonLine className="h-10 rounded-xl" />
                        </div>
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  {/* 3. Intelligence Hub */}
                  <motion.div className="content-auto" {...sectionRevealProps} {...cardHoverProps}>
                    <Link href="/reports" className="block">
                      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-xl">
                        <p className="text-xs uppercase tracking-[0.2em] text-indigo-200 mb-2">Finley Intelligence</p>
                        <h3 className="text-xl font-bold mb-2">Monthly Wealth Brief</h3>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          Open your executive financial report with trend diagnostics, category signals, and action priorities.
                        </p>
                      </div>
                    </Link>
                  </motion.div>

                  {/* 4. Compact Vision Board (Progress Tracker) */}
                  <motion.div ref={rightWidgetsRef} {...sectionRevealProps} {...cardHoverProps}>
                    {shouldRenderRightWidgets ? (
                      <Link href="/goals">
                        <VisionBoard primaryGoal={primaryGoal} compact={true} />
                      </Link>
                    ) : (
                      <PanelSkeleton className="p-5">
                        <SkeletonLine className="h-4 w-32" />
                        <SkeletonLine className="mt-3 h-20 rounded-xl" />
                      </PanelSkeleton>
                    )}
                  </motion.div>

                  {/* 5. Referral Progress */}
                  {user && (
                    <motion.div {...sectionRevealProps} {...cardHoverProps}>
                      {shouldRenderRightWidgets ? (
                        <ReferralStatsCard />
                      ) : (
                        <PanelSkeleton className="p-5">
                          <SkeletonLine className="h-4 w-36" />
                          <SkeletonLine className="mt-3 h-16 rounded-xl" />
                        </PanelSkeleton>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.main>

            <InviteFriendModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
            />

            {/* Lazy Loaded Modals with Suspense */}
            <Suspense fallback={null}>
              {activeModal === 'transaction' && (
                <TransactionModal
                  isOpen={true}
                  onClose={() => setActiveModal(null)}
                  onSuccess={() => {
                    setActiveModal(null)
                    handleDataRefresh()
                    fireConfetti()
                  }}
                />
              )}

              {activeModal === 'receipt' && (
                <ReceiptUploadModal
                  onClose={() => setActiveModal(null)}
                />
              )}

              {activeModal === 'csv' && (
                <CsvImportModal
                  isOpen={true}
                  onClose={() => setActiveModal(null)}
                  onSuccess={() => {
                    setActiveModal(null)
                    handleDataRefresh()
                  }}
                />
              )}
            </Suspense>

          </div>

          {shouldMountBackToTop && <BackToTop />}

          {shouldMountAI && (
            <AIChatInput
              isOpen={isAiOpen}
              onOpenChange={setIsAiOpen}
              prefillText={aiPrefill}
              prefillKey={aiPrefillKey}
              welcomeTitle="Ask Finley AI to explain your next move and bookkeeping strategy"
              placeholder="Ask: what should I do today to improve my finances?"
              suggestions={[
                { icon: '🎯', text: 'Explain my next move', action: 'Explain my highest impact action this week and why.' },
                { icon: '🧾', text: 'Bookkeeping help', action: 'Teach me a simple daily bookkeeping workflow in FinleyBook.', highlight: true },
                { icon: '📊', text: 'Budget optimization', action: 'How do I optimize my monthly budget with current spending?' },
                { icon: '📄', text: 'Report routine', action: 'Give me a professional monthly report review checklist.' }
              ]}
            />
          )}

          {showAuthModal && (
            <AuthModal
              mode="signup"
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </PullToRefresh>
      )}
    </>
  )

}
