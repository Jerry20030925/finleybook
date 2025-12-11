import { useMemo, useState, useEffect } from 'react'
import {
    Treemap, Cell,
    AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine
} from 'recharts'
import { Transaction } from '@/lib/dataService'
import { motion } from 'framer-motion'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface NanoBananaProps {
    transactions: Transaction[]
}

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1']
// Professional Blue-Grey Palette for Investment Bank look

export default function NanoBanana({ transactions }: NanoBananaProps) {
    const { formatAmount } = useCurrency()
    const { t } = useLanguage()
    const [viewMode, setViewMode] = useState<'expense' | 'all'>('expense')

    // Helper to translate category names
    const getCategoryName = (category: string) => {
        const categoryMap: Record<string, string> = {
            'Salary Income': 'category.salary', '工资收入': 'category.salary',
            'Investment Returns': 'category.investment', '投资收益': 'category.investment',
            'Part-time Income': 'category.parttime', '兼职收入': 'category.parttime',
            'Other Income': 'category.otherIncome', '其他收入': 'category.otherIncome',
            'Food & Dining': 'category.food', '餐饮美食': 'category.food',
            'Transportation': 'category.transport', '交通出行': 'category.transport',
            'Shopping': 'category.shopping', '购物消费': 'category.shopping',
            'Housing & Utilities': 'category.housing', '居住缴费': 'category.housing',
            'Health & Medical': 'category.health', '医疗健康': 'category.health',
            'Entertainment': 'category.entertainment', '文化娱乐': 'category.entertainment',
            'Education': 'category.education', '学习教育': 'category.education',
            'Other Expenses': 'category.otherExpense', '其他支出': 'category.otherExpense'
        }

        const key = categoryMap[category]
        return key ? t(key) : category
    }

    // Process data for Treemap (Expenses)
    const treemapData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense')
        const categoryMap = new Map<string, number>()

        expenses.forEach(t => {
            const current = categoryMap.get(t.category) || 0
            categoryMap.set(t.category, current + Math.abs(t.amount))
        })

        const data = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name: getCategoryName(name), size: value }))
            .sort((a, b) => b.size - a.size)

        // Wrap in a root object for Recharts Treemap if required, 
        // but Recharts Treemap just takes an array for simple display usually implies hierarchical, 
        // actually Recharts Treemap data format: array of objects with 'size'.
        return data
    }, [transactions, t])

    // Custom Content for Treemap
    const RenderTreemapContent = (props: any) => {
        const { root, depth, x, y, width, height, index, payload, colors, name, value } = props;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: index < 4 ? COLORS[index % COLORS.length] : '#E2E8F0', // Top items dark, others light
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                    }}
                />
                {width > 50 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill={index < 4 ? "#fff" : "#1e293b"}
                        fontSize={12}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                )}
                {width > 50 && height > 50 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 16}
                        textAnchor="middle"
                        fill={index < 4 ? "rgba(255,255,255,0.7)" : "#475569"}
                        fontSize={10}
                    >
                        {formatAmount(value)}
                    </text>
                )}
            </g>
        );
    };

    // Process data for Cash Flow Trend (Last 30 Days)
    const [trendData, setTrendData] = useState<{ date: string, income: number, expense: number }[]>([])

    useEffect(() => {
        // Last 30 days logic
        const last30Days = new Array(30).fill(0).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (29 - i))
            return d.toISOString().split('T')[0]
        })

        const dailyMap = new Map<string, { income: number, expense: number }>()
        transactions.forEach(t => {
            const dateKey = new Date(t.date).toISOString().split('T')[0]
            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, { income: 0, expense: 0 })
            }
            const current = dailyMap.get(dateKey)!

            if (t.type === 'expense') {
                current.expense += Math.abs(t.amount)
            } else if (t.type === 'income' || t.type === 'cashback') {
                current.income += t.amount
            }
        })

        const data = last30Days.map(date => {
            const dayData = dailyMap.get(date) || { income: 0, expense: 0 }
            return {
                date: new Date(date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
                income: dayData.income,
                expense: dayData.expense
            }
        })
        setTrendData(data)
    }, [transactions])

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                {t('charts.noData')}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2 print:gap-6">
            {/* Cash Flow Trend - Area Chart */}
            <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Cash Flow Trend</h3>
                        <p className="text-xs text-gray-400">30 Day Analysis</p>
                    </div>
                    {/* View Controls - hidden on print */}
                    <div className="flex bg-gray-100 p-1 rounded-lg print:hidden">
                        <button
                            onClick={() => setViewMode('expense')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All
                        </button>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748B' }}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${value}`}
                                tick={{ fontSize: 10, fill: '#64748B' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}
                                formatter={(value: number) => formatAmount(value)}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />

                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                name="Expense"
                                animationDuration={1000}
                            />

                            {viewMode === 'all' && (
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    name="Income"
                                    animationDuration={1000}
                                />
                            )}

                            {/* Budget Line Mockup */}
                            <ReferenceLine y={1000} stroke="gray" strokeDasharray="3 3" label={{ position: 'top', value: 'Budget Limit', fontSize: 10, fill: 'gray' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Expense Breakdown Treemap */}
            <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Heatmap Analysis</h3>
                        <p className="text-xs text-gray-400">Expense Distribution</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    {treemapData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={treemapData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                fill="#8884d8"
                                content={<RenderTreemapContent />}
                            >
                                <Tooltip formatter={(value: number) => formatAmount(value)} />
                            </Treemap>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <p>No expense data to analyze</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
