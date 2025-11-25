'use client'

import { useMemo } from 'react'
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Transaction } from '@/lib/dataService'
import { motion } from 'framer-motion'

interface NanoBananaProps {
    transactions: Transaction[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']

export default function NanoBanana({ transactions }: NanoBananaProps) {

    // Process data for Pie Chart (Expenses by Category)
    const expenseData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense')
        const categoryMap = new Map<string, number>()

        expenses.forEach(t => {
            const current = categoryMap.get(t.category) || 0
            categoryMap.set(t.category, current + t.amount)
        })

        return Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [transactions])

    // Process data for Bar Chart (Income vs Expense)
    const summaryData = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)

        return [
            { name: '收入', amount: income },
            { name: '支出', amount: expense }
        ]
    }, [transactions])

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                暂无交易数据，无法生成图表
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Expense Breakdown Pie Chart */}
            <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">支出分类占比</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Income vs Expense Bar Chart */}
            <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">收支对比</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={summaryData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `¥${value}`} />
                            <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="amount" name="金额" radius={[4, 4, 0, 0]}>
                                {summaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === '收入' ? '#10B981' : '#EF4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    )
}
