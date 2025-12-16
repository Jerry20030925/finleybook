'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Coffee, ShoppingBag, Car, Wallet, AlertTriangle, Lightbulb, Pizza } from 'lucide-react'
import { Transaction } from '@/lib/dataService'
import { useCurrency } from '../CurrencyProvider'
import Link from 'next/link'

interface SmartSuggestionsProps {
    transactions: Transaction[]
    monthlyBudget: number
}

interface Suggestion {
    id: string
    type: 'saving' | 'warning' | 'kudos' | 'analysis'
    title: string
    message: string
    icon: any
    action?: string
}

export default function SmartSuggestions({ transactions, monthlyBudget }: SmartSuggestionsProps) {
    const { formatAmount } = useCurrency()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const newSuggestions: Suggestion[] = []
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

        // 3. Positive Reinforcement (Kudos)
        if (monthlyBudget > 0 && budgetUsage < 0.5 && today.getDate() > 15) {
            newSuggestions.push({
                id: 'good-job',
                type: 'kudos',
                title: 'Excellent Pace',
                message: `You're halfway through the month but only used ${(budgetUsage * 100).toFixed(0)}% of your budget!`,
                icon: Sparkles
            })
        }

        // 4. Subscription / Recurring (Mock Logic for now, could be real later)
        if (transactions.some(t => t.description.toLowerCase().includes('netflix') || t.description.toLowerCase().includes('spotify'))) {
            newSuggestions.push({
                id: 'subscription_check',
                type: 'saving',
                title: 'Subscription Audit',
                message: 'Detected recurring charges. Are you still using all your subscriptions?',
                icon: Wallet
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

        setSuggestions(newSuggestions)
    }, [transactions, monthlyBudget, formatAmount])

    const nextSuggestion = () => {
        setCurrentIndex((prev) => (prev + 1) % suggestions.length)
    }

    if (suggestions.length === 0) return null

    const activeSuggestion = suggestions[currentIndex]
    const Icon = activeSuggestion.icon

    return (
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.15)] h-full flex flex-col relative overflow-hidden group transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            {/* Gradient Border Top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} className="text-indigo-600" />
                        </div>
                        {/* Pulse Dot */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">Finley AI</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-1 animate-pulse">Analyzing spend pattern...</p>
                    </div>
                </div>

                {suggestions.length > 1 && (
                    <button onClick={nextSuggestion} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeSuggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col justify-center"
                >
                    <div className={`p-4 rounded-2xl mb-3 flex items-start gap-4 ${activeSuggestion.type === 'warning' ? 'bg-red-50' :
                        activeSuggestion.type === 'kudos' ? 'bg-green-50' :
                            'bg-indigo-50'
                        }`}>
                        <div className={`p-2 rounded-lg shrink-0 ${activeSuggestion.type === 'warning' ? 'bg-white text-red-500 shadow-sm' :
                            activeSuggestion.type === 'kudos' ? 'bg-white text-green-500 shadow-sm' :
                                'bg-white text-indigo-500 shadow-sm'
                            }`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm mb-1 ${activeSuggestion.type === 'warning' ? 'text-red-900' :
                                activeSuggestion.type === 'kudos' ? 'text-green-900' :
                                    'text-indigo-900'
                                }`}>
                                {activeSuggestion.title}
                            </h4>
                            <p className={`text-xs leading-relaxed ${activeSuggestion.type === 'warning' ? 'text-red-700' :
                                activeSuggestion.type === 'kudos' ? 'text-green-700' :
                                    'text-indigo-700'
                                }`}>
                                {activeSuggestion.message.split(" ").map((word, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 + 0.2 }}
                                    >
                                        {word}{" "}
                                    </motion.span>
                                ))}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span>{currentIndex + 1} / {suggestions.length} Insights</span>
                <Link href="/help" className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer">
                    Ask Finley <ArrowRight size={10} />
                </Link>
            </div>
        </div>
    )
}

