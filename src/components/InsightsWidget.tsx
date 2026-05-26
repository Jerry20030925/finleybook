'use client'

import { LightBulbIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { AIInsight } from '@/types'
import { useLanguage } from './LanguageProvider'
import { AnimatePresence, motion } from 'framer-motion'

interface InsightsWidgetProps {
  insights: AIInsight[]
}

export default function InsightsWidget({ insights }: InsightsWidgetProps) {
  const { t } = useLanguage()
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return t('insights.highPriority')
      case 'medium': return t('insights.mediumPriority')
      case 'low': return t('insights.lowPriority')
      default: return priority
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">{t('insights.title')}</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
          {t('insights.viewAll')}
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode='popLayout'>
          {displayInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type, insight.priority)
            const colorClass = getPriorityColor(insight.priority)

            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                whileTap={{ scale: 0.98 }}
                className="border rounded-lg p-4 cursor-pointer"
              >
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
                        {getPriorityLabel(insight.priority)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
                    {insight.actionable && (
                      <div className="mt-2">
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group">
                          {t('insights.viewAdvice')} <ArrowTrendingUpIcon className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {insight.createdAt.toLocaleDateString('en-AU')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {displayInsights.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('insights.noInsights')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('insights.analyzing')}
          </p>
        </motion.div>
      )}
    </div>
  )
}