'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

const stats = [
  {
    name: '总资产',
    value: '¥125,648',
    change: '+12%',
    changeType: 'positive' as const,
    description: '比上月增长'
  },
  {
    name: '本月收入',
    value: '¥12,450',
    change: '+8%',
    changeType: 'positive' as const,
    description: '比上月增长'
  },
  {
    name: '本月支出',
    value: '¥8,732',
    change: '+5%',
    changeType: 'negative' as const,
    description: '比上月增长'
  },
  {
    name: '储蓄率',
    value: '30%',
    change: '+3%',
    changeType: 'positive' as const,
    description: '比上月提升'
  }
]

export default function FinancialOverview() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">财务概览</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          查看详情
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex items-center rounded-full p-1 ${
                stat.changeType === 'positive' 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-danger-100 text-danger-800'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium ${
                stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.change}
              </span>
              <span className="ml-1 text-gray-500">{stat.description}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart placeholder */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-900 mb-4">资产趋势</h3>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">图表数据加载中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}