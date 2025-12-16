import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { isMobileApp } from '@/lib/mobileUtils'
import PageLoader from './PageLoader'
import FinancialOverview from './FinancialOverview'
import RecentTransactions from './RecentTransactions'
import NanoBanana from './NanoBanana'
import SmartSuggestions from './Dashboard/SmartSuggestions'
import QuickActions from './QuickActions'
import FinancialGarden from './Dashboard/FinancialGarden'
import CashbackCard from './Dashboard/CashbackCard'
import VisionBoard from './VisionBoard'
import { getUserTransactions, Transaction, addTransaction, getGoals, Goal } from '@/lib/dataService'
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useLanguage } from './LanguageProvider'
import { getUserDisplayName } from '@/lib/userUtils'
import toast from 'react-hot-toast'
import InviteFriendModal from './Dashboard/InviteFriendModal'
import GettingStartedGuide from './Dashboard/GettingStartedGuide'
import TransactionModal from './TransactionModal'
import ReceiptUploadModal from './ReceiptUploadModal'
import CsvImportModal from './CsvImportModal'
import { useRouter } from 'next/navigation'
import StreakCounter from './Dashboard/StreakCounter'
import PullToRefresh from '@/components/Mobile/PullToRefresh'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Real streak from userProfile
  const currentStreak = userProfile?.streak || 0
  const lastLogin = userProfile?.lastLogin?.toDate() || new Date() // Fallback to now if missing to prevent crash

  // Calculate if streak is "active" (logged in today or yesterday) for UI purposes
  // Actually, we can just use the streak value. If it's > 0, it's effectively active.
  // The only edge case is if they haven't logged in today (flame might look different?)
  // For now, let's pass a calculated "isActive" boolean based on lastLogin
  const isStreakActive = (() => {
    if (!userProfile?.lastLogin) return true // New user assumption or just logged in
    const now = new Date()
    const last = userProfile.lastLogin.toDate()
    const diff = now.getTime() - last.getTime()
    const hours = diff / (1000 * 60 * 60)
    return hours < 48 // lenient check for UI visual
  })()

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hydration safe user check
  useEffect(() => {
    if (user?.metadata.creationTime) {
      const created = new Date(user.metadata.creationTime).getTime()
      const now = new Date().getTime()
      setIsNewUser((now - created) < 7 * 24 * 60 * 60 * 1000)
    }
  }, [user])

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    try {
      const txs = await getUserTransactions(user.uid)
      setTransactions(txs)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    }
  }, [user])

  // Data Fetching Effect
  useEffect(() => {
    let unsubscribeProfile: () => void
    let unsubscribeGoals: () => void

    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        // 1. Fetch Transactions
        await fetchTransactions()

        // 2. Fetch User Profile
        const userRef = doc(db, 'users', user.uid)
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data())
          }
        })

        // 3. Fetch Goals (Realtime)
        const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid))
        unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
          const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal))
          if (goals.length > 0) {
            setPrimaryGoal(goals[0])
          }
        })

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error(t('common.errorLoading'))
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }

    return () => {
      if (unsubscribeProfile) unsubscribeProfile()
      if (unsubscribeGoals) unsubscribeGoals()
    }
  }, [user, authLoading, t, fetchTransactions])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Wrap loadData in a compatible Promise returning function
  const handleRefresh = async () => {
    // Wait for data load
    await fetchTransactions()
    // Add a small artificial delay so the user feels the refresh happened
    await new Promise(resolve => setTimeout(resolve, 800))
  }

  const isGuest = user?.isAnonymous

  return (
    <>
      {(!isMounted || loading) ? (
        <PageLoader />
      ) : (
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-screen bg-gray-50 pb-24">
            {/* GUEST BANNER */}
            {isGuest && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 shadow-md relative z-50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span>👻 You are in <strong>Guest Mode</strong>. Data is saved locally but will be lost if you clear cookies.</span>
                  </div>
                  <button
                    onClick={() => {
                      alert("To save forever, please logout and Sign Up!")
                    }}
                    className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors"
                  >
                    Sign Up to Save
                  </button>
                </div>
              </div>
            )}

            <motion.main
              className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.15
                  }
                }
              }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  className="text-left"
                >
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    {t('dashboard.welcomeBack', { name: getUserDisplayName(user) })}
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
                    {t('dashboard.wealthCommandCenter')}
                  </p>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1 }
                  }}
                  className="self-start md:self-auto"
                >
                  <StreakCounter streak={currentStreak} isActive={isStreakActive} />
                </motion.div>
              </div>

              {/* Getting Started Guide */}
              <GettingStartedGuide
                hasTransactions={transactions.length > 0}
                hasBudget={monthlyBudget > 0}
                hasCashback={transactions.some(t => t.type === 'cashback')}
                hasProfile={!!user?.displayName || !!userProfile?.displayName}
                onAddTransaction={() => setActiveModal('transaction')}
                onImportCsv={() => setActiveModal('csv')}
                isNewUser={isNewUser}
              />

              {/* 1. HERO: Financial Overview (Top Anchor) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="mb-8"
              >
                <FinancialOverview transactions={transactions} />
              </motion.div>

              {/* Main Grid Layout (66% Left / 33% Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                {/* Left Column (66% -> col-span-8) - DATA HEAVY */}
                <div className="lg:col-span-8 space-y-4 md:space-y-8">

                  {/* 2. Charts (NanoBanana) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <NanoBanana transactions={transactions} />
                  </motion.div>

                  {/* 3. Recent Transactions */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <RecentTransactions />
                  </motion.div>
                </div>

                {/* Right Column (33% -> col-span-4) - ACTION & INSIGHTS */}
                <div className="lg:col-span-4 space-y-4 md:space-y-6">

                  {/* 1. Cashback Center (Visual Anchor - Dark Mode) - HIDDEN ON MOBILE APP */}
                  {!isMobileApp() && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <CashbackCard
                        pendingAmount={transactions.filter(t => t.type === 'cashback' && t.status === 'pending').reduce((acc, t) => acc + t.amount, 0)}
                        potentialAmount={50.00}
                        lifeTimeEarned={transactions.filter(t => t.type === 'cashback').reduce((acc, t) => acc + t.amount, 0)}
                      />
                    </motion.div>
                  )}

                  {/* 2. Finley AI (Insights First) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="min-h-[180px]"
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <SmartSuggestions transactions={transactions} monthlyBudget={monthlyBudget} />
                  </motion.div>

                  {/* 3. Financial Garden (Retention) - HIDDEN ON MOBILE APP */}
                  {!isMobileApp() && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      className="min-h-[240px]"
                    >
                      <Link href="/wealth">
                        <FinancialGarden />
                      </Link>
                    </motion.div>
                  )}

                  {/* 4. Compact Vision Board (Progress Tracker) */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/goals">
                      <VisionBoard primaryGoal={primaryGoal} compact={true} />
                    </Link>
                  </motion.div>

                  {/* 5. Quick Actions */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <QuickActions onInvite={() => setShowInviteModal(true)} onDataRefresh={fetchTransactions} />
                  </motion.div>
                </div>
              </div>
            </motion.main>

            <InviteFriendModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
            />

            <TransactionModal
              isOpen={activeModal === 'transaction'}
              onClose={() => setActiveModal(null)}
              onSuccess={() => {
                setActiveModal(null)
                fetchTransactions()
              }}
            />

            {activeModal === 'receipt' && (
              <ReceiptUploadModal
                onClose={() => setActiveModal(null)}
              />
            )}

            <CsvImportModal
              isOpen={activeModal === 'csv'}
              onClose={() => setActiveModal(null)}
              onSuccess={() => {
                setActiveModal(null)
                fetchTransactions()
              }}
            />
          </div>
        </PullToRefresh>
      )}
    </>
  )
}