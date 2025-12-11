'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Trophy, TrendingUp, Wallet, ArrowRight } from 'lucide-react'
import { useCurrency } from '@/components/CurrencyProvider'
import { Goal, Transaction } from '@/lib/dataService'
import { useState, useEffect } from 'react'

import ShareChallengeModal from './ShareChallengeModal'

interface DailyMissionCardProps {
    dailyTarget: number
    todayTransactions: Transaction[]
    monthlyBudget: number
    currency: string
}

export default function DailyMissionCard({ dailyTarget, todayTransactions, monthlyBudget, currency }: DailyMissionCardProps) {
    const { formatAmount } = useCurrency()
    const [showShareModal, setShowShareModal] = useState(false)

    // 1. Calculate Earnings (Direct Income/Cashback)
    const todayEarned = todayTransactions
        .filter(t => t.type === 'income' || t.type === 'cashback')
        .reduce((sum, t) => sum + t.amount, 0)

    // 2. Calculate Savings (Budget Surplus)
    // Simplified: Daily Budget = Monthly / 30
    const dailyBudget = monthlyBudget > 0 ? monthlyBudget / 30 : 50 // Default $50/day if no budget
    const todaySpent = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const todaySaved = Math.max(0, dailyBudget - todaySpent)

    const totalContribution = todayEarned + todaySaved
    const progress = Math.min(100, Math.round((totalContribution / dailyTarget) * 100))
    const isComplete = totalContribution >= dailyTarget

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                <Trophy size={16} />
                            </div>
                            <h3 className="font-bold text-gray-900">Daily Mission</h3>
                        </div>
                        <p className="text-xs text-gray-500">Hit your target to secure your dream.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-600">
                            {formatAmount(totalContribution)}
                        </div>
                        <div className="text-xs font-medium text-gray-400">
                            / {formatAmount(dailyTarget)}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:4px_4px]"></div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full relative ${isComplete
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}
                        >
                            {isComplete && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-white/20 animate-pulse"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Earning Card */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2 text-emerald-700">
                            <TrendingUp size={14} />
                            <span className="text-xs font-bold uppercase">Earned</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatAmount(todayEarned)}
                        </div>
                        <p className="text-[10px] text-emerald-600 font-medium">
                            Side hustles & cashback
                        </p>
                    </div>

                    {/* Saving Card */}
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-700">
                            <Wallet size={14} />
                            <span className="text-xs font-bold uppercase">Saved</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatAmount(todaySaved)}
                        </div>
                        <p className="text-[10px] text-blue-600 font-medium">
                            Budget: {formatAmount(Math.max(0, dailyBudget - todaySpent))} left
                        </p>
                    </div>
                </div>

                {isComplete ? (
                    <motion.button
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setShowShareModal(true)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            🎉
                        </motion.div>
                        Claim Victory & Share
                    </motion.button>
                ) : (
                    <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors group">
                        Find Ways to Earn
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </motion.div>

            <ShareChallengeModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                dailyTarget={dailyTarget}
                achieved={totalContribution}
            />
        </>
    )
}
