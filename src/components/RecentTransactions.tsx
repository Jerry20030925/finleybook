'use client'

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  ArrowPathIcon,
  SparklesIcon,
  ShoppingBagIcon,
  HomeIcon,
  TruckIcon,
  HeartIcon,
  AcademicCapIcon,
  BanknotesIcon,
  BriefcaseIcon,
  TicketIcon,
  TagIcon,
  CreditCardIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'
import { Transaction } from '@/lib/dataService'
import TransactionModal from './TransactionModal'

const CATEGORY_ICONS: { [key: string]: any } = {
  'Food': ShoppingBagIcon,
  'Transport': TruckIcon,
  'Shopping': TagIcon,
  'Housing': HomeIcon,
  'Health': HeartIcon,
  'Entertainment': TicketIcon,
  'Education': AcademicCapIcon,
  'Salary': BanknotesIcon,
  'Investment': CurrencyDollarIcon,
  '餐饮美食': ShoppingBagIcon,
  '交通出行': TruckIcon,
  '购物消费': TagIcon,
  '居住缴费': HomeIcon,
  '医疗健康': HeartIcon,
  '文化娱乐': TicketIcon,
  '学习教育': AcademicCapIcon,
  '工资收入': BanknotesIcon,
  '投资收益': CurrencyDollarIcon,
  '兼职收入': BriefcaseIcon,
  '其他收入': BanknotesIcon,
  '其他支出': CreditCardIcon,
}

const getCategoryIcon = (category: string) => {
  const IconComponent = CATEGORY_ICONS[category] || CreditCardIcon;
  return <IconComponent className="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors" />;
}

interface RecentTransactionsProps {
  transactions?: Transaction[]
  onTransactionUpdate?: () => void
}

const RecentTransactions = memo(function RecentTransactions({ transactions = [], onTransactionUpdate }: RecentTransactionsProps) {
  // transactions prop is now the source of truth
  const [showAll, setShowAll] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()

  // Derive display transactions from props
  // If showAll is false, show 10. If true, show 50 (or max passed)
  const displayLimit = showAll ? 50 : 10
  const displayTransactions = transactions.slice(0, displayLimit)

  const handleTransactionAdded = async () => {
    setShowAddModal(false)
    // Trigger parent refresh
    if (onTransactionUpdate) {
      onTransactionUpdate()
    }
  }

  // Loading state is now controlled by parent passing empty array? 
  // Or we can say if transactions is empty array but we expect data..
  // For now, let's assume parent handles 'loading' spinner for the whole page.
  // But if we want a local empty state, we check transactions.length.
  const isLoading = false // Parent Dashboard handles initial loading

  return (
    <>
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-7 bg-slate-100 rounded-lg w-32"></div>
              <div className="h-8 bg-slate-100 rounded-lg w-24"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-xl border border-transparent">
                  <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-32"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100 overflow-hidden relative"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center mb-6">
            <h3
              className="text-lg font-bold text-slate-900"
            >
              {t('transactions.recent')}
            </h3>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => onTransactionUpdate?.()}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="min-h-[44px] flex items-center px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-4 h-4 mr-1.5" />
                {t('transactions.addTransaction')}
              </motion.button>
            </div>
          </div>

          <div className="relative">
            {transactions.length === 0 ? (
              <motion.div
                className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50/80 to-indigo-50/40"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <motion.div
                  className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-indigo-100"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  📝
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('transactions.noRecords')}</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">{t('transactions.startAdding')}</p>
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  {t('transactions.addTransaction')}
                </motion.button>
              </motion.div>
            ) : (
              <div
                className="space-y-3"
              >
                <AnimatePresence mode='popLayout'>
                  {displayTransactions.map((transaction, index) => {
                    const isGroceries = transaction.category === 'Groceries' || transaction.category === '购物消费';
                    const isSubscription = transaction.category === 'Entertainment' || transaction.category === '文化娱乐';

                    return (
                      <motion.div
                        key={transaction.id}
                        layout="position"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        whileHover={{ scale: 1.01, zIndex: 1 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        {/* Hover gradient background - More subtle and smooth */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors border border-slate-100"
                              whileHover={{ rotate: 5, scale: 1.1 }}
                            >
                              {getCategoryIcon(transaction.category)}
                            </motion.div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                                {transaction.description.includes('Quick add') ? transaction.category : transaction.description}
                              </p>
                              <p className="text-xs font-medium text-slate-400 mt-0.5">
                                {transaction.category} • {new Date(transaction.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {transaction.projectedCashback && transaction.projectedCashback > 0 ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-400 line-through decoration-slate-300 mb-0.5">
                                  {formatAmount(Math.abs(transaction.amount))}
                                </span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                  {formatAmount(Math.abs(transaction.amount - transaction.projectedCashback))}
                                  <SparklesIcon className="w-3.5 h-3.5 fill-emerald-100" />
                                </span>
                              </div>
                            ) : (
                              <p className={`font-bold text-lg tabular-nums tracking-tight ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Missed Cashback / Renew & Earn Logic */}
                        {(isGroceries || isSubscription) && (
                          <div className="mt-3 pl-[4rem] flex items-center">
                            {isGroceries && (
                              <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                                <SparklesIcon className="w-3 h-3" />
                                {t('dashboard.missedCashback', { amount: formatAmount(2.50) })}
                              </div>
                            )}
                            {isSubscription && (
                              <button
                                className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100 flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = '/wealth';
                                }}
                              >
                                <SparklesIcon className="w-3 h-3" />
                                {t('dashboard.renewEarn')}
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {transactions.length >= 10 && (
                  <motion.div
                    className="text-center pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAll(!showAll)}
                      className="min-h-[44px] inline-flex items-center justify-center px-6 py-2 border border-slate-200 text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      {showAll ? t('transactions.showLess') : t('transactions.showMore')}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </>
  )
})

export default RecentTransactions