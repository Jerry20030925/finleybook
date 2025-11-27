'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/components/AuthProvider'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { Goal, addGoal, getGoals, updateGoal, deleteGoal } from '@/lib/dataService'

export default function GoalsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
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
    category: 'savings' as Goal['category']
  })

  const [progressAmount, setProgressAmount] = useState('')

  const GOAL_CATEGORIES = {
    savings: { label: t('goals.categories.savings'), color: 'bg-green-100 text-green-800', icon: '💰' },
    investment: { label: t('goals.categories.investment'), color: 'bg-blue-100 text-blue-800', icon: '📈' },
    purchase: { label: t('goals.categories.purchase'), color: 'bg-purple-100 text-purple-800', icon: '🛒' },
    debt: { label: t('goals.categories.debt'), color: 'bg-red-100 text-red-800', icon: '💳' },
    emergency: { label: t('goals.categories.emergency'), color: 'bg-yellow-100 text-yellow-800', icon: '🛡️' }
  }

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user) return
    try {
      setLoading(true)
      const fetchedGoals = await getGoals(user.uid)
      setGoals(fetchedGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
      toast.error(t('goals.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error(t('goals.fillRequired'))
      return
    }

    try {
      if (editingGoal && editingGoal.id) {
        await updateGoal(editingGoal.id, {
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline,
          category: formData.category
        })
        toast.success(t('goals.goalUpdated'))
      } else {
        await addGoal({
          userId: user.uid,
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: 0,
          deadline: formData.deadline,
          category: formData.category,
          isCompleted: false
        })
        toast.success(t('goals.goalAdded'))
      }

      setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: 'savings' })
      setShowModal(false)
      setEditingGoal(null)
      loadGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error(t('common.error'))
    }
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

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm') + '?')) return
    try {
      await deleteGoal(id)
      toast.success(t('goals.goalDeleted'))
      loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(t('common.error'))
    }
  }

  const handleUpdateProgress = async (goal: Goal) => {
    if (!goal.id) return
    const amount = parseFloat(progressAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error(t('goals.validAmount'))
      return
    }

    const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    const isCompleted = newCurrentAmount >= goal.targetAmount

    try {
      await updateGoal(goal.id, {
        currentAmount: newCurrentAmount,
        isCompleted: isCompleted
      })

      setShowProgressModal(null)
      setProgressAmount('')
      loadGoals()

      if (isCompleted) {
        toast.success(t('goals.congratulations'))
      } else {
        toast.success(t('goals.progressUpdated'))
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error(t('common.error'))
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('goals.title')}</h1>
          <p className="text-gray-600">{t('goals.description')}</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('goals.totalGoals')}</h3>
            <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('goals.inProgress')}</h3>
            <p className="text-2xl font-bold text-orange-600">{activeGoals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('goals.completed')}</h3>
            <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('goals.completionRate')}</h3>
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
            {t('goals.addGoal')}
          </motion.button>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('goals.activeGoals')}</h2>
          {activeGoals.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">{t('transactions.noRecords')}</p>
            </div>
          ) : (
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
                          onClick={() => goal.id && handleDelete(goal.id)}
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
                        {percentage.toFixed(1)}% {t('goals.completedText')}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {daysLeft > 0 ? `${daysLeft} ${t('goals.daysLeft')}` : t('goals.expired')}
                      </div>
                      <button
                        onClick={() => setShowProgressModal(goal)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      >
                        {t('goals.updateProgress')}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('goals.completedGoals')}</h2>
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
                      {t('goals.congratulations')} ¥{goal.targetAmount.toLocaleString()}
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
                {editingGoal ? t('goals.editModal.title') : t('goals.addModal.title')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('goals.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                    placeholder={t('goals.namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('goals.descriptionLabel')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                    rows={3}
                    placeholder={t('goals.descriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('goals.targetAmount')}
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
                    {t('goals.deadline')}
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
                    {t('goals.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
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
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingGoal ? t('goals.update') : t('goals.add')}
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
                {t('goals.updateProgress')} - {showProgressModal.title}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('goals.currentProgress')}: ¥{showProgressModal.currentAmount.toLocaleString()} / ¥{showProgressModal.targetAmount.toLocaleString()}
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
                  {t('goals.addAmount')}
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
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleUpdateProgress(showProgressModal)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('goals.update')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}