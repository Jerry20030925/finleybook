'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

export default function GoalsWidget() {
  const goals: any[] = [] // TODO: Fetch real goals
  const router = useRouter()
  const { language } = useLanguage()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{language === 'en' ? 'Financial Goals' : '财务目标'}</h3>
        <button 
          onClick={() => router.push('/goals')}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {language === 'en' ? 'Manage Goals' : '管理目标'}
        </button>
      </div>

      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percentage = (goal.current / goal.target) * 100
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

            return (
              <div key={goal.id} className="border rounded-lg p-3 hover:border-primary-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{goal.name}</h4>
                  <span className="text-xs text-gray-500">
                    {daysLeft > 0 ? (language === 'en' ? `${daysLeft} days` : `${daysLeft}天`) : (language === 'en' ? 'Expired' : '已到期')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">¥{goal.current.toLocaleString()}</span>
                    <span className="text-gray-900">¥{goal.target.toLocaleString()}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(0)}% {language === 'en' ? 'completed' : '完成'}</span>
                    <span>{language === 'en' ? 'Need' : '还需'} ¥{(goal.target - goal.current).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            {language === 'en' ? 'No financial goals yet' : '暂无财务目标'}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button 
          onClick={() => router.push('/goals')}
          className="w-full btn-secondary text-sm"
        >
          {language === 'en' ? 'Add New Goal' : '添加新目标'}
        </button>
      </div>
    </div>
  )
}