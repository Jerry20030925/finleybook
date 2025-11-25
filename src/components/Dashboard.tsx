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
import { getUserTransactions, Transaction } from '@/lib/dataService'
import { useLanguage } from './LanguageProvider'

// ... existing imports

export default function Dashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [insights, setInsights] = useState<AIInsight[]>([])

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

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
            {language === 'en' ? 'Your financial overview and latest insights' : '这是您的财务概览和最新洞察'}
          </motion.p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-4 md:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <QuickActions />
        </motion.div>



        {/* Main grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
    </div>
  )
}