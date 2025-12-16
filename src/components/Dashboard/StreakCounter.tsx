'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StreakCounterProps {
    streak?: number
    isActive?: boolean
}

export default function StreakCounter({ streak = 0, isActive = true }: StreakCounterProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm transition-all cursor-pointer group select-none
                ${isActive
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-orange-100'
                    : 'bg-gray-50 border-gray-200'
                }
            `}
        >
            <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                {/* Glow Effect */}
                {isActive && (
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-orange-500 rounded-full blur-lg"
                    />
                )}

                {/* Flame Icon */}
                <motion.div
                    animate={isActive ? {
                        y: [0, -2, 0],
                        scale: [1, 1.05, 1]
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Flame
                        className={`relative z-10 w-5 h-5 md:w-6 md:h-6 transition-colors ${isActive
                                ? 'text-orange-500 fill-orange-500 drop-shadow-sm'
                                : 'text-gray-400'
                            }`}
                    />
                </motion.div>
            </div>

            <div className="flex flex-col leading-tight">
                <span className={`text-xs md:text-sm font-black transition-colors ${isActive ? 'text-gray-900 group-hover:text-orange-700' : 'text-gray-500'
                    }`}>
                    {streak} {streak === 1 ? 'Day' : 'Days'}
                </span>
                <span className={`text-[10px] md:text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                    {isActive ? 'Keep burning!' : 'Ignite it!'}
                </span>
            </div>
        </motion.div>
    )
}
