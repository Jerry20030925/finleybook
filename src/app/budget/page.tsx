'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, DEFAULT_CATEGORIES } from '@/lib/dataService'
import toast from 'react-hot-toast'

interface Budget {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent: number
}

export default function BudgetPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  })

  useEffect(() => {
    if (user) {
      loadBudgets()
    }
  }, [user])

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
      toast.error('加载预算失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) {
      toast.error('请填写完整信息')
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
      toast.success('预算更新成功')
    } else {
      setBudgets(prev => [...prev, newBudget])
      toast.success('预算添加成功')
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
    toast.success('预算删除成功')
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">预算管理</h1>
          <p className="text-gray-600">设置和管理您的月度预算</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总预算</h3>
            <p className="text-2xl font-bold text-blue-600">¥{totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">已花费</h3>
            <p className="text-2xl font-bold text-red-600">¥{totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">剩余预算</h3>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{(totalBudget - totalSpent).toLocaleString()}
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
            添加预算
          </motion.button>
        </motion.div>

        {/* Budgets Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {budgets.map((budget, index) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
            return (
              <motion.div
                key={budget.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{budget.category}</h3>
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
                    <span>已花费 ¥{budget.spent.toLocaleString()}</span>
                    <span>预算 ¥{budget.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.amount)}`}
                      style={{ width: `${percentage}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% 已使用
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">剩余: </span>
                  <span className={budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ¥{(budget.amount - budget.spent).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Add/Edit Budget Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white p-6 rounded-xl max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBudget ? '编辑预算' : '添加预算'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    required
                  >
                    <option value="">选择分类</option>
                    {DEFAULT_CATEGORIES.expense.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    预算金额
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
                    周期
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'yearly' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  >
                    <option value="monthly">月度</option>
                    <option value="yearly">年度</option>
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
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingBudget ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}