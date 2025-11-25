'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './AuthProvider'
import { getUserTransactions, DEFAULT_CATEGORIES } from '@/lib/dataService'

interface Budget {
  name: string
  spent: number
  budget: number
  color: string
}

const defaultBudgets = [
  { category: '餐饮美食', budget: 1000, color: 'bg-yellow-500' },
  { category: '交通出行', budget: 500, color: 'bg-blue-500' },
  { category: '购物消费', budget: 800, color: 'bg-purple-500' },
  { category: '文化娱乐', budget: 400, color: 'bg-green-500' }
]

export default function BudgetWidget() {
  const [animatedPercentages, setAnimatedPercentages] = useState<{[key: string]: number}>({})
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadBudgetData = async () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)
        const transactions = await getUserTransactions(user.uid, 1000)
        
        // Calculate spending for current month by category
        const currentMonth = new Date()
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        
        const monthlyExpenses = transactions
          .filter(t => {
            const transactionDate = new Date(t.date)
            return t.type === 'expense' && 
                   transactionDate >= startOfMonth && 
                   transactionDate <= endOfMonth
          })

        const categorySpending = monthlyExpenses.reduce((acc, transaction) => {
          acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
          return acc
        }, {} as {[key: string]: number})

        // Create budget data
        const budgetData = defaultBudgets.map(db => ({
          name: db.category,
          spent: categorySpending[db.category] || 0,
          budget: db.budget,
          color: db.color
        }))

        setBudgets(budgetData)
        
        // Start animations
        budgetData.forEach((budget, index) => {
          const targetPercentage = (budget.spent / budget.budget) * 100
          let current = 0
          const duration = 2000 // 2 seconds
          const increment = targetPercentage / (duration / 16) // 60fps
          
          const animate = () => {
            current += increment
            if (current < targetPercentage) {
              setAnimatedPercentages(prev => ({
                ...prev,
                [budget.name]: current
              }))
              requestAnimationFrame(animate)
            } else {
              setAnimatedPercentages(prev => ({
                ...prev,
                [budget.name]: targetPercentage
              }))
            }
          }
          
          setTimeout(() => animate(), index * 150)
        })

      } catch (error) {
        console.error('Error loading budget data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgetData()
  }, [user?.uid])

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-medium text-gray-900">预算执行</h3>
        <motion.button 
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          管理预算
        </motion.button>
      </motion.div>
      
      <div className="space-y-4">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.budget) * 100
          const animatedPercentage = animatedPercentages[budget.name] || 0
          const isOverBudget = percentage > 100
          
          return (
            <motion.div 
              key={budget.name} 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                <span className={`text-sm font-medium ${
                  isOverBudget ? 'text-danger-600' : 'text-gray-600'
                }`}>
                  ¥{budget.spent} / ¥{budget.budget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden shadow-inner">
                <motion.div
                  className={`h-4 rounded-full relative shadow-sm ${
                    isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                    `bg-gradient-to-r ${budget.color.replace('bg-', 'from-')} ${budget.color.replace('bg-', 'to-')}`
                  }`}
                  initial={{ width: 0, scaleX: 0 }}
                  animate={{ 
                    width: `${Math.min(animatedPercentage, 100)}%`,
                    scaleX: 1
                  }}
                  transition={{ 
                    delay: index * 0.1 + 0.3, 
                    duration: 1.2, 
                    ease: "easeOut"
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.1 + 1.0
                    }}
                    style={{ width: '50%' }}
                  />
                  
                  {isOverBudget && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.1 + 1.5
                      }}
                      style={{ width: '60%' }}
                    />
                  )}
                </motion.div>
              </div>
              <motion.div 
                className="flex justify-between text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
              >
                <span>{animatedPercentage.toFixed(0)}% 已使用</span>
                {isOverBudget && (
                  <motion.span 
                    className="text-danger-600 font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.8, duration: 0.3, type: "spring" }}
                  >
                    超支 ¥{budget.spent - budget.budget}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}