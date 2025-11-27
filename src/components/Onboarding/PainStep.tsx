'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface PainStepProps {
    onNext: (amount: number) => void
}

export default function PainStep({ onNext }: PainStepProps) {
    const [amount, setAmount] = useState(50)
    const annualLoss = amount * 12

    // Color shift based on amount
    const getIntensity = () => {
        const percentage = (amount - 50) / (500 - 50)
        return percentage // 0 to 1
    }

    return (
        <div className="text-center">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-gray-900 mb-2"
            >
                说实话...
            </motion.h2>
            <p className="text-gray-600 mb-8">你觉得每个月有多少钱是“不知道花哪去了”？</p>

            <div className="mb-12 relative">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                    ${amount}
                </div>
                <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>$50 (小意思)</span>
                    <span>$500+ (救命!)</span>
                </div>
            </div>

            <motion.div
                className="bg-gray-50 p-6 rounded-2xl mb-8"
                animate={{
                    backgroundColor: `rgba(255, ${200 - getIntensity() * 100}, ${200 - getIntensity() * 100}, 0.5)`
                }}
            >
                <p className="text-sm text-gray-600 mb-1">这相当于你每年扔掉了</p>
                <motion.div
                    key={annualLoss}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-gray-900"
                >
                    ${annualLoss.toLocaleString()}
                </motion.div>
            </motion.div>

            <button
                onClick={() => onNext(amount)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                下一步
            </button>
        </div>
    )
}
