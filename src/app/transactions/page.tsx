'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

import TransactionModal from '@/components/TransactionModal'
import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isWithinInterval } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import CsvImportModal from '@/components/CsvImportModal'

import { useRouter } from 'next/navigation'

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [dateFilter, setDateFilter] = useState<'thisMonth' | 'lastMonth' | 'thisYear' | 'all'>('thisMonth')

  const dateLocale = language === 'en' ? enUS : zhCN

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadTransactions = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const data = await getUserTransactions(user.uid, 500) // Increase limit to support "All Time" better or implement pagination later
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    switch (dateFilter) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) }
      default:
        return null
    }
  }

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || t.type === filterType

      let matchesDate = true
      const range = getDateRange()
      if (range) {
        matchesDate = isWithinInterval(new Date(t.date), range)
      }

      return matchesSearch && matchesType && matchesDate
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.amount - a.amount
      }
    })

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('transactions.title')}</h1>
          <p className="text-gray-600">{t('transactions.subtitle') || "Manage your income and expenses"}</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalIncome')}</h3>
            <p className="text-2xl font-bold text-green-600">{formatAmount(totalIncome)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalExpenses')}</h3>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpense)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.netIncome')}</h3>
            <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalIncome - totalExpense)}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search') || "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="all">Total (All Time)</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">{t('common.allTypes') || "All Types"}</option>
                <option value="income">{t('common.income') || "Income"}</option>
                <option value="expense">{t('common.expense') || "Expense"}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="date">{t('common.sortByDate') || "Sort by Date"}</option>
                <option value="amount">{t('common.sortByAmount') || "Sort by Amount"}</option>
              </select>

              <div className="relative inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="relative inline-flex items-center gap-x-1.5 rounded-l-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  {t('transactions.add') || "Add Transaction"}
                </button>
                <Menu as="div" className="relative -ml-px flex">
                  <Menu.Button className="relative inline-flex items-center rounded-r-lg bg-indigo-600 px-2 py-2 text-sm text-white hover:bg-indigo-500 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-l border-indigo-700">
                    <span className="sr-only">Open options</span>
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowCsvModal(true)}
                              className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } group flex w-full items-center px-4 py-2 text-sm`}
                            >
                              <DocumentArrowUpIcon
                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              Import Statement (CSV)
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-500">{t('common.loading')}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || filterType !== 'all' ? t('transactions.noResults') : t('transactions.noRecords')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {transaction.type === 'income' ? (t('common.income') || "Income") : (t('common.expense') || "Expense")}
                        </span>
                        <span className="text-sm text-gray-500">{transaction.category}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{transaction.description}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{format(new Date(transaction.date), 'PP', { locale: dateLocale })}</span>
                        {transaction.paymentMethod && <span>{transaction.paymentMethod}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          loadTransactions()
        }}
      />

      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onSuccess={() => {
          setShowCsvModal(false)
          loadTransactions()
        }}
      />
    </div>
  )
}