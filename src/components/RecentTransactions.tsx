'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'
import TransactionModal from './TransactionModal'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    '餐饮美食': '🍔',
    '交通出行': '🚗',
    '购物消费': '🛒',
    '居住缴费': '🏠',
    '医疗健康': '💊',
    '文化娱乐': '🎬',
    '学习教育': '📚',
    '工资收入': '💰',
    '投资收益': '📈',
    '兼职收入': '💼',
    '其他收入': '💵',
    '其他支出': '📝'
  }
  return icons[category] || '📝'
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()

  const loadTransactions = useCallback(async () => {
    if (!user?.uid) {
      console.log('[RecentTransactions] No user ID available')
      return
    }

    try {
      console.log('[RecentTransactions] Loading transactions for user:', user.uid)
      setIsLoading(true)
      const data = await getUserTransactions(user.uid, showAll ? 50 : 10)
      console.log('[RecentTransactions] Loaded', data.length, 'transactions:', data)
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

  // Add real-time listener as backup to ensure data updates
  useEffect(() => {
    if (!user?.uid) return

    console.log('[RecentTransactions] Setting up real-time listener for user:', user.uid)
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(showAll ? 50 : 10)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('[RecentTransactions] Real-time update received, got', snapshot.docs.length, 'transactions')
        const transactions = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          }
        }) as Transaction[]
        
        console.log('[RecentTransactions] Real-time transactions:', transactions)
        setTransactions(transactions)
        setIsLoading(false)
      },
      (error) => {
        console.error('[RecentTransactions] Real-time listener error:', error)
        console.error('[RecentTransactions] Error code:', error.code)
        console.error('[RecentTransactions] Error message:', error.message)
        
        // If it's an index issue, try a simpler real-time query
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.log('[RecentTransactions] Setting up simple real-time listener without orderBy...')
          const simpleQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            limit(showAll ? 50 : 10)
          )
          
          const simpleUnsubscribe = onSnapshot(simpleQuery,
            (simpleSnapshot) => {
              console.log('[RecentTransactions] Simple real-time update received, got', simpleSnapshot.docs.length, 'transactions')
              const simpleTransactions = simpleSnapshot.docs.map(doc => {
                const data = doc.data()
                return {
                  id: doc.id,
                  ...data,
                  date: data.date?.toDate() || new Date(),
                  createdAt: data.createdAt?.toDate() || new Date()
                }
              }) as Transaction[]
              
              // Sort manually by date
              simpleTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              console.log('[RecentTransactions] Simple real-time transactions (sorted):', simpleTransactions)
              setTransactions(simpleTransactions)
              setIsLoading(false)
            },
            (simpleError) => {
              console.error('[RecentTransactions] Simple real-time listener also failed:', simpleError)
              // Fall back to regular loading if all real-time methods fail
              loadTransactions()
            }
          )
          
          return simpleUnsubscribe
        } else {
          // Fall back to regular loading if real-time fails
          loadTransactions()
        }
      }
    )

    return () => {
      console.log('[RecentTransactions] Cleaning up real-time listener')
      unsubscribe()
    }
  }, [user?.uid, showAll, loadTransactions]) // Added loadTransactions dependency

  const handleTransactionAdded = async () => {
    console.log('[RecentTransactions] Transaction added, refreshing list...')
    setShowAddModal(false)
    
    // Wait a bit for Firebase to propagate the data, then refresh multiple times
    setTimeout(async () => {
      await loadTransactions()
      console.log('[RecentTransactions] First refresh completed')
      
      // Refresh again after another delay to ensure data is available
      setTimeout(async () => {
        await loadTransactions()
        console.log('[RecentTransactions] Second refresh completed')
      }, 1000)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-300 rounded w-32"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <motion.h3
            className="text-lg font-medium text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t('transactions.recent')}
          </motion.h3>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={loadTransactions}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 刷新
            </motion.button>
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {t('transactions.addTransaction')}
            </motion.button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>用户ID: {user?.uid}</p>
          <p>认证状态: {user ? '已登录' : '未登录'}</p>
          <p>交易数量: {transactions.length}</p>
          <p>加载状态: {isLoading ? '加载中' : '已完成'}</p>
          <p>最后刷新: {new Date().toLocaleTimeString()}</p>
          <p>显示模式: {showAll ? '显示全部' : '显示10条'}</p>
          {user?.email && <p>用户邮箱: {user.email}</p>}
        </div>

        <div className="mt-6">
          {transactions.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('transactions.noRecords')}</h3>
              <p className="text-gray-500 mb-4">{t('transactions.startAdding')}</p>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('transactions.addTransaction')}
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-md hover:border-primary-200 transition-all duration-300 cursor-pointer group"
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{
                      delay: 0.05 * index,
                      duration: 0.4,
                      type: "spring",
                      damping: 25
                    }}
                    whileHover={{
                      scale: 1.02,
                      x: 4,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-white shadow-md border border-gray-100 group-hover:shadow-lg group-hover:border-primary-200"
                        whileHover={{
                          scale: 1.15,
                          rotateZ: 5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          className="text-lg"
                          whileHover={{ scale: 1.1 }}
                        >
                          {getCategoryIcon(transaction.category)}
                        </motion.span>
                      </motion.div>
                      <div>
                        <motion.p
                          className="font-medium text-gray-900"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 + 0.1 * index }}
                        >
                          {transaction.description}
                        </motion.p>
                        <motion.p
                          className="text-sm text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + 0.1 * index }}
                        >
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString('zh-CN')}
                        </motion.p>
                      </div>
                    </div>
                    <motion.div
                      className="text-right"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + 0.05 * index }}
                    >
                      <motion.p
                        className={`font-bold text-lg ${transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}¥{Math.abs(transaction.amount).toLocaleString()}
                      </motion.p>
                      <motion.div
                        className={`text-xs font-medium px-2 py-1 rounded-full ${transaction.type === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + 0.05 * index }}
                      >
                        {transaction.type === 'income' ? '收入' : '支出'}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {transactions.length >= 10 && (
                <motion.div
                  className="text-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showAll ? t('transactions.showLess') : t('transactions.showMore')}
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </>
  )
}