'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Coffee, ShoppingBag, Car, Wallet, AlertTriangle, Lightbulb, Pizza } from 'lucide-react'
import { Transaction } from '@/lib/dataService'
import { useCurrency } from '../CurrencyProvider'
import Link from 'next/link'
import { useExperience } from '@/components/ExperienceProvider'

interface SmartSuggestionsProps {
    transactions: Transaction[]
    monthlyBudget: number
}

interface Suggestion {
    id: string
    type: 'saving' | 'warning' | 'kudos' | 'analysis' | 'reminder'
    title: string
    message: string
    icon: any
    action?: string
}

const SmartSuggestions = memo(function SmartSuggestions({ transactions, monthlyBudget }: SmartSuggestionsProps) {
    const { formatAmount } = useCurrency()
    const { reduceMotion, lowPowerDevice, isMobile } = useExperience()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isThinking, setIsThinking] = useState(false)

    // Typewriter Effect State
    const [displayedMessage, setDisplayedMessage] = useState("")

    const shouldAnimateTyping = !reduceMotion && !lowPowerDevice && !isMobile

    const suggestions = useMemo<Suggestion[]>(() => {
        const newSuggestions: Suggestion[] = []
        // Guard against hydration/empty
        if (!transactions) return []

        const today = new Date()
        const currentMonth = today.getMonth()

        const thisMonthTx = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === today.getFullYear()
        })
        const totalSpent = thisMonthTx.reduce((acc, t) => acc + Math.abs(t.amount), 0)

        // 1. Dynamic Spending Analysis (The "Real AI" feel)
        const recentDining = thisMonthTx.filter(t => ['Food', 'Dining', 'Restaurants', '餐饮美食'].includes(t.category))
        const diningTotal = recentDining.reduce((acc, t) => acc + Math.abs(t.amount), 0)

        if (diningTotal > 200) {
            newSuggestions.push({
                id: 'dining_high',
                type: 'analysis',
                title: 'Dining Insight',
                message: `You spent ${formatAmount(diningTotal)} on dining this month. That's 20% higher than your average.`,
                icon: Pizza
            })
        }

        const recentShopping = thisMonthTx.filter(t => ['Shopping', 'Retail', 'Clothes', '购物', '消费', 'category.shopping'].some(k => t.category.includes(k) || t.category === k))
        const shoppingTotal = recentShopping.reduce((acc, t) => acc + Math.abs(t.amount), 0)

        if (shoppingTotal > 300) {
            newSuggestions.push({
                id: 'shopping_high',
                type: 'analysis',
                title: 'Shopping Alert',
                message: `Shopping spree detected! ${formatAmount(shoppingTotal)} spent this month. Need a cooling off period?`,
                icon: ShoppingBag
            })
        }

        // 2. Budget Alerts (Critical)
        const budgetUsage = monthlyBudget > 0 ? totalSpent / monthlyBudget : 0
        if (monthlyBudget > 0 && budgetUsage > 1.0) {
            newSuggestions.push({
                id: 'budget_critical',
                type: 'warning',
                title: 'Budget Exceeded',
                message: `You've exceeded your limit by ${formatAmount(totalSpent - monthlyBudget)}. Time to freeze spending!`,
                icon: AlertTriangle
            })
        } else if (monthlyBudget > 0 && budgetUsage > 0.85) {
            newSuggestions.push({
                id: 'budget_warning',
                type: 'warning',
                title: 'Budget Alert',
                message: `You've used ${(budgetUsage * 100).toFixed(0)}% of your budget. Proceed with caution.`,
                icon: TrendingDown
            })
        }

        // 3. Subscription & Recurring Analysis (Real)
        // Identify potential subscriptions: same description/merchant, distinct months
        const merchantMap = new Map<string, Date[]>()
        transactions.forEach(t => {
            const key = t.merchantName || t.description
            if (!merchantMap.has(key)) merchantMap.set(key, [])
            merchantMap.get(key)?.push(new Date(t.date))
        })

        merchantMap.forEach((dates, merchant) => {
            if (dates.length >= 2) {
                // Sort dates desc
                dates.sort((a, b) => b.getTime() - a.getTime())
                const lastDate = dates[0]
                const gap = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)

                // If paid roughly 30 days ago (+/- 5 days), likely due soon
                // Or if it's a known sub service (simple keyword check)
                const isSubKeyword = ['netflix', 'spotify', 'apple', 'google', 'subscription', 'membership'].some(k => merchant.toLowerCase().includes(k))

                if (isSubKeyword && gap < 35 && gap > 15) {
                    newSuggestions.push({
                        id: `sub_${merchant}`,
                        type: 'saving',
                        title: 'Subscription Review',
                        message: `You've paid ${merchant} ${dates.length} times recently. Still using it?`,
                        icon: Wallet
                    })
                }

                // Bill Reminder: If roughly month-end cycle and we haven't seen it this month but saw it last month
                const lastMonthDate = dates.find(d => d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1))
                const thisMonthDate = dates.find(d => d.getMonth() === currentMonth)

                if (lastMonthDate && !thisMonthDate && today.getDate() > 15) {
                    newSuggestions.push({
                        id: `reminder_${merchant}`,
                        type: 'reminder',
                        title: 'Expected Bill',
                        message: `Haven't seen your ${merchant} bill yet this month. usually comes around the ${lastMonthDate.getDate()}th.`,
                        icon: Lightbulb
                    })
                }
            }
        })

        // 4. Positive Reinforcement (Kudos)
        if (monthlyBudget > 0 && budgetUsage < 0.5 && today.getDate() > 15) {
            newSuggestions.push({
                id: 'good-job',
                type: 'kudos',
                title: 'Excellent Pace',
                message: `You're halfway through the month but only used ${(budgetUsage * 100).toFixed(0)}% of your budget!`,
                icon: Sparkles
            })
        }

        // 5. Default "Insight First" State (Fallback if no data)
        if (newSuggestions.length === 0) {
            if (monthlyBudget === 0) {
                newSuggestions.push({
                    id: 'setup_budget',
                    type: 'analysis',
                    title: 'Smart Setup',
                    message: 'Set a monthly budget to unlock Finley\'s full potential. I can help you save ~15% more.',
                    icon: Lightbulb,
                    action: 'budget'
                })
            } else {
                newSuggestions.push({
                    id: 'default_analysis',
                    type: 'analysis',
                    title: 'All Systems Go',
                    message: 'Your spending is looking improved this week. Keep up the good momentum!',
                    icon: Sparkles
                })
            }
        }

        return newSuggestions
    }, [transactions, monthlyBudget, formatAmount])

    const activeSuggestion = suggestions[currentIndex]

    // Typewriter effect is disabled on constrained devices to avoid repaint-heavy intervals.
    useEffect(() => {
        if (!activeSuggestion) return

        if (!shouldAnimateTyping) {
            setIsThinking(false)
            setDisplayedMessage(activeSuggestion.message)
            return
        }

        let typingTimer: ReturnType<typeof setInterval> | null = null
        setIsThinking(true)
        setDisplayedMessage('')

        const thinkingTimer = setTimeout(() => {
            setIsThinking(false)
            let i = 0
            const text = activeSuggestion.message
            const speed = 24

            typingTimer = setInterval(() => {
                setDisplayedMessage(text.slice(0, i + 1))
                i += 1
                if (i >= text.length && typingTimer) {
                    clearInterval(typingTimer)
                }
            }, speed)
        }, 360)

        return () => {
            clearTimeout(thinkingTimer)
            if (typingTimer) {
                clearInterval(typingTimer)
            }
        }
    }, [activeSuggestion, shouldAnimateTyping]) // Re-run when suggestion changes

    const nextSuggestion = () => {
        // Just advance index, the Effect handles the thinking/typing
        setCurrentIndex((prev) => (prev + 1) % suggestions.length)
    }

    if (suggestions.length === 0) return null

    const Icon = activeSuggestion.icon

    return (
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.15)] h-full flex flex-col relative overflow-hidden group transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:scale-[1.01] duration-500">
            {/* Gradient Border Top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-500">
                            <Sparkles size={20} className="text-indigo-600" />
                        </div>
                        {/* Pulse Dot */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">Finley AI</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-1">
                            {isThinking ? (
                                <span className="animate-pulse">Analyzing...</span>
                            ) : (
                                <span>Insight #{currentIndex + 1}</span>
                            )}
                        </p>
                    </div>
                </div>

                {suggestions.length > 1 && (
                    <button
                        onClick={nextSuggestion}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-[100px]">
                <AnimatePresence mode='wait'>
                    {isThinking ? (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 w-full"
                        >
                            <div className="h-4 bg-gray-100 rounded-full w-3/4 shimmer" />
                            <div className="h-4 bg-gray-100 rounded-full w-full shimmer" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeSuggestion.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <div className={`p-4 rounded-2xl mb-2 flex items-start gap-4 ${activeSuggestion.type === 'warning' ? 'bg-red-50' :
                                activeSuggestion.type === 'kudos' ? 'bg-green-50' :
                                    activeSuggestion.type === 'reminder' ? 'bg-amber-50' :
                                        'bg-indigo-50'
                                }`}>
                                <div className={`p-2 rounded-lg shrink-0 ${activeSuggestion.type === 'warning' ? 'bg-white text-red-500 shadow-sm' :
                                    activeSuggestion.type === 'kudos' ? 'bg-white text-green-500 shadow-sm' :
                                        activeSuggestion.type === 'reminder' ? 'bg-white text-amber-500 shadow-sm' :
                                            'bg-white text-indigo-500 shadow-sm'
                                    }`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm mb-1 ${activeSuggestion.type === 'warning' ? 'text-red-900' :
                                        activeSuggestion.type === 'kudos' ? 'text-green-900' :
                                            activeSuggestion.type === 'reminder' ? 'text-amber-900' :
                                                'text-indigo-900'
                                        }`}>
                                        {activeSuggestion.title}
                                    </h4>
                                    <p className={`text-xs leading-relaxed font-medium ${activeSuggestion.type === 'warning' ? 'text-red-700' :
                                        activeSuggestion.type === 'kudos' ? 'text-green-700' :
                                            activeSuggestion.type === 'reminder' ? 'text-amber-700' :
                                                'text-indigo-700'
                                        }`}>
                                        {displayedMessage}
                                        {shouldAnimateTyping && <span className="animate-pulse">|</span>}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>{currentIndex + 1} / {suggestions.length} Insights</span>
                <Link href="/help" className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer">
                    Ask Finley <ArrowRight size={10} />
                </Link>
            </div>
        </div>
    )
})

export default SmartSuggestions
