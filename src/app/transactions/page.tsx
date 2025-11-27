'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import TransactionModal from '@/components/TransactionModal'
import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const data = await getUserTransactions(user.uid, 100)
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('加载交易记录失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || t.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.amount - a.amount
      }
    })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">交易管理</h1>
          <p className="text-gray-600">管理您的收入和支出记录</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总收入</h3>
            <p className="text-2xl font-bold text-green-600">¥{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总支出</h3>
            <p className="text-2xl font-bold text-red-600">¥{totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">净收入</h3>
            <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{(totalIncome - totalExpense).toLocaleString()}
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
                placeholder="搜索交易记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">全部类型</option>
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="date">按日期排序</option>
                <option value="amount">按金额排序</option>
              </select>

              <motion.button
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                添加交易
              </motion.button>
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
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm || filterType !== 'all' ? '没有找到匹配的交易记录' : '暂无交易记录，点击添加交易开始记录'}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? '收入' : '支出'}
                        </span>
                        <span className="text-sm text-gray-500">{transaction.category}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{transaction.description}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{format(new Date(transaction.date), 'yyyy年MM月dd日', { locale: zhCN })}</span>
                        {transaction.paymentMethod && <span>{transaction.paymentMethod}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
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
    </div>
  )
}