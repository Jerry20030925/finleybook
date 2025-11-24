'use client'

const transactions = [
  {
    id: '1',
    description: 'Starbucks Coffee',
    category: '餐饮',
    amount: -45.67,
    date: '2024-01-20',
    merchant: 'Starbucks',
    type: 'expense' as const
  },
  {
    id: '2',
    description: '工资收入',
    category: '收入',
    amount: 8500.00,
    date: '2024-01-15',
    merchant: 'ABC Company',
    type: 'income' as const
  },
  {
    id: '3',
    description: 'Uber Ride',
    category: '交通',
    amount: -28.50,
    date: '2024-01-18',
    merchant: 'Uber',
    type: 'expense' as const
  },
  {
    id: '4',
    description: '超市购物',
    category: '购物',
    amount: -156.23,
    date: '2024-01-17',
    merchant: '华润万家',
    type: 'expense' as const
  },
  {
    id: '5',
    description: '投资收益',
    category: '投资',
    amount: 234.56,
    date: '2024-01-16',
    merchant: '招商证券',
    type: 'income' as const
  }
]

const categoryColors = {
  '餐饮': 'bg-yellow-100 text-yellow-800',
  '收入': 'bg-green-100 text-green-800',
  '交通': 'bg-blue-100 text-blue-800',
  '购物': 'bg-purple-100 text-purple-800',
  '投资': 'bg-indigo-100 text-indigo-800'
}

export default function RecentTransactions() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">最近交易</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          查看全部
        </button>
      </div>
      
      <div className="overflow-hidden">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-5">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {transaction.merchant.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <p className={`text-sm font-medium ${
                          transaction.type === 'income' 
                            ? 'text-success-600' 
                            : 'text-danger-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}¥{Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        categoryColors[transaction.category as keyof typeof categoryColors]
                      }`}>
                        {transaction.category}
                      </span>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="btn-secondary">
          加载更多
        </button>
      </div>
    </div>
  )
}