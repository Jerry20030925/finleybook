import { useMemo, useState, useEffect } from 'react'
import {
    Treemap,
    AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine
} from 'recharts'
import { Transaction } from '@/lib/dataService'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CHART_MOTION } from '@/lib/motionTokens'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface WealthAnalyticsProps {
    transactions: Transaction[]
}

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1']
// Professional Blue-Grey Palette for Investment Bank look

export default function WealthAnalytics({ transactions }: WealthAnalyticsProps) {
    const { formatAmount } = useCurrency()
    const { t } = useLanguage()
    const prefersReducedMotion = useReducedMotion()
    const [viewMode, setViewMode] = useState<'expense' | 'all'>('expense')
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [selectedTreemapCategory, setSelectedTreemapCategory] = useState<string | null>(null)
    const [activeTrendIndex, setActiveTrendIndex] = useState<number | null>(null)
    const chartAreaAnimationDuration = prefersReducedMotion
        ? 0
        : (isSmallScreen ? CHART_MOTION.areaDrawMs.mobile : CHART_MOTION.areaDrawMs.desktop)

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 640)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        setActiveTrendIndex(null)
    }, [viewMode])

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

    const totalExpenseForTreemap = useMemo(
        () => treemapData.reduce((sum, item) => sum + item.size, 0),
        [treemapData]
    )

    const topTreemapCategories = useMemo(
        () => treemapData.slice(0, 5).map((item) => ({
            ...item,
            ratio: totalExpenseForTreemap > 0 ? (item.size / totalExpenseForTreemap) * 100 : 0
        })),
        [treemapData, totalExpenseForTreemap]
    )

    // Custom Content for Treemap
    const RenderTreemapContent = (props: any) => {
        const { root, depth, x, y, width, height, index, payload, colors, name, value } = props;
        const isSelected = !selectedTreemapCategory || selectedTreemapCategory === name

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
                        opacity: isSelected ? 1 : 0.35,
                    }}
                />
                {width > (isSmallScreen ? 64 : 50) && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill={index < 4 ? "#fff" : "#1e293b"}
                        fontSize={12}
                        fontWeight="bold"
                        opacity={isSelected ? 1 : 0.45}
                    >
                        {name}
                    </text>
                )}
                {!isSmallScreen && width > 50 && height > 50 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 16}
                        textAnchor="middle"
                        fill={index < 4 ? "rgba(255,255,255,0.7)" : "#475569"}
                        fontSize={10}
                        opacity={isSelected ? 1 : 0.45}
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

    const averageExpenseLine = useMemo(() => {
        const nonZeroDays = trendData.filter((item) => item.expense > 0)
        if (nonZeroDays.length === 0) return 0
        return nonZeroDays.reduce((sum, item) => sum + item.expense, 0) / nonZeroDays.length
    }, [trendData])

    const activeTrendPoint = activeTrendIndex !== null ? trendData[activeTrendIndex] ?? null : null

    const handleTrendPointerMove = (state: any) => {
        const nextIndex = typeof state?.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null
        if (nextIndex === null) return
        if (nextIndex >= 0 && nextIndex < trendData.length) {
            setActiveTrendIndex(nextIndex)
        }
    }

    const clearTrendPointer = () => {
        setActiveTrendIndex(null)
    }

    const MobileFriendlyTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null
        const expensePoint = payload.find((entry: any) => entry.dataKey === 'expense')
        const incomePoint = payload.find((entry: any) => entry.dataKey === 'income')

        return (
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={`${label}-${viewMode}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.98, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4, scale: 0.99 }}
                    transition={CHART_MOTION.tooltip}
                    className="rounded-xl border border-slate-200 bg-white/95 shadow-lg px-3 py-2 min-w-[140px] backdrop-blur-sm"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                    {expensePoint && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                            {t('reports.summary.totalExpenses')}: {formatAmount(Number(expensePoint.value || 0))}
                        </p>
                    )}
                    {incomePoint && (
                        <p className="text-xs font-medium text-emerald-600">
                            {t('reports.summary.totalIncome')}: {formatAmount(Number(incomePoint.value || 0))}
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>
        )
    }

    const TreemapTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null
        const value = Number(payload[0]?.value || 0)
        const ratio = totalExpenseForTreemap > 0 ? (value / totalExpenseForTreemap) * 100 : 0

        return (
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={`${label ?? payload[0]?.name ?? 'treemap'}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.98, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4, scale: 0.99 }}
                    transition={CHART_MOTION.tooltip}
                    className="rounded-xl border border-slate-200 bg-white/95 shadow-lg px-3 py-2 min-w-[150px] backdrop-blur-sm"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">{payload[0]?.name ?? label}</p>
                    <p className="mt-1 text-xs font-medium text-slate-900">{formatAmount(value)}</p>
                    <p className="text-[11px] text-slate-500">{ratio.toFixed(1)}% of expenses</p>
                </motion.div>
            </AnimatePresence>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                {t('charts.noData')}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 print:grid-cols-2 print:gap-6">
            {/* Cash Flow Trend - Area Chart */}
            <motion.div
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 print-card"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={!isSmallScreen && !prefersReducedMotion ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : undefined}
                transition={CHART_MOTION.cardReveal}
            >
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                    <div className="flex justify-between items-start gap-3">
                        <div>
                        <h3 className="text-lg font-bold text-gray-900">Wealth Analytics</h3>
                        <p className="text-xs text-gray-400">30 Day Analysis</p>
                            {isSmallScreen && (
                                <p className="mt-1 text-[11px] text-slate-500">Tap the chart to inspect daily values.</p>
                            )}
                        </div>
                        {/* View Controls - hidden on print */}
                        <div className="flex bg-gray-100 p-1 rounded-xl print:hidden shrink-0">
                            <motion.button
                                type="button"
                                aria-pressed={viewMode === 'expense'}
                                onClick={() => setViewMode('expense')}
                                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                                className={`px-3 py-2 min-h-9 text-xs font-bold rounded-lg transition-all ${viewMode === 'expense' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Expenses
                            </motion.button>
                            <motion.button
                                type="button"
                                aria-pressed={viewMode === 'all'}
                                onClick={() => setViewMode('all')}
                                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                                className={`px-3 py-2 min-h-9 text-xs font-bold rounded-lg transition-all ${viewMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-slate-500">Avg Expense (active days)</p>
                            <p className="mt-0.5 font-semibold text-slate-900">{formatAmount(averageExpenseLine)}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-slate-500">Trend mode</p>
                            <p className="mt-0.5 font-semibold text-slate-900">{viewMode === 'all' ? 'Income + Expense' : 'Expense only'}</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTrendPoint ? `focus-${activeTrendPoint.date}` : `mode-${viewMode}`}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 6, filter: 'blur(2px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                            transition={CHART_MOTION.tooltip}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        >
                            {activeTrendPoint ? (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="font-semibold text-slate-900">Focus {activeTrendPoint.date}</span>
                                    <span className="text-red-600">
                                        Expense: <span className="font-semibold">{formatAmount(activeTrendPoint.expense)}</span>
                                    </span>
                                    {viewMode === 'all' && (
                                        <span className="text-emerald-600">
                                            Income: <span className="font-semibold">{formatAmount(activeTrendPoint.income)}</span>
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                                    <span className="font-medium text-slate-800">
                                        {viewMode === 'all' ? 'Viewing income and expense trend' : 'Viewing expense trend'}
                                    </span>
                                    <span>{isSmallScreen ? 'Touch and drag on chart to inspect each day.' : 'Hover chart points to inspect daily values.'}</span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="h-[220px] sm:h-[250px] w-full">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`trend-${viewMode}`}
                            className="h-full w-full"
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 4, scale: 0.995, filter: 'blur(3px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -3, scale: 0.995 }}
                            transition={CHART_MOTION.rowReveal}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={trendData}
                                    margin={{ top: 10, right: 10, left: isSmallScreen ? -28 : -20, bottom: 0 }}
                                    onMouseMove={handleTrendPointerMove}
                                    onMouseLeave={clearTrendPointer}
                                >
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
                                        minTickGap={isSmallScreen ? 42 : 30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        tick={{ fontSize: 10, fill: '#64748B' }}
                                    />
                                    <Tooltip
                                        content={<MobileFriendlyTooltip />}
                                        cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                                    />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                    {averageExpenseLine > 0 && (
                                        <ReferenceLine
                                            y={averageExpenseLine}
                                            stroke="#94A3B8"
                                            strokeDasharray="4 4"
                                            ifOverflow="extendDomain"
                                            label={isSmallScreen ? undefined : { value: 'Avg expense', fill: '#64748B', fontSize: 10 }}
                                        />
                                    )}

                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                        name="Expense"
                                        activeDot={{ r: isSmallScreen ? 5 : 4, strokeWidth: 2 }}
                                        animationBegin={prefersReducedMotion ? 0 : CHART_MOTION.areaDrawDelayMs}
                                        animationEasing={CHART_MOTION.rechartsEasing}
                                        animationDuration={chartAreaAnimationDuration}
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
                                            activeDot={{ r: isSmallScreen ? 5 : 4, strokeWidth: 2 }}
                                            animationBegin={prefersReducedMotion ? 0 : CHART_MOTION.areaDrawDelayMs + 40}
                                            animationEasing={CHART_MOTION.rechartsEasing}
                                            animationDuration={chartAreaAnimationDuration}
                                        />
                                    )}

                                    {/* Budget Line Removed - Dynamic later */}
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Expense Breakdown Treemap */}
            <motion.div
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 print-card"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={!isSmallScreen && !prefersReducedMotion ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : undefined}
                transition={{ ...CHART_MOTION.cardRevealDelayed, delay: prefersReducedMotion ? 0 : 0.08 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Heatmap Analysis</h3>
                        <p className="text-xs text-gray-400">Expense Distribution</p>
                    </div>
                    {selectedTreemapCategory && (
                        <motion.button
                            type="button"
                            onClick={() => setSelectedTreemapCategory(null)}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                        >
                            Clear focus
                        </motion.button>
                    )}
                </div>

                <div className="h-[220px] sm:h-[250px] w-full">
                    {treemapData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={treemapData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                fill="#8884d8"
                                content={<RenderTreemapContent />}
                                isAnimationActive={!prefersReducedMotion}
                                animationDuration={chartAreaAnimationDuration}
                                animationEasing={CHART_MOTION.rechartsEasing}
                                onClick={(node: any) => {
                                    const nextName = typeof node?.name === 'string' ? node.name : null
                                    setSelectedTreemapCategory((prev) => (prev === nextName ? null : nextName))
                                }}
                            >
                                <Tooltip content={<TreemapTooltip />} />
                            </Treemap>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <p>No expense data to analyze</p>
                        </div>
                    )}
                </div>
                {topTreemapCategories.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                        {topTreemapCategories.map((item, index) => {
                            const isFocused = selectedTreemapCategory === item.name
                            return (
                                <motion.button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setSelectedTreemapCategory((prev) => (prev === item.name ? null : item.name))}
                                    layout
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        ...CHART_MOTION.rowReveal,
                                        delay: prefersReducedMotion ? 0 : index * CHART_MOTION.rowStagger
                                    }}
                                    whileHover={!prefersReducedMotion ? { y: -1 } : undefined}
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${isFocused
                                        ? 'border-indigo-200 bg-indigo-50'
                                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-slate-800 truncate">{item.name}</span>
                                        <span className="text-xs font-semibold text-slate-500 shrink-0">{item.ratio.toFixed(1)}%</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <span className="text-xs text-slate-500">{isFocused ? 'Focused in heatmap' : 'Tap to focus in heatmap'}</span>
                                        <span className="text-xs font-semibold text-slate-700">{formatAmount(item.size)}</span>
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
