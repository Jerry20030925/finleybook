'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import { Transaction } from '@/lib/dataService'

interface FinancialOverviewProps {
  transactions?: Transaction[]
}

interface FinancialStat {
  name: string
  value: string
  rawValue: number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description: string
  icon?: any
}

export default function FinancialOverview({ transactions = [] }: FinancialOverviewProps) {
  const [stats, setStats] = useState<FinancialStat[]>([])
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()

  useEffect(() => {
    const calculateFinancialData = () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)

        // Calculate summary from transactions
        const currentMonth = new Date()
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        // Calculate current month stats
        const monthlyTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= startOfMonth && transactionDate <= endOfMonth
        })

        const monthlyIncome = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const monthlyExpenses = monthlyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0) // Ensure positive expense value

        // Calculate total assets
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const totalAssets = totalIncome - totalExpenses
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

        // Calculate Pending Cashback based on real transactions
        const pendingCashback = transactions
          .filter(t => t.type === 'cashback' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0)

        const newStats: FinancialStat[] = [
          {
            name: t('dashboard.totalAssets'),
            value: formatAmount(totalAssets),
            rawValue: totalAssets,
            change: '+0%',
            changeType: totalAssets >= 0 ? 'positive' : 'negative',
            description: t('dashboard.cumulativeNetAssets')
          },
          {
            name: t('dashboard.monthlyExpenses'),
            value: formatAmount(monthlyExpenses),
            rawValue: monthlyExpenses,
            change: '+0%',
            changeType: 'negative',
            description: t('dashboard.monthlyTotalExpenses')
          },
          {
            name: t('dashboard.pendingCashback'),
            value: formatAmount(pendingCashback),
            rawValue: pendingCashback,
            change: '+0%',
            changeType: 'positive',
            description: t('dashboard.wealthVault.earnings'),
            icon: SparklesIcon
          },
          {
            name: t('dashboard.savingsRate'),
            value: `${Math.max(0, savingsRate).toFixed(1)}%`,
            rawValue: savingsRate,
            change: '+0%',
            changeType: savingsRate > 0 ? 'positive' : 'neutral',
            description: t('dashboard.monthlySavingsRatio')
          }
        ]

        setStats(newStats)

        // Settings animation targets
        const targets = {
          [t('dashboard.totalAssets')]: Math.abs(totalAssets),
          [t('dashboard.monthlyExpenses')]: monthlyExpenses,
          [t('dashboard.pendingCashback')]: pendingCashback,
          [t('dashboard.savingsRate')]: Math.max(0, savingsRate)
        }

        // Start number animation
        Object.entries(targets).forEach(([key, target]) => {
          let start = 0
          const duration = 2000
          const startTime = Date.now()

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)
            const current = start + (target - start) * easeOutCubic

            setAnimatedValues(prev => ({ ...prev, [key]: current }))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          animate()
        })

      } catch (error) {
        console.error('Error calculating financial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    calculateFinancialData()
    calculateFinancialData()
  }, [user?.uid, t, transactions, formatAmount])

  const formatValue = (stat: FinancialStat) => {
    const animatedValue = animatedValues[stat.name]
    if (animatedValue === undefined) return stat.value

    if (stat.name === t('dashboard.savingsRate')) {
      return `${animatedValue.toFixed(1)}%`
    }
    return formatAmount(Math.floor(animatedValue))
  }

  return (
    <>
      {isLoading ? (
        <div className="card">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between">
              <div className="h-8 bg-slate-100 rounded-lg w-32"></div>
              <div className="h-6 bg-slate-100 rounded-lg w-24"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="space-y-4">
                    <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                    <div className="h-8 bg-slate-200 rounded-lg w-32"></div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className="card overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-20"></div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <motion.h2
              className="text-2xl font-bold text-slate-900 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('dashboard.title')}
            </motion.h2>
            <motion.div
              className="mt-2 sm:mt-0 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-sm font-medium text-slate-500">
                {t('dashboard.date', {
                  date: currentDate
                })}
              </span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-soft hover:border-primary-100 transition-all duration-300 group overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:from-primary-50/50"></div>

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
                    <motion.p
                      className="text-2xl font-bold text-slate-900"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + 0.1 * index }}
                    >
                      {formatValue(stat)}
                    </motion.p>
                  </dd>
                  <p className="mt-4 text-xs text-slate-400 font-medium">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {stats.length === 0 && !isLoading && (
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
      )}
    </>
  )
}