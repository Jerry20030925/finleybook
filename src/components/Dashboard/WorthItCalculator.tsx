'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calculator, X, TrendingDown } from 'lucide-react'

interface WorthItCalculatorProps {
    hourlyWage: number
    onSetWage: () => void
}

export default function WorthItCalculator({ hourlyWage, onSetWage }: WorthItCalculatorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [itemPrice, setItemPrice] = useState('')
    const [result, setResult] = useState<{
        hours: number
        days: number
        suggestion: string
    } | null>(null)

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

            setResult({ hours, days, suggestion })
        }
    }

    return (
        <>
            {/* Floating button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Calculator size={24} />
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
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md z-50"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Worth It?</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Convert price to work hours
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
                            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Your hourly wage:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-indigo-600">
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
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Item Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
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
                                        className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Calculate button */}
                            <button
                                onClick={calculate}
                                disabled={!itemPrice || parseFloat(itemPrice) <= 0}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
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
                                        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200"
                                    >
                                        <div className="text-center mb-4">
                                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                                {result.hours.toFixed(1)} hours
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                = {result.days.toFixed(1)} work days
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 bg-white/50 rounded-lg p-4">
                                            <TrendingDown className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {result.suggestion}
                                            </p>
                                        </div>

                                        {result.hours > 8 && (
                                            <div className="mt-4 text-center">
                                                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline">
                                                    Find cheaper alternatives →
                                                </button>
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
