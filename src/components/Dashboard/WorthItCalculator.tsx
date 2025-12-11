'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calculator, X, TrendingDown, Target } from 'lucide-react'
import { useAuth } from '../AuthProvider'
import { getGoals, Goal } from '@/lib/dataService'

interface WorthItCalculatorProps {
    hourlyWage: number
    onSetWage: () => void
}

export default function WorthItCalculator({ hourlyWage, onSetWage }: WorthItCalculatorProps) {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [itemPrice, setItemPrice] = useState('')
    const [goals, setGoals] = useState<Goal[]>([])
    const [result, setResult] = useState<{
        hours: number
        days: number
        suggestion: string
        goalImpact?: { title: string, percent: number }
    } | null>(null)

    useEffect(() => {
        if (user && isOpen) {
            getGoals(user.uid).then(setGoals)
        }
    }, [user, isOpen])

    const calculate = () => {
        const price = parseFloat(itemPrice)
        if (price > 0 && hourlyWage > 0) {
            const hours = price / hourlyWage
            const days = hours / 8 // Assuming 8-hour workday

            let suggestion = ''
            if (hours < 1) {
                suggestion = "Quick purchase! Less than an hour of work."
            } else if (hours < 8) {
                suggestion = `Consider if it's worth ${hours.toFixed(1)} hours of your life.`
            } else if (hours < 40) {
                suggestion = `That's ${days.toFixed(1)} days of work. Think twice!`
            } else {
                suggestion = `⚠️ This costs ${days.toFixed(0)} days of work. Look for alternatives!`
            }

            // Calculate impact on top goal
            let goalImpact
            const topGoal = goals.find(g => !g.isCompleted)
            if (topGoal) {
                const percent = (price / topGoal.targetAmount) * 100
                goalImpact = { title: topGoal.title, percent }
            }

            setResult({ hours, days, suggestion, goalImpact })
        }
    }

    return (
        <>
            {/* Floating button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Calculator size={20} className="sm:w-6 sm:h-6" />
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-md mx-4 z-50 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Worth It?</h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        Convert price to work hours & goal impact
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Hourly wage display */}
                            <div className="bg-indigo-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-600">Your hourly wage:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm sm:text-lg font-bold text-indigo-600">
                                            ${hourlyWage.toFixed(2)}/hr
                                        </span>
                                        <button
                                            onClick={onSetWage}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-lg">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        value={itemPrice}
                                        onChange={(e) => {
                                            setItemPrice(e.target.value)
                                            setResult(null)
                                        }}
                                        placeholder="0.00"
                                        className="w-full pl-6 sm:pl-8 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base sm:text-lg"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Calculate button */}
                            <button
                                onClick={calculate}
                                disabled={!itemPrice || parseFloat(itemPrice) <= 0}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 sm:mb-6 text-sm sm:text-base"
                            >
                                Calculate
                            </button>

                            {/* Result */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200">
                                            <div className="text-center mb-3 sm:mb-4">
                                                <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-2">
                                                    {result.hours.toFixed(1)} hours
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    = {result.days.toFixed(1)} work days
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 bg-white/50 rounded-lg p-3 sm:p-4">
                                                <TrendingDown className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
                                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                                    {result.suggestion}
                                                </p>
                                            </div>
                                        </div>

                                        {result.goalImpact && (
                                            <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="text-amber-600" size={20} />
                                                    <h3 className="font-bold text-amber-900">Goal Impact</h3>
                                                </div>
                                                <p className="text-sm text-amber-800">
                                                    This purchase would cost you <span className="font-bold">{result.goalImpact.percent.toFixed(1)}%</span> of your <span className="font-bold">{result.goalImpact.title}</span> goal.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

