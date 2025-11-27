'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import PageLoader from './PageLoader'
import Navigation from './Navigation'
import FinancialOverview from './FinancialOverview'
import RecentTransactions from './RecentTransactions'
import BudgetWidget from './BudgetWidget'
import GoalsWidget from './GoalsWidget'
import InsightsWidget from './InsightsWidget'

import QuickActions from './QuickActions'
import SubscriptionStatus from './SubscriptionStatus'
import FeatureGate, { UsageLimit } from './FeatureGate'
import { AIAnalyticsService } from '@/lib/services/aiAnalytics'

import { AIInsight, RiskAlert } from '@/types'
import toast from 'react-hot-toast'
import NanoBanana from './NanoBanana'
import { getUserTransactions, Transaction, addTransaction } from '@/lib/dataService'
import { useLanguage } from './LanguageProvider'

// New Privacy-First components
import BurnDownChart from './Dashboard/BurnDownChart'
import QuickExpenseEntry from './Dashboard/QuickExpenseEntry'
import WorthItCalculator from './Dashboard/WorthItCalculator'
import BudgetSetupModal from './Dashboard/BudgetSetupModal'

import { Dialog } from '@headlessui/react'
import ReferralGiftCard from './ReferralGiftCard'
import InviteFriendModal from './Dashboard/InviteFriendModal'

export default function Dashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [insights, setInsights] = useState<AIInsight[]>([])

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Privacy-First state
  const [monthlyBudget, setMonthlyBudget] = useState(1000)
  const [spent, setSpent] = useState(0)
  const [hourlyWage, setHourlyWage] = useState(25)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    // Check if user has seen the invite modal
    const hasSeenInvite = localStorage.getItem('hasSeenInviteModal_v1')
    if (!hasSeenInvite && !loading) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowInviteModal(true)
        localStorage.setItem('hasSeenInviteModal_v1', 'true')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [loading])

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = () => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') return

    try {
      const savedBudget = localStorage.getItem('monthlyBudget')
      const savedWage = localStorage.getItem('hourlyWage')
      const savedSpent = localStorage.getItem('currentMonthSpent')

      if (savedBudget) setMonthlyBudget(parseFloat(savedBudget))
      if (savedWage) setHourlyWage(parseFloat(savedWage))
      if (savedSpent) setSpent(parseFloat(savedSpent))
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const saveUserSettings = (budget: number, wage: number) => {
    setMonthlyBudget(budget)
    setHourlyWage(wage)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('monthlyBudget', budget.toString())
        localStorage.setItem('hourlyWage', wage.toString())
      } catch (error) {
        console.error('Error saving user settings:', error)
      }
    }

    toast.success('Settings saved!')
  }

  const handleAddExpense = async (amount: number, category: string, emoji: string) => {
    try {
      // Update local state immediately
      const newSpent = spent + amount
      setSpent(newSpent)

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('currentMonthSpent', newSpent.toString())
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }

      // Add to Firebase (optional backup)
      if (user) {
        await addTransaction({
          userId: user.uid,
          amount: -amount, // Negative for expense
          category,
          description: `${emoji} Quick add`,
          date: new Date(),
          type: 'expense'
        })
      }

      toast.success(`Added $${amount} ${emoji}`)

      // Reload transactions
      loadDashboardData()
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense')
    }
  }

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch transactions first for the charts
      const txs = await getUserTransactions(user.uid, 100)
      setTransactions(txs)

      // Use Promise.allSettled to allow partial success
      const results = await Promise.allSettled([
        AIAnalyticsService.getInstance().generatePersonalizedInsights(user.uid)
      ])

      // Handle AI Insights
      if (results[0].status === 'fulfilled') {
        setInsights(results[0].value)
      } else {
        console.error('Failed to load AI insights:', results[0].reason)
      }



    } catch (error) {
      console.error('Unexpected error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <motion.main
        className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page header */}
        <motion.div
          className="mb-4 md:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <motion.h1
            className="text-xl md:text-2xl font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {language === 'en' ? `Welcome back, ${user?.email?.split('@')[0]}` : `欢迎回来，${user?.email?.split('@')[0]}`}
          </motion.h1>
          <motion.p
            className="mt-1 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {language === 'en' ? 'Your Privacy-First Wealth Dashboard' : '您的隐私优先财富仪表板'}
          </motion.p>
        </motion.div>

        {/* Burn-Down Chart - Hero Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <BurnDownChart
              monthlyBudget={monthlyBudget}
              spent={spent}
              onSetBudget={() => setShowBudgetModal(true)}
            />
          </div>
        </motion.div>

        {/* Quick Expense Entry */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <QuickExpenseEntry onAddExpense={handleAddExpense} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <QuickActions onInvite={() => setShowInviteModal(true)} />
        </motion.div>

        {/* Main grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Left column - Main content */}
          <motion.div
            className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* Nano Banana Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <NanoBanana transactions={transactions} />
            </motion.div>

            {/* Financial Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <FinancialOverview />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <RecentTransactions />
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <FeatureGate
                feature="ai_insights"
                title={language === 'en' ? 'AI Financial Analysis' : 'AI 财务分析'}
                description={language === 'en' ? 'Upgrade to Pro for personalized AI financial advice and deep insights' : '升级到 Pro 版本，获得个性化的 AI 财务建议和深度分析洞察'}
              >
                <InsightsWidget insights={insights} />
              </FeatureGate>
            </motion.div>
          </motion.div>

          {/* Right column - Sidebar */}
          <motion.div
            className="space-y-4 md:space-y-6 lg:space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              <SubscriptionStatus />
            </motion.div>

            {/* Usage Limits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.5 }}
              className="space-y-3"
            >
              <UsageLimit
                limitType="transactions"
                title={language === 'en' ? 'Monthly Transactions' : '本月交易记录'}
                current={23}
                limit={50}
              />
              <UsageLimit
                limitType="budgets"
                title={language === 'en' ? 'Budget Categories' : '预算分类'}
                current={3}
                limit={5}
              />
            </motion.div>

            {/* Budget Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <BudgetWidget />
            </motion.div>

            {/* Goals Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <GoalsWidget />
            </motion.div>

            {/* Financial Health Score */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">{language === 'en' ? 'Financial Health Score' : '财务健康评分'}</h3>
              <div className="text-center">
                <motion.div
                  className="relative inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring', damping: 15 }}
                >
                  <svg className="w-32 h-32 mx-auto" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
                      style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
                    />
                  </svg>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <span className="text-4xl font-bold text-gray-400">--</span>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="text-sm text-gray-600 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                >
                  {language === 'en' ? 'No score data available' : '暂无评分数据'}
                </motion.div>
              </div>
            </motion.div>

            {/* Monthly Summary */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">{language === 'en' ? 'Monthly Summary' : '本月概览'}</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{language === 'en' ? 'Total Income' : '总收入'}</span>
                  <span className="text-sm font-medium text-success-600">¥0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{language === 'en' ? 'Total Expenses' : '总支出'}</span>
                  <span className="text-sm font-medium text-danger-600">¥0</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">{language === 'en' ? 'Net Cash Flow' : '净现金流'}</span>
                    <span className="text-sm font-medium text-gray-900">¥0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Worth It? Calculator - Floating Button */}
      <WorthItCalculator
        hourlyWage={hourlyWage}
        onSetWage={() => setShowBudgetModal(true)}
      />

      {/* Budget Setup Modal */}
      <BudgetSetupModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        currentBudget={monthlyBudget}
        currentWage={hourlyWage}
        onSave={saveUserSettings}
      />

      {/* Invite Friend Modal */}
      <InviteFriendModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  )
}