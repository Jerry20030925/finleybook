'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'
import { getUserTransactions, getBudgets, type Budget as FirestoreBudget } from '@/lib/dataService'
import { ShoppingBagIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface BudgetDisplay {
  name: string
  spent: number
  budget: number
  color: string
}

// Category to color mapping
const CATEGORY_COLORS: { [key: string]: string } = {
  'category.food': 'bg-yellow-500',
  'category.transport': 'bg-blue-500',
  'category.shopping': 'bg-purple-500',
  'category.entertainment': 'bg-green-500',
  'category.housing': 'bg-orange-500',
  'category.health': 'bg-red-500',
  'category.education': 'bg-indigo-500',
  'category.otherExpense': 'bg-gray-500',
}

// Mapping from Chinese category names to translation keys
const CATEGORY_MAPPING: { [key: string]: string } = {
  '餐饮美食': 'category.food',
  '交通出行': 'category.transport',
  '购物消费': 'category.shopping',
  '居住缴费': 'category.housing',
  '医疗健康': 'category.health',
  '文化娱乐': 'category.entertainment',
  '学习教育': 'category.education',
  '其他支出': 'category.otherExpense',
}

export default function BudgetWidget() {
  const [animatedPercentages, setAnimatedPercentages] = useState<{ [key: string]: number }>({})
  const [budgets, setBudgets] = useState<BudgetDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    const loadBudgetData = async () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)

        // Fetch real budgets from Firestore
        const firestoreBudgets = await getBudgets(user.uid)

        if (firestoreBudgets.length === 0) {
          setBudgets([])
          setIsLoading(false)
          return
        }

        // Fetch transactions to calculate spending
        const transactions = await getUserTransactions(user.uid, 1000)

        // Calculate spending for current month by category
        const currentMonth = new Date()
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        const monthlyExpenses = transactions
          .filter(t => {
            const transactionDate = new Date(t.date)
            return t.type === 'expense' &&
              transactionDate >= startOfMonth &&
              transactionDate <= endOfMonth
          })

        const categorySpending = monthlyExpenses.reduce((acc, transaction) => {
          acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount)
          return acc
        }, {} as { [key: string]: number })

        // Map Firestore budgets to display format
        const budgetData: BudgetDisplay[] = firestoreBudgets.map(fb => {
          const categoryKey = fb.category.startsWith('category.') ? fb.category : (CATEGORY_MAPPING[fb.category] || fb.category)
          const displayName = categoryKey.startsWith('category.') ? t(categoryKey) : fb.category
          const color = CATEGORY_COLORS[categoryKey] || 'bg-gray-500'

          // Calculate spent: match against both the raw category and the translated name
          const spent = categorySpending[fb.category] || categorySpending[displayName] || 0

          return {
            name: displayName,
            spent,
            budget: fb.amount,
            color,
          }
        })

        setBudgets(budgetData)

        // Start animations
        budgetData.forEach((budget, index) => {
          const targetPercentage = Math.min((budget.spent / budget.budget) * 100, 100)
          let current = 0
          const duration = 2000
          const increment = targetPercentage / (duration / 16)

          const animate = () => {
            current += increment
            if (current < targetPercentage) {
              setAnimatedPercentages(prev => ({
                ...prev,
                [budget.name]: current
              }))
              requestAnimationFrame(animate)
            } else {
              setAnimatedPercentages(prev => ({
                ...prev,
                [budget.name]: targetPercentage
              }))
            }
          }

          setTimeout(() => animate(), index * 150)
        })

      } catch (error) {
        console.error('Error loading budget data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgetData()
  }, [user?.uid, t])

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state: no budgets set up yet
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('budget.title')}</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
            <PlusIcon className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500 mb-4">{t('budget.emptyDesc') || 'Set monthly spending limits to track your savings goals.'}</p>
          <motion.button
            onClick={() => router.push('/budget')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('budget.addBudget')}
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900">{t('budget.title')}</h3>
        <motion.button
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/budget')}
        >
          {t('common.edit')}
        </motion.button>
      </motion.div>

      <div className="space-y-6">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.budget) * 100
          const animatedPercentage = animatedPercentages[budget.name] || 0
          const isOverBudget = percentage > 100
          const isShopping = budget.name === t('category.shopping')

          return (
            <motion.div
              key={budget.name}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  {formatAmount(budget.spent)} / {formatAmount(budget.budget)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full relative ${isOverBudget ? 'bg-red-500' :
                    `bg-gradient-to-r ${budget.color.replace('bg-', 'from-')} ${budget.color.replace('bg-', 'to-')}`
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(animatedPercentage, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1.2, ease: "easeOut" }}
                />
              </div>

              {/* Savings Guide for Shopping */}
              {isShopping && percentage < 50 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2 mt-1 text-xs text-green-600 bg-green-50 p-2 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => window.location.href = '/wealth'}
                >
                  <ShoppingBagIcon className="w-3 h-3" />
                  <span>{t('dashboard.budget.shopSave', { rate: '8%', merchant: 'Amazon' })}</span>
                </motion.div>
              )}

              <div className="flex justify-between text-xs text-gray-500">
                <span>{t('budget.usedPercentage', { percentage: animatedPercentage.toFixed(0) })}</span>
                {isOverBudget && (
                  <span className="text-red-600 font-medium">
                    {t('budget.overBudget', { amount: formatAmount(budget.spent - budget.budget) })}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}