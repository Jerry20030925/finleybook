'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../LanguageProvider'
import {
    XMarkIcon,
    ArrowRightIcon,
    PlusCircleIcon,
    BanknotesIcon,
    UserCircleIcon,
    ChartBarIcon,
    TrophyIcon,
    DocumentArrowUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'

interface GettingStartedGuideProps {
    hasTransactions: boolean
    hasBudget: boolean
    hasCashback: boolean
    hasProfile: boolean
    onAddTransaction: () => void
    onImportCsv: () => void
    isNewUser: boolean
}

export default function GettingStartedGuide({
    hasTransactions,
    hasBudget,
    hasCashback,
    hasProfile,
    onAddTransaction,
    onImportCsv,
    isNewUser
}: GettingStartedGuideProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(true)
    const [showCelebration, setShowCelebration] = useState(false)
    const [expandedStep, setExpandedStep] = useState<string | null>(null)

    // Load state
    useEffect(() => {
        const dismissed = localStorage.getItem('guide_dismissed')
        // Only show if it's a new user AND not dismissed
        if (dismissed || !isNewUser) {
            setIsVisible(false)
        }
    }, [isNewUser])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('guide_dismissed', 'true')
        toast('You can find this guide in Help Center anytime', {
            icon: '💡',
            duration: 4000
        })
    }

    const steps = [
        {
            id: 'transaction',
            title: 'Add First Transaction',
            desc: 'Record your first income or expense to start tracking.',
            icon: PlusCircleIcon,
            color: 'text-blue-600 bg-blue-100',
            action: onAddTransaction,
            isCompleted: hasTransactions,
            cta: 'Add Now'
        },
        {
            id: 'import',
            title: 'Import Bank Statement',
            desc: 'Bulk upload your history from CSV files.',
            icon: DocumentArrowUpIcon,
            color: 'text-indigo-600 bg-indigo-100',
            action: onImportCsv,
            isCompleted: hasTransactions, // Considered done if they have transactions, but we encourage it
            cta: 'Import CSV'
        },
        {
            id: 'budget',
            title: 'Set Monthly Budget',
            desc: 'Take control of your spending with a monthly limit.',
            icon: ChartBarIcon,
            color: 'text-purple-600 bg-purple-100',
            action: () => router.push('/budget'),
            isCompleted: hasBudget,
            cta: 'Set Budget'
        },
        {
            id: 'cashback',
            title: 'Earn Cashback',
            desc: 'Shop at partner stores to get rebates.',
            icon: BanknotesIcon,
            color: 'text-green-600 bg-green-100',
            action: () => router.push('/wealth'),
            isCompleted: hasCashback,
            cta: 'Visit Vault'
        },
        {
            id: 'profile',
            title: 'Complete Profile',
            desc: 'Set up your preferences and goals.',
            icon: UserCircleIcon,
            color: 'text-orange-600 bg-orange-100',
            action: () => router.push('/settings'),
            isCompleted: hasProfile,
            cta: 'Go to Settings'
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = (completedCount / steps.length) * 100

    // Determine current level
    let level = 'Novice'
    if (completedCount >= 2) level = 'Apprentice'
    if (completedCount >= 4) level = 'Pro'
    if (completedCount === 5) level = 'Master'

    // Find the first incomplete step (Next Best Action)
    const nextStepIndex = steps.findIndex(s => !s.isCompleted)

    // Auto-expand the next step on load
    useEffect(() => {
        if (nextStepIndex !== -1 && !expandedStep) {
            setExpandedStep(steps[nextStepIndex].id)
        }
    }, [nextStepIndex])

    // Trigger celebration on completion
    useEffect(() => {
        if (completedCount === steps.length && isVisible) {
            const hasCelebrated = localStorage.getItem('guide_celebrated')
            if (!hasCelebrated) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                setShowCelebration(true)
                localStorage.setItem('guide_celebrated', 'true')
            }
        }
    }, [completedCount, isVisible])

    if (!isVisible) return null

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-gray-900">Getting Started</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-200">
                                Level: {level}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Complete these quests to master FinleyBook</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-medium text-gray-500 mb-1">{Math.round(progress)}% Complete</div>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Vertical Quest Log */}
                <div className="p-6">
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100" />

                        <div className="space-y-6">
                            {steps.map((step, index) => {
                                const isActive = index === nextStepIndex
                                const isCompleted = step.isCompleted
                                const isExpanded = expandedStep === step.id

                                return (
                                    <div key={step.id} className="relative pl-16">
                                        {/* Status Icon */}
                                        <div
                                            className={`absolute left-2 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${isCompleted ? 'bg-green-100 border-green-200 text-green-600' :
                                                isActive ? 'bg-blue-100 border-blue-200 text-blue-600 ring-4 ring-blue-50' :
                                                    'bg-gray-50 border-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircleSolidIcon className="w-5 h-5" />
                                            ) : (
                                                <step.icon className="w-4 h-4" />
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <motion.div
                                            layout
                                            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                            className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${isExpanded
                                                ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                } ${isCompleted ? 'opacity-70' : ''}`}
                                        >
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={`font-semibold ${isCompleted ? 'text-gray-600 line-through decoration-gray-300' : 'text-gray-900'}`}>
                                                            {step.title}
                                                        </h3>
                                                        {isActive && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
                                                                Next Up
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isExpanded && (
                                                        <p className="text-sm text-gray-500 mt-0.5 truncate">{step.desc}</p>
                                                    )}
                                                </div>
                                                <ChevronDownIcon
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-gray-100 bg-gray-50/50"
                                                    >
                                                        <div className="p-4 pt-2">
                                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                                {step.desc}
                                                            </p>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    step.action()
                                                                }}
                                                                disabled={isCompleted}
                                                                className={`w-full sm:w-auto px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isCompleted
                                                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                                                    : 'bg-gray-900 text-white hover:bg-black shadow-sm'
                                                                    }`}
                                                            >
                                                                {isCompleted ? 'Completed' : step.cta}
                                                                {!isCompleted && <ArrowRightIcon className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Celebration Modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCelebration(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrophyIcon className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quest Complete!</h2>
                            <p className="text-gray-500 mb-6">
                                You've mastered the basics of FinleyBook. You're now ready to take control of your financial future!
                            </p>
                            <button
                                onClick={() => setShowCelebration(false)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                Let's Go! 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
