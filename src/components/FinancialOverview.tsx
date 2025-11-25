'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'
import { getUserFinancialSummary } from '@/lib/dataService'

interface FinancialStat {
  name: string
  value: string
  rawValue: number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description: string
}

export default function FinancialOverview() {
  const [stats, setStats] = useState<FinancialStat[]>([])
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({})
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadFinancialData = async () => {
      if (!user?.uid) return
      
      try {
        setIsLoading(true)
        const summary = await getUserFinancialSummary(user.uid)
        
        const newStats: FinancialStat[] = [
          {
            name: '总资产',
            value: `¥${summary.totalAssets.toLocaleString()}`,
            rawValue: summary.totalAssets,
            change: '+0%',
            changeType: summary.totalAssets >= 0 ? 'positive' : 'negative',
            description: '累计净资产'
          },
          {
            name: '本月收入',
            value: `¥${summary.monthlyIncome.toLocaleString()}`,
            rawValue: summary.monthlyIncome,
            change: '+0%',
            changeType: 'positive',
            description: '本月总收入'
          },
          {
            name: '本月支出',
            value: `¥${summary.monthlyExpenses.toLocaleString()}`,
            rawValue: summary.monthlyExpenses,
            change: '+0%',
            changeType: 'negative',
            description: '本月总支出'
          },
          {
            name: '储蓄率',
            value: `${Math.max(0, summary.savingsRate).toFixed(1)}%`,
            rawValue: summary.savingsRate,
            change: '+0%',
            changeType: summary.savingsRate > 0 ? 'positive' : 'neutral',
            description: '本月储蓄占比'
          }
        ]
        
        setStats(newStats)
        
        // 设置动画目标值
        const targets = {
          '总资产': Math.abs(summary.totalAssets),
          '本月收入': summary.monthlyIncome,
          '本月支出': summary.monthlyExpenses,
          '储蓄率': Math.max(0, summary.savingsRate)
        }
        
        // 启动数字动画
        Object.entries(targets).forEach(([key, target]) => {
          let start = 0
          const duration = 2000
          const startTime = Date.now()
          
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)
            const current = start + (target - start) * easeOutCubic
            
            setAnimatedValues(prev => ({ ...prev, [key]: current }))
            
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          
          animate()
        })
        
      } catch (error) {
        console.error('Error loading financial data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFinancialData()
  }, [user?.uid])

  const formatValue = (stat: FinancialStat) => {
    const animatedValue = animatedValues[stat.name]
    if (animatedValue === undefined) return stat.value
    
    if (stat.name === '储蓄率') {
      return `${animatedValue.toFixed(1)}%`
    }
    return `¥${Math.floor(animatedValue).toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.h2 
          className="text-lg font-medium text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          财务概览
        </motion.h2>
        <motion.div 
          className="mt-1 sm:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
          >
            <dt>
              <motion.div 
                className={`absolute rounded-xl p-3 shadow-lg ${
                  stat.changeType === 'positive' ? 'bg-green-500' :
                  stat.changeType === 'negative' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.3 + 0.1 * index, 
                  type: 'spring',
                  damping: 10,
                  stiffness: 100
                }}
                whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + 0.1 * index }}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : stat.changeType === 'negative' ? (
                    <ArrowDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : (
                    <div className="h-6 w-6 bg-white rounded-full opacity-90" />
                  )}
                </motion.div>
              </motion.div>
              <p className="ml-16 text-sm font-medium text-gray-600 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <motion.p 
                className="text-2xl font-semibold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + 0.1 * index }}
              >
                {formatValue(stat)}
              </motion.p>
              {stat.change !== '+0%' && (
                <motion.p 
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600' 
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + 0.1 * index }}
                >
                  {stat.change}
                </motion.p>
              )}
              <motion.div 
                className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 sm:px-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + 0.1 * index }}
              >
                <div className="text-sm">
                  <span className="text-gray-600 font-medium">{stat.description}</span>
                </div>
              </motion.div>
            </dd>
          </motion.div>
        ))}
      </div>

      {stats.length === 0 && !isLoading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-500">暂无财务数据</p>
          <p className="text-sm text-gray-400 mt-1">开始添加交易记录来查看您的财务概览</p>
        </motion.div>
      )}
    </motion.div>
  )
}