'use client'

import { LightBulbIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { AIInsight } from '@/types'

interface InsightsWidgetProps {
  insights: AIInsight[]
}

export default function InsightsWidget({ insights }: InsightsWidgetProps) {
  const displayInsights = insights

  const getInsightIcon = (type: string, priority: string) => {
    switch (type) {
      case 'spending_pattern':
        return priority === 'high' ? ExclamationTriangleIcon : ArrowTrendingUpIcon
      case 'budget_alert':
        return priority === 'high' ? ExclamationTriangleIcon : CheckCircleIcon
      case 'goal_tracking':
        return ArrowTrendingUpIcon
      default:
        return LightBulbIcon
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600 bg-danger-50'
      case 'medium':
        return 'text-warning-600 bg-warning-50'
      case 'low':
        return 'text-success-600 bg-success-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">AI 智能洞察</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          查看全部
        </button>
      </div>

      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const Icon = getInsightIcon(insight.type, insight.priority)
          const colorClass = getPriorityColor(insight.priority)

          return (
            <div key={insight.id} className="border rounded-lg p-4 hover:border-primary-200 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${insight.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                      insight.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                        'bg-success-100 text-success-800'
                      }`}>
                      {insight.priority === 'high' ? '高优先级' :
                        insight.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
                  {insight.actionable && (
                    <div className="mt-2">
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        查看建议 →
                      </button>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {insight.createdAt.toLocaleDateString('en-AU')}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {displayInsights.length === 0 && (
        <div className="text-center py-8">
          <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无新洞察</h3>
          <p className="mt-1 text-sm text-gray-500">
            AI 正在分析您的财务数据，稍后将为您提供个性化建议
          </p>
        </div>
      )}
    </div>
  )
}