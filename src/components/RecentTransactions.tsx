'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { getUserTransactions, Transaction } from '@/lib/dataService'
import TransactionModal from './TransactionModal'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: any } = {
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
  const IconComponent = icons[category] || CreditCardIcon;
  return <IconComponent className="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors" />;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()

  const loadTransactions = useCallback(async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      const data = await getUserTransactions(user.uid, showAll ? 50 : 10)
      setTransactions(data)
    } catch (error) {
      console.error('[RecentTransactions] Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, showAll])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(showAll ? 50 : 10)
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          }
        }) as Transaction[]
        setTransactions(transactions)
        setIsLoading(false)
      },
      (error) => {
        console.error('[RecentTransactions] Real-time listener error:', error)
        loadTransactions()
      }
    )

    return () => unsubscribe()
  }, [user?.uid, showAll, loadTransactions])

  const handleTransactionAdded = async () => {
    setShowAddModal(false)
    setTimeout(async () => {
      await loadTransactions()
    }, 500)
  }

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center mb-6">
            <motion.h3
              className="text-lg font-bold text-slate-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t('transactions.recent')}
            </motion.h3>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={loadTransactions}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all"
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
                className="text-center py-16 px-4 border-2 border-dashed border-slate-100 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  📝
                </div>
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
              <div className="space-y-3">
                <AnimatePresence mode='popLayout'>
                  {transactions.map((transaction, index) => {
                    const isGroceries = transaction.category === 'Groceries' || transaction.category === '购物消费';
                    const isSubscription = transaction.category === 'Entertainment' || transaction.category === '文化娱乐';

                    return (
                      <motion.div
                        key={transaction.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="group relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                        whileHover={{ y: -2 }}
                      >
                        {/* Hover gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors border border-slate-100">
                              {getCategoryIcon(transaction.category)}
                            </div>
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
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="inline-flex items-center px-6 py-2 border border-slate-200 text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      {showAll ? t('transactions.showLess') : t('transactions.showMore')}
                    </button>
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
}