'use client'

import { ExclamationTriangleIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { RiskAlert } from '@/types'

interface RiskAlertsProps {
  alerts: RiskAlert[]
}

const mockAlerts: RiskAlert[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'duplicate_invoice',
    severity: 'medium',
    title: '发现重复发票',
    description: '检测到2张相同金额和日期的餐饮发票，请核实是否重复报销',
    relatedEntityId: 'invoice_123',
    relatedEntityType: 'invoice',
    isResolved: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    userId: 'user1',
    type: 'tax_deadline',
    severity: 'high',
    title: '税务申报截止日期临近',
    description: '距离季度税务申报截止还有7天，请及时准备相关材料',
    isResolved: false,
    createdAt: new Date('2024-01-01')
  }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-danger-50 border-danger-200'
    case 'high':
      return 'bg-danger-50 border-danger-200'
    case 'medium':
      return 'bg-warning-50 border-warning-200'
    case 'low':
      return 'bg-blue-50 border-blue-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return ExclamationTriangleIcon
    default:
      return ShieldExclamationIcon
  }
}

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '紧急'
    case 'high':
      return '高风险'
    case 'medium':
      return '中风险'
    case 'low':
      return '低风险'
    default:
      return '未知'
  }
}

export default function RiskAlerts({ alerts }: RiskAlertsProps) {
  // Use mock data if no alerts provided
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts

  if (displayAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {displayAlerts.map((alert) => {
        const Icon = getSeverityIcon(alert.severity)
        const colorClass = getSeverityColor(alert.severity)

        return (
          <div key={alert.id} className={`rounded-lg border p-4 ${colorClass}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${alert.severity === 'high' || alert.severity === 'critical'
                  ? 'text-danger-600'
                  : alert.severity === 'medium'
                    ? 'text-warning-600'
                    : 'text-blue-600'
                  }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${alert.severity === 'critical' ? 'bg-danger-100 text-danger-800' :
                      alert.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                        alert.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {getSeverityText(alert.severity)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.description}</p>
                  <div className="mt-3 flex space-x-3">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      查看详情
                    </button>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-700">
                      标记已解决
                    </button>
                  </div>
                </div>
              </div>
              <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}