'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, DEFAULT_CATEGORIES } from '@/lib/dataService'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'

interface Budget {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent: number
}

// Mapping from Chinese category names (stored in DB) to translation keys
const CATEGORY_MAPPING: { [key: string]: string } = {
  '餐饮美食': 'category.food',
  '交通出行': 'category.transport',
  '购物消费': 'category.shopping',
  '居住缴费': 'category.housing',
  '医疗健康': 'category.health',
  '文化娱乐': 'category.entertainment',
  '学习教育': 'category.education',
  '其他支出': 'category.otherExpense',
  '工资收入': 'category.salary',
  '投资收益': 'category.investment',
  '兼职收入': 'category.parttime',
  '其他收入': 'category.otherIncome'
}

import { useRouter } from 'next/navigation'

export default function BudgetPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadBudgets()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadBudgets = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      // Load transactions to calculate spent amounts
      const transactions = await getUserTransactions(user.uid, 1000)

      // Get current month/year for calculations
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Calculate spent amounts by category
      const spentByCategory = new Map<string, number>()

      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const transactionDate = new Date(transaction.date)
          const transactionMonth = transactionDate.getMonth()
          const transactionYear = transactionDate.getFullYear()

          // Only include current month expenses
          if (transactionMonth === currentMonth && transactionYear === currentYear) {
            const current = spentByCategory.get(transaction.category) || 0
            spentByCategory.set(transaction.category, current + transaction.amount)
          }
        }
      })

      // Create sample budgets with real spent data
      const sampleBudgets: Budget[] = [
        { id: '1', category: '餐饮美食', amount: 1000, period: 'monthly', spent: spentByCategory.get('餐饮美食') || 0 },
        { id: '2', category: '交通出行', amount: 500, period: 'monthly', spent: spentByCategory.get('交通出行') || 0 },
        { id: '3', category: '购物消费', amount: 800, period: 'monthly', spent: spentByCategory.get('购物消费') || 0 },
        { id: '4', category: '居住缴费', amount: 2000, period: 'monthly', spent: spentByCategory.get('居住缴费') || 0 },
        { id: '5', category: '文化娱乐', amount: 400, period: 'monthly', spent: spentByCategory.get('文化娱乐') || 0 },
      ]

      setBudgets(sampleBudgets)
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error(t('budget.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.amount) {
      toast.error(t('budget.fillComplete'))
      return
    }

    const newBudget: Budget = {
      id: editingBudget ? editingBudget.id : Date.now().toString(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      spent: editingBudget ? editingBudget.spent : 0
    }

    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? newBudget : b))
      toast.success(t('budget.updateSuccess'))
    } else {
      setBudgets(prev => [...prev, newBudget])
      toast.success(t('budget.addSuccess'))
    }

    setFormData({ category: '', amount: '', period: 'monthly' })
    setShowModal(false)
    setEditingBudget(null)
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id))
    toast.success(t('budget.deleteSuccess'))
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  // Helper to translate category
  const getCategoryName = (category: string) => {
    // If it's already a translation key, translate it
    if (category.startsWith('category.')) {
      return t(category)
    }
    // Try to find a mapping, otherwise return original
    const key = CATEGORY_MAPPING[category]
    return key ? t(key) : category
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('budget.title')}</h1>
          <p className="text-gray-600">{t('budget.description')}</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.totalBudget')}</h3>
            <p className="text-2xl font-bold text-blue-600">{formatAmount(totalBudget)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.spent')}</h3>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalSpent)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.remainingBudget')}</h3>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalBudget - totalSpent)}
            </p>
          </div>
        </motion.div>

        {/* Add Budget Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('budget.addBudget')}
          </motion.button>
        </motion.div>

        {/* Budgets Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {budgets.length === 0 && !loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <PlusIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('budget.emptyTitle') || 'No Budgets Yet'}</h3>
              <p className="text-gray-500 mb-6 max-w-xs">{t('budget.emptyDesc') || 'Set monthly spending limits to track your savings goals.'}</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                {t('budget.createFirst') || 'Create First Budget'}
              </button>
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
              return (
                <motion.div
                  key={budget.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1 }
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{getCategoryName(budget.category)}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{t('budget.spent')} {formatAmount(budget.spent)}</span>
                      <span>{t('budget.budgetAmount')} {formatAmount(budget.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.amount)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(1)}% {t('budget.used')}
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">{t('budget.remaining')}</span>
                    <span className={budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(budget.amount - budget.spent)}
                    </span>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Add/Edit Budget Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />

              <motion.div
                className="relative bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md mx-auto p-6 shadow-xl transform transition-all h-auto sm:h-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
              >
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-6 sm:mb-4 text-left">
                  {editingBudget ? t('budget.edit') : t('budget.addBudget')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.category')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      required
                    >
                      <option value="">{t('budget.selectCategory')}</option>
                      {DEFAULT_CATEGORIES.expense.map(category => (
                        <option key={category} value={category}>{getCategoryName(category)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.budgetAmount')}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.period')}
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'yearly' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    >
                      <option value="monthly">{t('budget.monthly')}</option>
                      <option value="yearly">{t('budget.yearly')}</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingBudget(null)
                        setFormData({ category: '', amount: '', period: 'monthly' })
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingBudget ? t('budget.update') : t('budget.addBudget')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}