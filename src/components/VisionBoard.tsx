'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getGoals, Goal, updateGoal } from '@/lib/dataService'
import { useAuth } from './AuthProvider'
import { useCurrency } from './CurrencyProvider'
import confetti from 'canvas-confetti'
import { Target, TrendingUp, Sparkles, Lock, Trophy, Star, Image as ImageIcon, X, Check } from 'lucide-react'
import CountUp from 'react-countup'
import { useSubscription } from './SubscriptionProvider'
import ProUpgradeModal from './ProUpgradeModal'

interface VisionBoardProps {
    primaryGoal: Goal | null
    compact?: boolean
}

export default function VisionBoard({ primaryGoal, compact = false }: VisionBoardProps) {
    const { user } = useAuth()
    const { formatAmount } = useCurrency()
    const { isProMember } = useSubscription()
    const [isEditingBg, setIsEditingBg] = useState(false)
    const [bgInput, setBgInput] = useState('')
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    // Moved up hooks
    const percentage = primaryGoal ? Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)) : 0

    // Confetti Celebration
    useEffect(() => {
        if (percentage === 100 && primaryGoal) {
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
            }, 250)
        }
    }, [percentage, primaryGoal])

    // Hydration Safe Calculation
    const [displayData, setDisplayData] = useState({
        daysLeft: 1,
        dailyTarget: 0,
        deadlineStr: ''
    })

    useEffect(() => {
        if (!primaryGoal) return
        const today = new Date()
        const deadlineDate = primaryGoal.deadline ? new Date(primaryGoal.deadline) : new Date(today.getFullYear() + 1, 0, 1)
        const diffTime = Math.abs(deadlineDate.getTime() - today.getTime())
        const daysLeftVal = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
        const remainingVal = primaryGoal.targetAmount - primaryGoal.currentAmount
        setDisplayData({
            daysLeft: daysLeftVal,
            dailyTarget: remainingVal / daysLeftVal,
            deadlineStr: deadlineDate.toLocaleDateString()
        })
    }, [primaryGoal])

    const handleUpdateBg = async () => {
        if (!primaryGoal || !bgInput) return
        try {
            await updateGoal(primaryGoal.id!, { image_url: bgInput })
            setIsEditingBg(false)
            window.location.reload()
        } catch (e) {
            console.error('Failed to update background', e)
        }
    }

    if (!primaryGoal) return null

    const remaining = primaryGoal.targetAmount - primaryGoal.currentAmount
    const { daysLeft, dailyTarget, deadlineStr } = displayData

    // Visual Feedback Logic
    const blurAmount = Math.max(0, 10 * (1 - percentage / 100))
    const grayscaleAmount = Math.max(0, 100 - percentage)

    // Gamification Logic
    const milestones = [
        { percent: 25, label: 'Bronze', color: 'bg-orange-400', text: 'text-orange-400' },
        { percent: 50, label: 'Silver', color: 'bg-gray-300', text: 'text-gray-300' },
        { percent: 75, label: 'Gold', color: 'bg-yellow-400', text: 'text-yellow-400' },
        { percent: 100, label: 'Diamond', color: 'bg-cyan-400', text: 'text-cyan-400' }
    ]

    const nextMilestone = milestones.find(m => m.percent > percentage) || milestones[milestones.length - 1]
    const amountToNext = (primaryGoal.targetAmount * (nextMilestone.percent / 100)) - primaryGoal.currentAmount
    const displayNext = percentage < 100

    // Default beautiful background if no user image
    const bgImage = primaryGoal.image_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"

    // Compact Mode (Sidebar Widget)
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg group"
            >
                {/* Background Accent */}
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity group-hover:opacity-30"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-indigo-300">
                            <Target size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Vision Board</span>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{daysLeft} days left</span>
                    </div>

                    <h3 className="text-xl font-bold mb-4 truncate pr-4">{primaryGoal.title}</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-300">
                            <span>{formatAmount(primaryGoal.currentAmount)}</span>
                            <span className="text-emerald-400 font-bold">{percentage}%</span>
                            <span>{formatAmount(primaryGoal.targetAmount)}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 relative"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1 }}
                            >
                                <div className="absolute inset-0 bg-[length:10px_10px] animate-shimmer opacity-30"
                                    style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2) 50%,rgba(255,255,255,0.2) 75%,transparent 75%,transparent)' }}
                                />
                            </motion.div>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] text-indigo-300">
                                Daily Target: {formatAmount(dailyTarget)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gray-900 text-white rounded-3xl shadow-xl min-h-[14rem] h-auto group flex flex-col"
        >
            {/* Dynamic Background Image */}
            <div
                className="absolute inset-0 z-0 transition-all duration-1000 ease-out bg-cover bg-center"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    filter: `blur(${blurAmount}px) grayscale(${grayscaleAmount}%) contrast(1.1) brightness(0.6)`
                }}
            />

            {/* Custom Background Control */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditingBg ? (
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1 rounded-lg border border-white/20">
                        <input
                            type="text"
                            placeholder="Image URL..."
                            className="bg-transparent border-none text-xs text-white placeholder-gray-400 focus:ring-0 w-32"
                            value={bgInput}
                            onChange={(e) => setBgInput(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button onClick={(e) => { e.stopPropagation(); handleUpdateBg(); }} className="p-1 hover:text-green-400"><Check size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setIsEditingBg(false); }} className="p-1 hover:text-red-400"><X size={14} /></button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isProMember) {
                                setShowUpgradeModal(true);
                                return;
                            }
                            setIsEditingBg(true);
                            setBgInput(primaryGoal.image_url || '');
                        }}
                        className="p-2 bg-black/30 text-white/50 hover:text-white rounded-full backdrop-blur-sm hover:bg-black/50 transition-all"
                        title="Change Background"
                    >
                        <ImageIcon size={16} />
                    </button>
                )}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
                {/* Top Section: Title & Progress */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 border border-white/10">
                            <Sparkles size={12} />
                            <span>Vision Board</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg">
                            {primaryGoal.title}
                        </h2>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-5xl font-black text-indigo-400 drop-shadow-lg">
                            <CountUp end={percentage} duration={2} suffix="%" />
                        </div>
                        {displayNext ? (
                            <div className="text-xs uppercase tracking-widest opacity-80 flex items-center justify-end gap-1">
                                <Lock size={10} />
                                {formatAmount(amountToNext)} to {nextMilestone.label}
                            </div>
                        ) : (
                            <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-end gap-1">
                                <Trophy size={12} />
                                Dream Unlocked!
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: The Breakdown */}
                <div className="flex flex-col md:flex-row gap-6 items-end mt-auto">
                    {/* Main Progress Bar (The Path) */}
                    <div className="flex-1 w-full bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative">
                        {/* Milestone Markers */}
                        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 flex justify-between px-[1%] pointer-events-none z-10 opacity-30">
                            {milestones.slice(0, 3).map((m) => (
                                <div key={m.percent} className="flex flex-col items-center" style={{ left: `${m.percent}%` }}>
                                    <div className={`w-1 h-3 ${m.color} mb-1 rounded-full`}></div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between text-sm mb-2 font-medium text-gray-300 relative z-20">
                            <span>Saved: <span className="text-white">
                                <CountUp
                                    end={primaryGoal.currentAmount}
                                    duration={1.5}
                                    separator=","
                                    decimals={2}
                                    prefix={formatAmount(0).replace('0.00', '')} // Hack to get symbol
                                />
                            </span></span>
                            <span className={`${displayNext ? nextMilestone.text : 'text-emerald-400'} font-bold flex items-center gap-1`}>
                                {displayNext ? (
                                    <>Next: {nextMilestone.label}</>
                                ) : (
                                    <>Completed!</>
                                )}
                            </span>
                        </div>

                        <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-shimmer"></div>
                            </motion.div>
                        </div>
                    </div>

                    {/* The Daily Grind Card (The Engine) */}
                    <div className="w-full md:w-72 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors cursor-pointer shadow-lg">
                        <div className="flex items-center gap-2 text-indigo-300 mb-1">
                            <Target size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Today's Mission</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                <CountUp
                                    end={dailyTarget}
                                    duration={2}
                                    decimals={2}
                                    prefix={formatAmount(0).replace('0.00', '')}
                                />
                            </span>
                            <span className="text-xs text-gray-300">/ day</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            To hit your goal by <span className="text-white font-medium">{deadlineStr}</span> ({daysLeft} days left).
                        </p>
                    </div>
                </div>
            </div>
            {/* Upgrade Modal */}
            <ProUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName="Custom Backgrounds"
            />
        </motion.div>
    )
}
