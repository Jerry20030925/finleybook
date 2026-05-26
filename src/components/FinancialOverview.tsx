'use client'

import { useMemo, useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import { Transaction } from '@/lib/dataService'
import CountUp from './CountUp'
import toast from 'react-hot-toast'

interface FinancialOverviewProps {
  transactions?: Transaction[]
  monthlyBudget?: number
  onAskAI?: (prompt: string) => void
}

interface FinancialStat {
  name: string
  rawValue: number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description: string
  icon?: any
  isPercentage?: boolean
}

type NextMove = {
  title: string
  description: string
  impactValue: number
  impactLabel: string
  href: string
  aiPrompt: string
}

type InsightsSnapshot = {
  totalAssets: number
  monthlyExpenses: number
  monthlyIncome: number
  savingsRate: number
  focusScore: number
  nextMove: NextMove
}

const FinancialOverview = memo(function FinancialOverview({
  transactions = [],
  monthlyBudget = 0,
  onAskAI,
}: FinancialOverviewProps) {
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }))
  }, [])

  const router = useRouter()
  const { country } = useCurrency()
  const { t } = useLanguage()

  const insights = useMemo<InsightsSnapshot>(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const monthlyTransactions = transactions.filter((tx) => {
      const d = new Date(tx.date)
      return d >= startOfMonth && d <= endOfMonth
    })

    const monthlyIncome = monthlyTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const monthlyExpenses = monthlyTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const totalIncome = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalExpenses = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    const totalAssets = totalIncome - totalExpenses
    const netIncome = monthlyIncome - monthlyExpenses
    const savingsRate = monthlyIncome > 0 ? (netIncome / monthlyIncome) * 100 : 0

    const categorySpend = new Map<string, number>()
    monthlyTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const key = tx.category || 'Other'
        const value = categorySpend.get(key) || 0
        categorySpend.set(key, value + Math.abs(tx.amount))
      })

    const topCategoryPair = Array.from(categorySpend.entries()).sort((a, b) => b[1] - a[1])[0]
    const topCategory = topCategoryPair?.[0] || 'Discretionary'
    const topCategoryAmount = topCategoryPair?.[1] || 0

    let focusScore = 38
    focusScore += Math.min(22, transactions.length * 1.2)
    if (monthlyBudget > 0) {
      const budgetUse = monthlyExpenses / monthlyBudget
      if (budgetUse <= 0.75) {
        focusScore += 24
      } else if (budgetUse <= 1) {
        focusScore += 14
      } else {
        focusScore -= 8
      }
    }
    focusScore += Math.max(0, Math.min(16, savingsRate * 0.8))
    focusScore = Math.max(0, Math.min(100, Math.round(focusScore)))

    let nextMove: NextMove

    if (transactions.length < 3) {
      nextMove = {
        title: 'Complete your 3-record baseline',
        description: 'Add 3 transactions today to unlock cleaner trends and better AI decisions this week.',
        impactValue: 0,
        impactLabel: 'Higher insight accuracy in 1 day',
        href: '/transactions',
        aiPrompt: 'Teach me exactly how to add my first 3 bookkeeping records in FinleyBook.',
      }
    } else if (monthlyBudget <= 0 && monthlyExpenses > 0) {
      const impact = monthlyExpenses * 0.12
      nextMove = {
        title: 'Create budget guardrails',
        description: 'Set category caps once so overspending is caught before month-end.',
        impactValue: impact,
        impactLabel: `${country.symbol}${impact.toFixed(2)} / month potential`,
        href: '/budget',
        aiPrompt: 'Create a practical monthly budget for me using my current spending pattern.',
      }
    } else if (topCategoryAmount > monthlyExpenses * 0.35 && topCategoryAmount > 0) {
      const impact = topCategoryAmount * 0.1
      nextMove = {
        title: `Reduce ${topCategory} by 10%`,
        description: `Your ${topCategory} spend is dominant this month. A small cut here creates immediate upside.`,
        impactValue: impact,
        impactLabel: `${country.symbol}${impact.toFixed(2)} / month potential`,
        href: '/budget',
        aiPrompt: `Give me a step-by-step plan to reduce ${topCategory} spending by 10% without hurting quality of life.`,
      }
    } else if (monthlyIncome > 0 && savingsRate < 20) {
      const needed = Math.max(0, (monthlyIncome * 0.2) - Math.max(netIncome, 0))
      nextMove = {
        title: 'Activate an automatic savings transfer',
        description: 'Lock in savings first, then spend the rest. This is the fastest way to improve your savings ratio.',
        impactValue: needed,
        impactLabel: `${country.symbol}${needed.toFixed(2)} to reach 20% savings rate`,
        href: '/goals',
        aiPrompt: 'Help me set an auto-transfer amount so my savings rate reaches 20% sustainably.',
      }
    } else {
      nextMove = {
        title: 'Run your monthly decision brief',
        description: 'Use the report to confirm what is working, then commit one adjustment for next month.',
        impactValue: 0,
        impactLabel: 'Sharper decisions with less guesswork',
        href: '/reports',
        aiPrompt: 'Review my monthly performance and tell me the 1 most important decision for next month.',
      }
    }

    return {
      totalAssets,
      monthlyExpenses,
      monthlyIncome,
      savingsRate,
      focusScore,
      nextMove,
    }
  }, [transactions, monthlyBudget, country.symbol])

  const stats = useMemo<FinancialStat[]>(() => {
    return [
      {
        name: t('dashboard.totalAssets'),
        rawValue: insights.totalAssets,
        change: '+0%',
        changeType: insights.totalAssets >= 0 ? 'positive' : 'negative',
        description: t('dashboard.cumulativeNetAssets'),
      },
      {
        name: t('dashboard.monthlyExpenses'),
        rawValue: insights.monthlyExpenses,
        change: '+0%',
        changeType: 'negative',
        description: t('dashboard.monthlyTotalExpenses'),
      },
      {
        name: t('dashboard.actionPotential'),
        rawValue: insights.nextMove.impactValue,
        change: '+0%',
        changeType: 'positive',
        description: t('dashboard.actionPotentialDescription'),
        icon: SparklesIcon,
      },
      {
        name: t('dashboard.finleyFocusScore'),
        rawValue: insights.focusScore,
        change: '+0%',
        changeType: insights.focusScore >= 65 ? 'positive' : 'neutral',
        description: t('dashboard.focusScoreDescription'),
        isPercentage: true,
      },
    ]
  }, [insights, t])

  const handleSharePlan = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://finleybook.com'
    const text = t('dashboard.nextMoveShareTemplate', {
      title: insights.nextMove.title,
      impact: insights.nextMove.impactLabel,
      url: `${baseUrl}${insights.nextMove.href}`,
    })

    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('dashboard.nextMoveCopied'))
    } catch (error) {
      console.error('Failed to copy plan:', error)
      toast.error('Could not copy. Please try again.')
    }
  }

  return (
    <motion.div
      className="card overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <motion.h2
          className="text-2xl font-bold text-slate-900 tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {t('dashboard.title')}
        </motion.h2>
        <motion.div
          className="mt-2 sm:mt-0 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm font-medium text-slate-500">{t('dashboard.date', { date: currentDate })}</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200/50 transition-all duration-500 group overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.05), duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
          >
            <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-slate-100/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <motion.div
                  className={`rounded-xl p-3 shadow-sm ${stat.icon ? 'bg-amber-100 text-amber-600' :
                    stat.changeType === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                      stat.changeType === 'negative' ? 'bg-rose-100 text-rose-600' :
                        'bg-blue-100 text-blue-600'
                    }`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  {stat.icon ? (
                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                  ) : stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-6 w-6" aria-hidden="true" />
                  ) : stat.changeType === 'negative' ? (
                    <ArrowDownIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <div className="h-6 w-6 bg-current rounded-full opacity-20" />
                  )}
                </motion.div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.changeType === 'positive' ? 'text-emerald-700 bg-emerald-50' :
                  stat.changeType === 'negative' ? 'text-rose-700 bg-rose-50' :
                    'text-slate-500 bg-slate-50'
                  }`}>
                  {stat.change}
                </div>
              </div>

              <dt className="text-sm font-medium text-slate-500 truncate mb-1">{stat.name}</dt>
              <dd className="flex items-baseline">
                <motion.div
                  className="text-2xl font-bold text-slate-900"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + 0.05 * index }}
                >
                  {stat.isPercentage ? (
                    <CountUp value={stat.rawValue} decimals={0} suffix="%" />
                  ) : (
                    <CountUp value={stat.rawValue} prefix={country.symbol} decimals={2} />
                  )}
                </motion.div>
              </dd>
              <p className="mt-4 text-xs text-slate-400 font-medium">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-white to-indigo-50/70 p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Decorative accent line */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-l-2xl"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
        />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0 pl-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-600 font-bold">{t('dashboard.nextMoveSignature')}</p>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{insights.nextMove.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{insights.nextMove.description}</p>
            <p className="text-xs text-indigo-700 mt-2 font-semibold">
              {t('dashboard.nextMoveImpact')}: {insights.nextMove.impactLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => router.push(insights.nextMove.href)}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <BoltIcon className="w-4 h-4" />
              {t('dashboard.nextMoveDoNow')}
            </motion.button>

            <motion.button
              onClick={() => (onAskAI ? onAskAI(insights.nextMove.aiPrompt) : router.push('/profile'))}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              {t('dashboard.nextMoveAskAI')}
            </motion.button>

            <motion.button
              onClick={handleSharePlan}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              {t('dashboard.nextMoveShare')}
            </motion.button>

            <motion.button
              onClick={() => router.push('/reports')}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Reports
            </motion.button>
          </div>
        </div>
      </motion.div>

      {stats.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl opacity-50">
            📊
          </div>
          <p className="text-slate-900 font-medium">{t('transactions.noRecords')}</p>
          <p className="text-sm text-slate-500 mt-1">{t('transactions.startAdding')}</p>
        </motion.div>
      )}
    </motion.div>
  )
})

export default FinancialOverview
