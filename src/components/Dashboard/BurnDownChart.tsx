'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'

interface BurnDownChartProps {
    monthlyBudget: number
    spent: number
    onSetBudget: () => void
}

export default function BurnDownChart({ monthlyBudget, spent, onSetBudget }: BurnDownChartProps) {
    const remaining = monthlyBudget - spent
    const percentage = monthlyBudget > 0 ? (remaining / monthlyBudget) * 100 : 0

    // Color psychology based on remaining percentage
    const getColor = () => {
        if (percentage > 60) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' } // Green
        if (percentage > 30) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' } // Yellow
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' } // Red
    }

    const color = getColor()
    const circumference = 2 * Math.PI * 90 // radius = 90
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative">
            {/* Settings button */}
            <button
                onClick={onSetBudget}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
            >
                <Settings size={20} className="text-gray-600" />
            </button>

            {/* Main circle */}
            <div className="flex items-center justify-center p-8">
                <div className="relative">
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 rounded-full blur-2xl opacity-50"
                        style={{ backgroundColor: color.glow }}
                    />

                    {/* SVG Circle */}
                    <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                        />

                        {/* Progress circle */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={color.stroke}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />

                        {/* Tick marks */}
                        {[...Array(12)].map((_, i) => {
                            const angle = (i * 30 * Math.PI) / 180
                            const x1 = 100 + 85 * Math.cos(angle)
                            const y1 = 100 + 85 * Math.sin(angle)
                            const x2 = 100 + 90 * Math.cos(angle)
                            const y2 = 100 + 90 * Math.sin(angle)

                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    opacity="0.3"
                                />
                            )
                        })}
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="text-center"
                        >
                            <div className="text-sm text-gray-500 mb-1">Monthly Budget</div>
                            <div className="text-4xl font-bold" style={{ color: color.stroke }}>
                                ${remaining.toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">remaining</div>
                            <div className="text-xs text-gray-400 mt-2">
                                ${spent.toFixed(0)} spent
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Status message */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center mt-4"
            >
                {percentage > 60 && (
                    <p className="text-green-600 font-medium">
                        💚 You're doing great! Budget is healthy.
                    </p>
                )}
                {percentage > 30 && percentage <= 60 && (
                    <p className="text-yellow-600 font-medium">
                        ⚠️ Be mindful of your spending.
                    </p>
                )}
                {percentage <= 30 && (
                    <p className="text-red-600 font-medium">
                        🚨 Budget alert! Consider cutting back.
                    </p>
                )}
            </motion.div>
        </div>
    )
}
