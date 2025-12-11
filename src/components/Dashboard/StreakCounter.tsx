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
            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm hover:shadow-md transition-all cursor-pointer group ${isActive ? 'bg-white border-orange-100' : 'bg-gray-50 border-gray-200'}`}
        >
            <div className="relative">
                <motion.div
                    animate={isActive ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    } : { opacity: 0 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-orange-400 rounded-full blur-md"
                />
                <Flame
                    size={20}
                    className={`relative z-10 transition-colors ${isActive ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`}
                />
            </div>

            <div className="flex flex-col leading-none">
                <span className={`text-sm font-black transition-colors ${isActive ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-500'}`}>
                    {streak} Day Streak
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                    {isActive ? 'Keep it burning!' : 'Ignite it again!'}
                </span>
            </div>
        </motion.div>
    )
}
