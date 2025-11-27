'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/components/AuthProvider'
import toast from 'react-hot-toast'

interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: 'savings' | 'investment' | 'purchase' | 'debt' | 'emergency'
  isCompleted: boolean
  createdAt: Date
}

const GOAL_CATEGORIES = {
  savings: { label: '储蓄目标', color: 'bg-green-100 text-green-800', icon: '💰' },
  investment: { label: '投资目标', color: 'bg-blue-100 text-blue-800', icon: '📈' },
  purchase: { label: '购买目标', color: 'bg-purple-100 text-purple-800', icon: '🛒' },
  debt: { label: '债务清偿', color: 'bg-red-100 text-red-800', icon: '💳' },
  emergency: { label: '应急基金', color: 'bg-yellow-100 text-yellow-800', icon: '🛡️' }
}

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showProgressModal, setShowProgressModal] = useState<Goal | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'savings' as keyof typeof GOAL_CATEGORIES
  })

  const [progressAmount, setProgressAmount] = useState('')

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    try {
      setLoading(true)
      // Create sample goals for demonstration
      setGoals([])
    } catch (error) {
      console.error('Error loading goals:', error)
      toast.error('加载目标失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error('请填写必要信息')
      return
    }

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal ? editingGoal.currentAmount : 0,
      deadline: formData.deadline,
      category: formData.category,
      isCompleted: editingGoal ? editingGoal.isCompleted : false,
      createdAt: editingGoal ? editingGoal.createdAt : new Date()
    }

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? newGoal : g))
      toast.success('目标更新成功')
    } else {
      setGoals(prev => [...prev, newGoal])
      toast.success('目标添加成功')
    }

    setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: 'savings' })
    setShowModal(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      category: goal.category
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    toast.success('目标删除成功')
  }

  const handleUpdateProgress = (goal: Goal) => {
    const amount = parseFloat(progressAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error('请输入有效金额')
      return
    }

    const updatedGoal = {
      ...goal,
      currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
      isCompleted: goal.currentAmount + amount >= goal.targetAmount
    }

    setGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g))
    setShowProgressModal(null)
    setProgressAmount('')

    if (updatedGoal.isCompleted) {
      toast.success('🎉 恭喜！目标已完成！')
    } else {
      toast.success('进度更新成功')
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const targetDate = new Date(deadline)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const activeGoals = goals.filter(g => !g.isCompleted)
  const completedGoals = goals.filter(g => g.isCompleted)

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">目标管理</h1>
          <p className="text-gray-600">设定并追踪您的财务目标</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总目标</h3>
            <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">进行中</h3>
            <p className="text-2xl font-bold text-orange-600">{activeGoals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">已完成</h3>
            <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">完成率</h3>
            <p className="text-2xl font-bold text-purple-600">
              {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
            </p>
          </div>
        </motion.div>

        {/* Add Goal Button */}
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
            添加目标
          </motion.button>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">进行中的目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map((goal, index) => {
              const percentage = getProgressPercentage(goal.currentAmount, goal.targetAmount)
              const daysLeft = getDaysUntilDeadline(goal.deadline)
              const category = GOAL_CATEGORIES[goal.category]

              return (
                <motion.div
                  key={goal.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>¥{goal.currentAmount.toLocaleString()}</span>
                      <span>¥{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(1)}% 完成
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {daysLeft > 0 ? `${daysLeft} 天后到期` : '已过期'}
                    </div>
                    <button
                      onClick={() => setShowProgressModal(goal)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      更新进度
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">已完成的目标</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal, index) => {
                const category = GOAL_CATEGORIES[goal.category]

                return (
                  <motion.div
                    key={goal.id}
                    className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-green-600 font-medium">
                      🎉 目标已完成！¥{goal.targetAmount.toLocaleString()}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Add/Edit Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white p-6 rounded-xl max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingGoal ? '编辑目标' : '添加目标'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    目标名称
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                    placeholder="例如：紧急基金"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述（可选）
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                    rows={3}
                    placeholder="目标的详细描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    目标金额
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as keyof typeof GOAL_CATEGORIES }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  >
                    {Object.entries(GOAL_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingGoal(null)
                      setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: 'savings' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingGoal ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Progress Update Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white p-6 rounded-xl max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                更新进度 - {showProgressModal.title}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  当前进度: ¥{showProgressModal.currentAmount.toLocaleString()} / ¥{showProgressModal.targetAmount.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${getProgressPercentage(showProgressModal.currentAmount, showProgressModal.targetAmount)}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  增加金额
                </label>
                <input
                  type="number"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowProgressModal(null)
                    setProgressAmount('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpdateProgress(showProgressModal)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  更新
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}