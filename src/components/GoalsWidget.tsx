'use client'

const goals = [
  {
    id: '1',
    name: '紧急基金',
    current: 15000,
    target: 30000,
    deadline: '2024-12-31',
    category: 'emergency_fund'
  },
  {
    id: '2',
    name: '日本旅行',
    current: 8500,
    target: 15000,
    deadline: '2024-06-01',
    category: 'vacation'
  },
  {
    id: '3',
    name: '房屋首付',
    current: 125000,
    target: 300000,
    deadline: '2025-12-31',
    category: 'home_purchase'
  }
]

export default function GoalsWidget() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">财务目标</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          管理目标
        </button>
      </div>
      
      <div className="space-y-4">
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          
          return (
            <div key={goal.id} className="border rounded-lg p-3 hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-900">{goal.name}</h4>
                <span className="text-xs text-gray-500">
                  {daysLeft > 0 ? `${daysLeft}天` : '已到期'}
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
                  <span>{percentage.toFixed(0)}% 完成</span>
                  <span>还需 ¥{(goal.target - goal.current).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4">
        <button className="w-full btn-secondary text-sm">
          添加新目标
        </button>
      </div>
    </div>
  )
}