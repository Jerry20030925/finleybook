
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Trash2, Edit2, CheckCircle2 } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { getGoals, addGoal, deleteGoal, updateGoal, Goal } from '@/lib/dataService'
import toast from 'react-hot-toast'

interface GoalsWidgetProps {
  isPro: boolean
}

export default function GoalsWidget({ isPro }: GoalsWidgetProps) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    category: 'purchase',
    deadline: '',
    icon: '🎯'
  })

  const fetchGoals = async () => {
    if (!user) return
    try {
      const data = await getGoals(user.uid)
      setGoals(data)
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [user])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!newGoal.title || !newGoal.targetAmount) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      await addGoal({
        userId: user.uid,
        title: newGoal.title!,
        description: newGoal.description || '',
        targetAmount: newGoal.targetAmount!,
        currentAmount: newGoal.currentAmount || 0,
        deadline: newGoal.deadline || '',
        category: newGoal.category as any || 'purchase',
        icon: newGoal.icon || '🎯',
        isCompleted: false
      })

      toast.success('Goal added successfully!')
      setIsModalOpen(false)
      fetchGoals()
      // Reset form
      setNewGoal({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        category: 'purchase',
        deadline: '',
        icon: '🎯'
      })
    } catch (error) {
      console.error('Error adding goal:', error)
      toast.error('Failed to add goal')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    try {
      await deleteGoal(id)
      setGoals(goals.filter(g => g.id !== id))
      toast.success('Goal deleted')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  const handleProgressUpdate = async (goal: Goal, newAmount: number) => {
    try {
      // ensure amount doesn't exceed target or drop below 0 effectively (logic can be refined)
      const updatedAmount = Math.min(newAmount, goal.targetAmount)
      await updateGoal(goal.id!, { currentAmount: updatedAmount })
      setGoals(goals.map(g => g.id === goal.id ? { ...g, currentAmount: updatedAmount } : g))

      if (updatedAmount >= goal.targetAmount && !goal.isCompleted) {
        await updateGoal(goal.id!, { isCompleted: true })
        toast.success(`🎉 You reached your goal: ${goal.title}!`)
      }
    } catch (error) {
      toast.error('Failed to update progress')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-lg">My Wishlist & Goals</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-white border border-gray-100 rounded-xl border-dashed shadow-sm">
          <div className="bg-indigo-50 p-3 rounded-full mb-3 shadow-sm">
            <Target className="text-indigo-400" size={24} />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">No goals yet</h3>
          <p className="text-sm text-gray-500 max-w-[200px] mb-4">Start saving for that special something.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            const isFinished = percentage >= 100

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl p-5 shadow-sm border ${isFinished ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} relative group overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{goal.title}</h4>
                      <p className="text-xs text-gray-500 capitalize">{goal.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id!)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">${goal.currentAmount}</span>
                  <span className="text-gray-400">of ${goal.targetAmount}</span>
                </div>

                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className={`h-full rounded-full ${isFinished ? 'bg-green-500' : 'bg-indigo-600'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>

                <div className="flex justify-end">
                  {isFinished ? (
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProgressUpdate(goal, goal.currentAmount + 10)}
                        className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium"
                      >
                        + $10
                      </button>
                      <button
                        onClick={() => handleProgressUpdate(goal, goal.currentAmount + 100)}
                        className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium"
                      >
                        + $100
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">Add New Goal</h3>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    placeholder="e.g., Japan Trip, New Laptop"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newGoal.targetAmount}
                      onChange={e => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Saved ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={newGoal.currentAmount}
                      onChange={e => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="purchase">Purchase (Gadgets, Clothes)</option>
                    <option value="vacation">Vacation / Travel</option>
                    <option value="savings">General Savings</option>
                    <option value="emergency">Emergency Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}