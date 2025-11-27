'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface TimeMachineProps {
    currentSavings: number
    monthlySavings: number
}

export default function TimeMachine({ currentSavings, monthlySavings }: TimeMachineProps) {
    const [months, setMonths] = useState(0)

    const projectedAmount = currentSavings + (monthlySavings * months)
    const isPositive = monthlySavings > 0

    // Background logic based on wealth
    const getBackgroundClass = () => {
        if (months === 0) return 'bg-gray-50'
        if (!isPositive) return 'bg-gray-900' // Desolate
        if (projectedAmount > 10000) return 'bg-gradient-to-b from-sky-200 to-blue-100' // Luxury
        return 'bg-gradient-to-b from-green-50 to-emerald-100' // Good
    }

    return (
        <div className={clsx("p-6 rounded-2xl transition-colors duration-1000", getBackgroundClass())}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">时光机 ⏳</h3>
                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                    {months === 0 ? '现在' : `${months} 个月后`}
                </span>
            </div>

            <div className="text-center mb-8">
                <p className="text-sm text-gray-500 mb-1">预计资产</p>
                <motion.div
                    key={projectedAmount}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={clsx(
                        "text-4xl font-bold",
                        !isPositive && months > 0 ? "text-red-500" : "text-gray-900"
                    )}
                >
                    ${projectedAmount.toLocaleString()}
                </motion.div>
            </div>

            <div className="relative h-12 flex items-center justify-center">
                <input
                    type="range"
                    min="0"
                    max="60" // 5 years
                    step="1"
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 z-10 relative"
                />
                {/* Ticks */}
                <div className="absolute w-full flex justify-between px-1 pointer-events-none opacity-30 text-[10px]">
                    <span>Now</span>
                    <span>1Y</span>
                    <span>2Y</span>
                    <span>3Y</span>
                    <span>4Y</span>
                    <span>5Y</span>
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4 h-4">
                {months > 0 && (
                    isPositive
                        ? "坚持现在的习惯，你可以买辆车了！🚗"
                        : "警告：照这样下去，你会破产的。📉"
                )}
            </p>
        </div>
    )
}
