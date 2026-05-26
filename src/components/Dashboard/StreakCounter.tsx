'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, Share2 } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { getLastSevenDays, STREAK_MILESTONES } from '@/lib/streakService'

interface StreakCounterProps {
    streak?: number
    isActive?: boolean
    longestStreak?: number
    milestones?: number[]
    activeDays?: string[]
    onShare?: () => void
}

const MILESTONE_LABELS: Record<number, { emoji: string; label: string }> = {
    7: { emoji: '🌟', label: '1 Week' },
    30: { emoji: '💎', label: '1 Month' },
    100: { emoji: '🏆', label: '100 Days' },
    365: { emoji: '👑', label: '1 Year' },
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StreakCounter({
    streak = 0,
    isActive = true,
    longestStreak = 0,
    milestones = [],
    activeDays = [],
    onShare,
}: StreakCounterProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const last7Days = useMemo(() => getLastSevenDays(), [])

    // Map last 7 days to their day-of-week labels
    const weekCalendar = useMemo(() => {
        return last7Days.map((dateStr) => {
            const parts = dateStr.split('-').map(Number)
            const d = new Date(parts[0], parts[1] - 1, parts[2])
            const dayIndex = (d.getDay() + 6) % 7 // Mon=0
            return {
                dateStr,
                label: DAY_NAMES[dayIndex],
                isActive: activeDays.includes(dateStr),
                isToday: dateStr === last7Days[last7Days.length - 1],
            }
        })
    }, [last7Days, activeDays])

    // Next milestone
    const nextMilestone = useMemo(() => {
        return STREAK_MILESTONES.find(m => streak < m) || null
    }, [streak])

    const progressToNext = useMemo(() => {
        if (!nextMilestone) return 100
        const prevMilestone = STREAK_MILESTONES[STREAK_MILESTONES.indexOf(nextMilestone) - 1] || 0
        return Math.min(100, ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    }, [streak, nextMilestone])

    if (!mounted) return null

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Main streak display */}
            <div className={`
                flex items-center gap-3 px-4 py-3 transition-all
                ${isActive
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50'
                    : 'bg-gray-50'
                }
            `}>
                <div className="relative flex items-center justify-center w-10 h-10">
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

                    <motion.div
                        animate={isActive ? {
                            y: [0, -3, 0],
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative"
                    >
                        <Flame
                            className={`relative z-10 w-6 h-6 transition-colors ${isActive
                                ? 'text-orange-500 fill-orange-500'
                                : 'text-gray-400'
                                }`}
                        />
                    </motion.div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-lg font-black transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {streak}
                        </span>
                        <span className={`text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                            {streak === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>
                    <span className={`text-[10px] font-medium block ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                        {isActive ? (streak >= 7 ? '🔥 On fire!' : 'Keep burning!') : 'Ignite it!'}
                    </span>
                </div>

                {longestStreak > 0 && (
                    <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Best</span>
                        <span className="text-sm font-bold text-gray-600">{longestStreak}d</span>
                    </div>
                )}

                {onShare && (
                    <button
                        onClick={onShare}
                        className="p-2 rounded-lg hover:bg-orange-100 active:bg-orange-200 transition-colors"
                    >
                        <Share2 className="w-4 h-4 text-orange-500" />
                    </button>
                )}
            </div>

            {/* Weekly calendar */}
            <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between gap-1">
                    {weekCalendar.map(({ dateStr, label, isActive: dayActive, isToday }) => (
                        <div key={dateStr} className="flex flex-col items-center gap-1 flex-1">
                            <span className={`text-[9px] font-medium ${isToday ? 'text-orange-600' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                    ${dayActive
                                        ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-200'
                                        : isToday
                                            ? 'border-2 border-dashed border-orange-300 text-orange-400'
                                            : 'bg-gray-100 text-gray-300'
                                    }
                                `}
                            >
                                {dayActive ? '✓' : isToday ? '?' : '·'}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Milestone progress */}
            {nextMilestone && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-gray-500">
                            Next: {MILESTONE_LABELS[nextMilestone]?.emoji} {MILESTONE_LABELS[nextMilestone]?.label}
                        </span>
                        <span className="text-[10px] font-bold text-gray-600">
                            {streak}/{nextMilestone}
                        </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNext}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                        />
                    </div>
                </div>
            )}

            {/* Earned milestones */}
            {milestones.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    {milestones.map((m) => (
                        <span
                            key={m}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700"
                        >
                            {MILESTONE_LABELS[m]?.emoji} {MILESTONE_LABELS[m]?.label}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
