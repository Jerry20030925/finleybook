'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ArrowRight, Hourglass, AlertCircle, ShoppingBag } from 'lucide-react'
import { Goal } from '@/lib/dataService'
import { useCurrency } from '@/components/CurrencyProvider'

interface ImpactSimulatorProps {
    primaryGoal: Goal | null
    dailyTarget: number // We need this to calculate "Time Cost"
}

export default function ImpactSimulator({ primaryGoal, dailyTarget }: ImpactSimulatorProps) {
    const { formatAmount } = useCurrency()
    const [amount, setAmount] = useState('')
    const [showResult, setShowResult] = useState(false)

    if (!primaryGoal || dailyTarget <= 0) return null

    const numericAmount = parseFloat(amount) || 0

    // Calculate Impact
    // Logic: How many days of "Mission" does this purchases wipe out?
    const daysLost = numericAmount / dailyTarget
    const percentageOfGoal = (numericAmount / primaryGoal.targetAmount) * 100

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Calculator size={18} />
                </div>
                <h3 className="font-bold">Worth it?</h3>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <ShoppingBag size={16} />
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value)
                        setShowResult(false)
                    }}
                    placeholder="I want to spend..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                />
            </div>

            <AnimatePresence>
                {numericAmount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                                <div className="space-y-2">
                                    <p className="text-sm text-indigo-900 font-medium leading-snug">
                                        spending <span className="font-bold">{formatAmount(numericAmount)}</span> delays your dream by:
                                    </p>
                                    <div className="flex items-center gap-2 text-2xl font-black text-indigo-600">
                                        <Hourglass className="animate-pulse" size={20} />
                                        <span>{daysLost < 1 ? '< 1' : Math.round(daysLost)} days</span>
                                    </div>
                                    <p className="text-xs text-indigo-700/80">
                                        That's {percentageOfGoal.toFixed(2)}% of your goal progress.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full mt-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            onClick={() => setAmount('')}
                        >
                            Reset
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
