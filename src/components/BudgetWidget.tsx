'use client'

const budgets = [
  {
    name: '餐饮',
    spent: 850,
    budget: 1000,
    color: 'bg-yellow-500'
  },
  {
    name: '交通',
    spent: 320,
    budget: 500,
    color: 'bg-blue-500'
  },
  {
    name: '购物',
    spent: 1200,
    budget: 800,
    color: 'bg-purple-500'
  },
  {
    name: '娱乐',
    spent: 180,
    budget: 400,
    color: 'bg-green-500'
  }
]

export default function BudgetWidget() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">预算执行</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          管理预算
        </button>
      </div>
      
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budget) * 100
          const isOverBudget = percentage > 100
          
          return (
            <div key={budget.name} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                <span className={`text-sm ${
                  isOverBudget ? 'text-danger-600' : 'text-gray-600'
                }`}>
                  ¥{budget.spent} / ¥{budget.budget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isOverBudget ? 'bg-danger-500' : budget.color
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage.toFixed(0)}% 已使用</span>
                {isOverBudget && (
                  <span className="text-danger-600 font-medium">
                    超支 ¥{budget.spent - budget.budget}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}