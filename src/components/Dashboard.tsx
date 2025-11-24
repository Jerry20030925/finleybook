'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import Navigation from './Navigation'
import FinancialOverview from './FinancialOverview'
import RecentTransactions from './RecentTransactions'
import BudgetWidget from './BudgetWidget'
import GoalsWidget from './GoalsWidget'
import InsightsWidget from './InsightsWidget'
import RiskAlerts from './RiskAlerts'
import QuickActions from './QuickActions'
import { AIAnalyticsService } from '@/lib/services/aiAnalytics'
import { TaxRiskMonitoringService } from '@/lib/services/taxRiskMonitoring'
import { AIInsight, RiskAlert } from '@/types'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [aiInsights, taxAlerts] = await Promise.all([
        AIAnalyticsService.getInstance().generatePersonalizedInsights(user.uid),
        TaxRiskMonitoringService.getInstance().monitorTaxCompliance(user.uid)
      ])
      
      setInsights(aiInsights)
      setRiskAlerts(taxAlerts)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            欢迎回来，{user?.email?.split('@')[0]}
          </h1>
          <p className="mt-1 text-gray-600">
            这是您的财务概览和最新洞察
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
          <div className="mb-8">
            <RiskAlerts alerts={riskAlerts} />
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Financial Overview */}
            <FinancialOverview />
            
            {/* Recent Transactions */}
            <RecentTransactions />
            
            {/* AI Insights */}
            <InsightsWidget insights={insights} />
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-8">
            {/* Budget Widget */}
            <BudgetWidget />
            
            {/* Goals Widget */}
            <GoalsWidget />
            
            {/* Financial Health Score */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">财务健康评分</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">85</div>
                <div className="text-sm text-gray-600">整体财务状况良好</div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">储蓄率</span>
                    <span className="text-sm font-medium">优秀</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">预算执行</span>
                    <span className="text-sm font-medium">良好</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">债务管理</span>
                    <span className="text-sm font-medium">优秀</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">本月概览</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总收入</span>
                  <span className="text-sm font-medium text-success-600">+¥12,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总支出</span>
                  <span className="text-sm font-medium text-danger-600">-¥8,732</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">净现金流</span>
                    <span className="text-sm font-medium text-success-600">+¥3,718</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  比上月增长 12%
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}