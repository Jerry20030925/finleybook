'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Navigation from '@/components/Navigation'
import NanoBanana from '@/components/NanoBanana'
import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import toast from 'react-hot-toast'

type TimeRange = 'current_month' | 'last_month' | 'current_year' | 'custom'

export default function ReportsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const data = await getUserTransactions(user.uid, 1000) // Get more for analysis
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('加载交易数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    
    switch (timeRange) {
      case 'current_month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        }
      case 'current_year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : startOfMonth(now),
          end: customEndDate ? new Date(customEndDate) : endOfMonth(now)
        }
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
    }
  }

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange()
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= start && transactionDate <= end
    })
  }, [transactions, timeRange, customStartDate, customEndDate])

  const reportData = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income')
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses
    
    // Category breakdown
    const incomeByCategory = new Map<string, number>()
    const expensesByCategory = new Map<string, number>()
    
    income.forEach(t => {
      const current = incomeByCategory.get(t.category) || 0
      incomeByCategory.set(t.category, current + t.amount)
    })
    
    expenses.forEach(t => {
      const current = expensesByCategory.get(t.category) || 0
      expensesByCategory.set(t.category, current + t.amount)
    })

    // Payment method breakdown
    const paymentMethods = new Map<string, number>()
    filteredTransactions.forEach(t => {
      if (t.paymentMethod) {
        const current = paymentMethods.get(t.paymentMethod) || 0
        paymentMethods.set(t.paymentMethod, current + t.amount)
      }
    })

    // Daily average
    const { start, end } = getDateRange()
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const avgDailyIncome = totalIncome / daysDiff
    const avgDailyExpense = totalExpenses / daysDiff

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: filteredTransactions.length,
      incomeByCategory: Array.from(incomeByCategory.entries()).map(([name, value]) => ({ name, value })),
      expensesByCategory: Array.from(expensesByCategory.entries()).map(([name, value]) => ({ name, value })),
      paymentMethods: Array.from(paymentMethods.entries()).map(([name, value]) => ({ name, value })),
      avgDailyIncome,
      avgDailyExpense,
      daysDiff
    }
  }, [filteredTransactions])

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('没有数据可导出')
      return
    }

    const headers = ['日期', '类型', '分类', '描述', '金额', '支付方式']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.type === 'income' ? '收入' : '支出',
        t.category,
        `"${t.description}"`,
        t.amount,
        t.paymentMethod || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `财务报表_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('报表导出成功')
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'current_month': return '本月'
      case 'last_month': return '上月'
      case 'current_year': return '本年'
      case 'custom': return '自定义'
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">财务报表</h1>
          <p className="text-gray-600">分析您的收支情况和财务趋势</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="current_month">本月</option>
                <option value="last_month">上月</option>
                <option value="current_year">本年</option>
                <option value="custom">自定义范围</option>
              </select>

              {timeRange === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
            </div>

            <motion.button
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              导出 CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总收入</h3>
            <p className="text-2xl font-bold text-green-600">¥{reportData.totalIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">日均 ¥{reportData.avgDailyIncome.toFixed(0)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">总支出</h3>
            <p className="text-2xl font-bold text-red-600">¥{reportData.totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">日均 ¥{reportData.avgDailyExpense.toFixed(0)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">净收入</h3>
            <p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {reportData.netIncome >= 0 ? '+' : ''}¥{reportData.netIncome.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">储蓄率 {reportData.totalIncome > 0 ? ((reportData.netIncome / reportData.totalIncome) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">交易次数</h3>
            <p className="text-2xl font-bold text-purple-600">{reportData.transactionCount}</p>
            <p className="text-xs text-gray-500 mt-1">{reportData.daysDiff} 天期间</p>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">收支分析图表</h2>
          <NanoBanana transactions={filteredTransactions} />
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Income Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">收入分类</h3>
            {reportData.incomeByCategory.length > 0 ? (
              <div className="space-y-3">
                {reportData.incomeByCategory
                  .sort((a, b) => b.value - a.value)
                  .map((category, index) => {
                    const percentage = (category.value / reportData.totalIncome) * 100
                    return (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm text-gray-500">¥{category.value.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${percentage}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无收入数据</p>
            )}
          </div>

          {/* Expense Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">支出分类</h3>
            {reportData.expensesByCategory.length > 0 ? (
              <div className="space-y-3">
                {reportData.expensesByCategory
                  .sort((a, b) => b.value - a.value)
                  .map((category, index) => {
                    const percentage = (category.value / reportData.totalExpenses) * 100
                    return (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm text-gray-500">¥{category.value.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full bg-red-500"
                              style={{ width: `${percentage}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无支出数据</p>
            )}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">支付方式分布</h3>
          {reportData.paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportData.paymentMethods
                .sort((a, b) => b.value - a.value)
                .map((method, index) => {
                  const totalAmount = reportData.paymentMethods.reduce((sum, m) => sum + m.value, 0)
                  const percentage = (method.value / totalAmount) * 100
                  return (
                    <div key={method.name} className="text-center">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{method.name}</h4>
                        <p className="text-lg font-bold text-blue-600">¥{method.value.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无支付数据</p>
          )}
        </motion.div>

        {/* Period Summary */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {getTimeRangeLabel()}报告总结
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{reportData.daysDiff}</p>
              <p className="text-sm text-gray-600">统计天数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{reportData.transactionCount}</p>
              <p className="text-sm text-gray-600">总交易数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.transactionCount > 0 ? (reportData.transactionCount / reportData.daysDiff).toFixed(1) : 0}
              </p>
              <p className="text-sm text-gray-600">日均交易</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {reportData.totalIncome > 0 ? ((reportData.netIncome / reportData.totalIncome) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">储蓄率</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}