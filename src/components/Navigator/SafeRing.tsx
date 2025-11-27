'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface SafeRingProps {
    dailyBudget: number
    currentSpent: number
    currency?: string
}

export default function SafeRing({ dailyBudget, currentSpent, currency = '$' }: SafeRingProps) {
    const remaining = dailyBudget - currentSpent
    const percentage = Math.max(0, Math.min(100, (remaining / dailyBudget) * 100))

    // Color logic
    const getColor = () => {
        if (percentage > 50) return 'text-emerald-500 shadow-emerald-200'
        if (percentage > 20) return 'text-amber-500 shadow-amber-200'
        return 'text-rose-500 shadow-rose-200'
    }

    const getRingColor = () => {
        if (percentage > 50) return 'stroke-emerald-500'
        if (percentage > 20) return 'stroke-amber-500'
        return 'stroke-rose-500'
    }

    // Animation controls
    const controls = useAnimation()

    useEffect(() => {
        // Breathing animation
        controls.start({
            scale: [1, 1.02, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        })
    }, [controls])

    // Trigger shake on low balance or spending
    useEffect(() => {
        if (percentage < 20) {
            controls.start({
                x: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.5 }
            })
        }
    }, [currentSpent, percentage, controls])

    return (
        <div className="relative flex items-center justify-center w-72 h-72 mx-auto my-8">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                    cx="144"
                    cy="144"
                    r="130"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-100"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="144"
                    cy="144"
                    r="130"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeLinecap="round"
                    className={clsx("transition-colors duration-500", getRingColor())}
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{
                        strokeDasharray: `${(percentage / 100) * 816} 1000` // 2 * PI * 130 ≈ 816
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>

            {/* Central Content */}
            <motion.div
                animate={controls}
                className={clsx(
                    "relative z-10 flex flex-col items-center justify-center w-56 h-56 rounded-full bg-white shadow-[0_0_40px_-10px] transition-shadow duration-500",
                    getColor().split(' ')[1] // Get shadow class
                )}
            >
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
                    今日可花
                </span>
                <div className="flex items-baseline">
                    <span className={clsx("text-4xl font-bold transition-colors duration-300", getColor().split(' ')[0])}>
                        {currency}
                    </span>
                    <motion.span
                        key={remaining} // Trigger animation on change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx("text-5xl font-bold ml-1 transition-colors duration-300", getColor().split(' ')[0])}
                    >
                        {remaining.toFixed(2)}
                    </motion.span>
                </div>
                <span className="text-xs text-gray-400 mt-2">
                    预算: {currency}{dailyBudget}
                </span>
            </motion.div>
        </div>
    )
}
