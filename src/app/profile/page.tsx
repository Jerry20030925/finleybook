'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    UserCircleIcon,
    ShieldCheckIcon,
    WalletIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    SparklesIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    DocumentTextIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    ClipboardDocumentIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import SubscriptionStatus from '@/components/SubscriptionStatus'
import { useCurrency } from '@/components/CurrencyProvider'
import { useSubscription } from '@/components/SubscriptionProvider'
import AIChatInput from '@/components/AIChatInput'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

type RecommendedAction = {
    id: string
    title: string
    description: string
    cta: string
    prompt: string
    priority: 'high' | 'medium' | 'low'
    href?: string
}

type ExperienceState = {
    assistantAutopilot: boolean
    beginnerMode: boolean
    reduceMotion: boolean
    weeklyDigestDay: 'monday' | 'friday' | 'sunday'
    aiTone: 'coach' | 'concise' | 'analyst'
}

const defaultExperienceState: ExperienceState = {
    assistantAutopilot: true,
    beginnerMode: true,
    reduceMotion: false,
    weeklyDigestDay: 'friday',
    aiTone: 'coach',
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
}

export default function ProfilePage() {
    const { user, loading, logout } = useAuth()
    const { isProMember } = useSubscription()
    const { formatAmount } = useCurrency()
    const router = useRouter()

    const [financialStats, setFinancialStats] = useState({ totalAssets: 0, transactionCount: 0 })
    const [walletBalance, setWalletBalance] = useState({ available: 0, pending: 0, lifetime: 0 })
    const [referralStats, setReferralStats] = useState({ totalReferrals: 0, currentLevel: 0, referralCode: '' })
    const [experienceState, setExperienceState] = useState<ExperienceState>(defaultExperienceState)

    const [isAiOpen, setIsAiOpen] = useState(false)
    const [aiPrefill, setAiPrefill] = useState('')
    const [aiPrefillKey, setAiPrefillKey] = useState(0)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        if (!user) return

        const fetchData = async () => {
            try {
                const [finStats, walletData, refStats] = await Promise.all([
                    import('@/lib/dataService').then((mod) => mod.getUserFinancialSummary(user.uid)),
                    import('@/lib/dataService').then((mod) => mod.getUserWalletBalance(user.uid)),
                    import('@/lib/referralService').then((mod) => mod.getReferralStats(user.uid)),
                ])
                setFinancialStats(finStats)
                setWalletBalance(walletData)
                if (refStats) setReferralStats(refStats)
            } catch (error) {
                console.error('Error fetching profile data:', error)
            }
        }

        fetchData()
    }, [user, loading, router])

    useEffect(() => {
        let cancelled = false

        const loadExperienceState = async () => {
            if (!user?.uid || !db) return
            try {
                const snap = await getDoc(doc(db, 'users', user.uid))
                if (!snap.exists() || cancelled) return
                const data = snap.data()
                setExperienceState({
                    ...defaultExperienceState,
                    ...(data.experiencePreferences || {})
                } as ExperienceState)
            } catch (error) {
                console.error('Error loading profile experience state:', error)
            }
        }

        void loadExperienceState()
        return () => {
            cancelled = true
        }
    }, [user?.uid])

    const openAiWithPrompt = (prompt: string) => {
        setAiPrefill(prompt)
        setAiPrefillKey((prev) => prev + 1)
        setIsAiOpen(true)
    }

    const recommendedActions = useMemo<RecommendedAction[]>(() => {
        const actions: RecommendedAction[] = []

        if (financialStats.transactionCount <= 2) {
            actions.push({
                id: 'first-ledger',
                title: 'Start your bookkeeping workflow',
                description: 'Record 3 daily expenses this week and Finley AI will auto-categorize your pattern.',
                cta: 'AI walkthrough',
                prompt: 'I am new. Teach me step by step how to record expenses correctly in FinleyBook.',
                priority: 'high',
                href: '/transactions',
            })
        } else {
            actions.push({
                id: 'weekly-review',
                title: 'Run a weekly money review',
                description: 'Use this week\'s transactions to identify one cut and one optimization opportunity.',
                cta: 'Generate review plan',
                prompt: 'Based on my recent records, give me a weekly money review checklist and what to improve first.',
                priority: 'high',
                href: '/reports',
            })
        }

        if (walletBalance.available <= 0) {
            actions.push({
                id: 'cashflow',
                title: 'Stabilize monthly cash flow',
                description: 'Set spending caps in Budget and a transfer target in Goals to reduce volatility.',
                cta: 'Build my plan',
                prompt: 'Create a simple monthly cash flow plan with budget caps and one savings transfer target.',
                priority: 'medium',
                href: '/budget',
            })
        } else {
            actions.push({
                id: 'reinvest',
                title: 'Allocate idle balance intentionally',
                description: 'Define what portion stays liquid vs. moves to your next goal each pay cycle.',
                cta: 'Draft allocation rule',
                prompt: 'Help me split my available balance into emergency fund, bills, and goals with percentages.',
                priority: 'medium',
                href: '/goals',
            })
        }

        actions.push({
            id: 'report-routine',
            title: 'Automate your reporting habit',
            description: 'Use Monthly Portfolio Review as your recurring checkpoint for trend and decision quality.',
            cta: 'Show my reporting SOP',
            prompt: 'Give me a monthly reporting SOP in FinleyBook with exact pages and actions.',
            priority: 'low',
            href: '/reports',
        })

        if (!isProMember) {
            actions.push({
                id: 'upgrade-fit',
                title: 'Check if Pro matches your workflow',
                description: 'Compare export volume, AI coaching frequency, and reporting depth before upgrading.',
                cta: 'AI comparison',
                prompt: 'Compare Free vs Pro for my current usage and tell me when upgrade is worth it.',
                priority: 'low',
                href: '/subscription',
            })
        }

        return actions.slice(0, 4)
    }, [financialStats.transactionCount, walletBalance.available, isProMember])

    const aiQuickQuestions = useMemo(
        () => [
            'I do not understand bookkeeping. Start from zero and teach me daily operations.',
            'How do I record mixed spending like groceries + transport in one day?',
            'Give me a 7-day beginner plan to build a good money habit in FinleyBook.',
            'What should I check on Dashboard, Budget and Reports each week?',
        ],
        []
    )

    const milestones = useMemo(
        () => [
            {
                id: 'milestone-ledger',
                name: 'First Ledger Entry',
                desc: 'Logged your first transaction',
                unlocked: financialStats.transactionCount > 0,
            },
            {
                id: 'milestone-consistency',
                name: 'Consistency Builder',
                desc: 'Recorded 15+ transactions',
                unlocked: financialStats.transactionCount >= 15,
            },
            {
                id: 'milestone-advisor',
                name: 'Advisor Circle',
                desc: 'Reached referral Level 2+',
                unlocked: referralStats.currentLevel >= 2,
            },
        ],
        [financialStats.transactionCount, referralStats.currentLevel]
    )

    const weeklyFocus = useMemo(() => {
        if (financialStats.transactionCount === 0) {
            return {
                title: 'Complete your first bookkeeping day',
                detail: 'Add at least 3 transactions today so Finley AI can start pattern analysis.',
                primaryCta: 'Start Logging',
                primaryHref: '/transactions',
                aiPrompt: 'Guide me through my first 3 transactions today, step by step.',
            }
        }
        if (walletBalance.available <= 0) {
            return {
                title: 'Stabilize cash flow this week',
                detail: 'You are near zero available balance. Set one spending cap and one savings transfer target now.',
                primaryCta: 'Fix Budget Plan',
                primaryHref: '/budget',
                aiPrompt: 'I need a 7-day cash flow recovery plan using my recent spending.',
            }
        }
        return {
            title: 'Scale your monthly discipline',
            detail: 'Your records are active. Turn this into a repeatable routine with budget and reporting checkpoints.',
            primaryCta: 'Review Reports',
            primaryHref: '/reports',
            aiPrompt: 'Build a repeatable weekly finance operating routine based on my current data.',
        }
    }, [financialStats.transactionCount, walletBalance.available])

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const memberYear = new Date(user.metadata.creationTime || Date.now()).getFullYear()
    const profileReadiness = (() => {
        const checks = [
            { key: 'name', label: 'Display name', done: Boolean(user.displayName), href: '/settings' },
            { key: 'photo', label: 'Profile photo', done: Boolean(user.photoURL), href: '/settings' },
            { key: 'phone', label: 'Recovery phone', done: Boolean(user.phoneNumber), href: '/settings' },
            { key: 'ledger', label: 'First bookkeeping record', done: financialStats.transactionCount > 0, href: '/transactions' },
        ]
        const completed = checks.filter((item) => item.done).length
        const score = Math.round((completed / checks.length) * 100)
        const nextStep = checks.find((item) => !item.done)
        return { checks, score, nextStep }
    })()

    const quickLaunchActions = [
        { id: 'quick-tx', title: 'Add Transaction', href: '/transactions', icon: DocumentTextIcon },
        { id: 'quick-budget', title: 'Set Budget', href: '/budget', icon: BanknotesIcon },
        { id: 'quick-reports', title: 'Run Report', href: '/reports', icon: ChartBarIcon },
        { id: 'quick-settings', title: 'Update Settings', href: '/settings', icon: Cog6ToothIcon },
    ]

    const smartWorkflowShortcuts = [
            {
                id: 'workflow-ledger',
                title: financialStats.transactionCount > 0 ? 'Improve bookkeeping quality' : 'Start bookkeeping in 2 minutes',
                desc: financialStats.transactionCount > 0
                    ? 'Use AI to review your latest entries and fix categorization gaps.'
                    : 'Record your first transactions with a guided AI checklist.',
                href: '/transactions',
                prompt: financialStats.transactionCount > 0
                    ? 'Review my recent transactions and tell me what I should fix first for cleaner bookkeeping.'
                    : 'Teach me how to record my first 3 transactions in FinleyBook step by step.',
                icon: ClipboardDocumentIcon,
            },
            {
                id: 'workflow-budget',
                title: walletBalance.available <= 0 ? 'Create a cash-flow recovery budget' : 'Tighten next month budget',
                desc: walletBalance.available <= 0
                    ? 'Set one spending cap and one emergency rule today.'
                    : 'Convert your current spending pattern into category caps.',
                href: '/budget',
                prompt: walletBalance.available <= 0
                    ? 'Build a simple 7-day cash flow recovery budget using my current spending behavior.'
                    : 'Create a category budget plan for next month using my current spending pattern.',
                icon: WalletIcon,
            },
            {
                id: 'workflow-report',
                title: 'Run a decision review report',
                desc: 'Generate a report and let AI explain the next best action.',
                href: '/reports',
                prompt: 'After I generate my report, explain the top 3 decisions I should make this week.',
                icon: ChartBarIcon,
            },
        ]

    const assistantExperienceStatus = (() => {
        if (experienceState.beginnerMode && financialStats.transactionCount < 10) {
            return {
                label: 'Beginner AI Guidance Active',
                detail: 'Finley AI will prioritize onboarding, bookkeeping basics, and short next-step instructions.',
                toneClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
            }
        }
        if (experienceState.assistantAutopilot) {
            return {
                label: 'Autopilot Coaching Enabled',
                detail: 'Finley AI prioritizes habit-building prompts and workflow suggestions based on your activity.',
                toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            }
        }
        return {
            label: 'Manual Guidance Mode',
            detail: 'Use quick actions below to ask AI for help whenever you need it.',
            toneClass: 'border-slate-200 bg-slate-50 text-slate-700',
        }
    })()

    const handleCopyReferralCode = async () => {
        if (!referralStats.referralCode) {
            toast('Referral code not ready yet. Add one transaction first.')
            return
        }
        try {
            await navigator.clipboard.writeText(referralStats.referralCode)
            toast.success('Referral code copied')
        } catch (error) {
            console.error('Failed to copy referral code:', error)
            toast.error('Could not copy referral code')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-10">
            <motion.div className="max-w-7xl mx-auto space-y-6" variants={containerVariants} initial="hidden" animate="show">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <motion.section
                        variants={itemVariants}
                        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                        <div className="h-28 bg-gradient-to-br from-[#111f45] via-[#1d3f6e] to-[#2f6b90]" />
                        <div className="px-6 pb-6 -mt-12">
                            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="User avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <UserCircleIcon className="w-14 h-14" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{user.displayName || 'Finley User'}</h1>
                                    <p className="text-sm text-slate-500">Member since {memberYear}</p>
                                </div>
                                {isProMember && (
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">
                                        PRO
                                    </span>
                                )}
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">AI Guidance Status</p>
                                <p className="mt-1 text-sm text-slate-700">
                                    {financialStats.transactionCount > 0
                                        ? 'Ready: Finley AI can analyze your existing records and suggest better habits.'
                                        : 'New account detected: use AI walkthrough to complete your first bookkeeping flow.'}
                                </p>
                                <button
                                    onClick={() =>
                                        openAiWithPrompt('Please give me a personalized onboarding checklist inside FinleyBook.')
                                    }
                                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Generate onboarding checklist
                                </button>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Profile Readiness</p>
                                    <span className="text-sm font-bold text-slate-900">{profileReadiness.score}%</span>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500" style={{ width: `${profileReadiness.score}%` }} />
                                </div>
                                <div className="mt-3 grid grid-cols-1 gap-2">
                                    {profileReadiness.checks.map((item) => (
                                        <div key={item.key} className={`text-xs rounded-lg px-2.5 py-2 border ${item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                            {item.done ? '✓' : '○'} {item.label}
                                        </div>
                                    ))}
                                </div>
                                {profileReadiness.nextStep && (
                                    <button
                                        onClick={() => router.push(profileReadiness.nextStep!.href)}
                                        className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                                    >
                                        Complete next step
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 space-y-2">
                                <Link
                                    href="/settings"
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors group"
                                >
                                    <span className="flex items-center gap-3">
                                        <ShieldCheckIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        Security & Profile Settings
                                    </span>
                                    <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                                </Link>
                                <button
                                    onClick={() => void logout()}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-600 text-sm font-medium transition-colors group"
                                >
                                    <span className="flex items-center gap-3">
                                        <ArrowRightOnRectangleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                                        Sign Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="lg:col-span-8 space-y-5">
                        <div className="bg-[#0f1f44] text-white rounded-3xl border border-[#1a315f] p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-sky-200/80">Personal Finance Control Center</p>
                                    <h2 className="mt-2 text-2xl md:text-3xl font-bold">Your next best money move, always visible</h2>
                                    <p className="mt-2 text-sm text-sky-100/80">
                                        Finley AI monitors your activity and recommends what to do next, from first-time bookkeeping to weekly optimization.
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] rounded-full bg-white/10 px-2.5 py-1 border border-white/20">
                                            Mode: {experienceState.beginnerMode ? 'Beginner guidance' : 'Standard'}
                                        </span>
                                        <span className="text-[11px] rounded-full bg-white/10 px-2.5 py-1 border border-white/20">
                                            AI style: {experienceState.aiTone}
                                        </span>
                                        <span className="text-[11px] rounded-full bg-white/10 px-2.5 py-1 border border-white/20">
                                            Digest: {experienceState.weeklyDigestDay}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        openAiWithPrompt('Review my current profile data and tell me the top 3 actions to improve my finances this week.')
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#0f1f44] px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 transition"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Ask AI for Top 3 Actions
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Smart Workflow Assistant</p>
                                    <h3 className="mt-1 text-lg font-bold text-slate-900">One-tap guidance for bookkeeping, budgeting, and reporting</h3>
                                    <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                                        Choose a workflow below to open the right page and prefill an AI prompt, so users can act immediately without learning the whole system first.
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${assistantExperienceStatus.toneClass}`}>
                                    <LightBulbIcon className="w-4 h-4 mr-1.5" />
                                    {assistantExperienceStatus.label}
                                </span>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">{assistantExperienceStatus.detail}</p>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {smartWorkflowShortcuts.map((workflow) => (
                                    <motion.div
                                        key={workflow.id}
                                        whileHover={{ y: -2 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                                    >
                                        <workflow.icon className="w-5 h-5 text-slate-500 mb-3" />
                                        <p className="text-sm font-semibold text-slate-900">{workflow.title}</p>
                                        <p className="mt-1 text-xs text-slate-600 leading-relaxed min-h-[36px]">{workflow.desc}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => router.push(workflow.href)}
                                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 transition"
                                            >
                                                Open
                                            </button>
                                            <button
                                                onClick={() => openAiWithPrompt(workflow.prompt)}
                                                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                                            >
                                                Ask AI
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Assets</p>
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">{formatAmount(financialStats.totalAssets)}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</p>
                                    <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">{financialStats.transactionCount}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Balance</p>
                                    <WalletIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">{formatAmount(walletBalance.available / 100)}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Referral Level</p>
                                    <BanknotesIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-900">Level {Math.max(referralStats.currentLevel, 1)}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Quick Launch</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {quickLaunchActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => router.push(action.href)}
                                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition p-3 text-left"
                                    >
                                        <action.icon className="w-4 h-4 text-slate-500 mb-2" />
                                        <p className="text-sm font-semibold text-slate-800">{action.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">This Week Focus</p>
                                        <h3 className="mt-1 text-lg font-bold text-slate-900">{weeklyFocus.title}</h3>
                                        <p className="mt-2 text-sm text-slate-700">{weeklyFocus.detail}</p>
                                    </div>
                                    <RocketLaunchIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => router.push(weeklyFocus.primaryHref)}
                                        className="inline-flex items-center rounded-lg bg-indigo-600 text-white px-3 py-2 text-xs font-semibold hover:bg-indigo-700 transition"
                                    >
                                        {weeklyFocus.primaryCta}
                                    </button>
                                    <button
                                        onClick={() => openAiWithPrompt(weeklyFocus.aiPrompt)}
                                        className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                                    >
                                        Ask AI to guide
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Referral Growth</p>
                                <h3 className="mt-1 text-lg font-bold text-slate-900">Invite your circle, grow trust</h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Referral level {Math.max(referralStats.currentLevel, 1)} · {referralStats.totalReferrals} successful invites.
                                </p>
                                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700 break-all">
                                    {referralStats.referralCode || 'Generating referral code...'}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={handleCopyReferralCode}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                                    >
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                        Copy code
                                    </button>
                                    <button
                                        onClick={() => router.push('/refer')}
                                        className="inline-flex items-center rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-black transition"
                                    >
                                        Open referral page
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                <motion.section variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">AI Recommended Next Actions</h3>
                            <p className="text-sm text-slate-500">Tailored from your current activity and account status.</p>
                        </div>
                        <button
                            onClick={() =>
                                openAiWithPrompt('Create a detailed 30-day personal finance operating plan in FinleyBook.')
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 transition"
                        >
                            <LightBulbIcon className="w-4 h-4" />
                            Build 30-day plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedActions.map((action) => {
                            const toneClass =
                                action.priority === 'high'
                                    ? 'border-rose-200 bg-rose-50/40'
                                    : action.priority === 'medium'
                                        ? 'border-amber-200 bg-amber-50/40'
                                        : 'border-slate-200 bg-slate-50/70'

                            return (
                                <div key={action.id} className={`rounded-2xl border p-4 ${toneClass}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{action.title}</p>
                                            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{action.description}</p>
                                        </div>
                                        {action.priority === 'high' ? (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                        ) : (
                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openAiWithPrompt(action.prompt)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            {action.cta}
                                        </button>

                                        {action.href && (
                                            <button
                                                onClick={() => router.push(action.href as string)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                                            >
                                                Open page
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <motion.section variants={itemVariants} className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-xl font-bold text-slate-900">Ask Finley AI Anytime</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-5">
                            New users can ask direct questions and get concrete steps: what to click, what to record, and how to build a clean bookkeeping habit.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aiQuickQuestions.map((question) => (
                                <button
                                    key={question}
                                    onClick={() => openAiWithPrompt(question)}
                                    className="text-left rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5">
                            <button
                                onClick={() => setIsAiOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white px-4 py-2.5 text-sm font-semibold hover:opacity-95 transition"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Open AI Assistant
                            </button>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Professional Milestones</h3>
                        <p className="text-sm text-slate-500 mb-5">Designed for progress clarity, not vanity points.</p>

                        <div className="space-y-3">
                            {milestones.map((milestone) => (
                                <div
                                    key={milestone.id}
                                    className={`rounded-2xl border p-4 ${milestone.unlocked ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-900">{milestone.name}</p>
                                        {milestone.unlocked ? (
                                            <span className="text-[11px] rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 font-semibold">
                                                Achieved
                                            </span>
                                        ) : (
                                            <span className="text-[11px] rounded-full bg-slate-200 text-slate-600 px-2 py-1 font-semibold">
                                                In progress
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{milestone.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => router.push('/reports')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                            >
                                <ChartBarIcon className="w-4 h-4" />
                                Open Reports
                            </button>
                            <Link
                                href="/settings"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 transition"
                            >
                                <Cog6ToothIcon className="w-4 h-4" />
                                Account Settings
                            </Link>
                        </div>
                    </motion.section>
                </div>

                <motion.div variants={itemVariants}>
                    <SubscriptionStatus />
                </motion.div>
            </motion.div>

            <AIChatInput
                isOpen={isAiOpen}
                onOpenChange={setIsAiOpen}
                prefillText={aiPrefill}
                prefillKey={aiPrefillKey}
                welcomeTitle="Ask Finley how to use each page and how to keep proper financial records"
                placeholder="Try: I spent $24 on lunch, or teach me bookkeeping from scratch"
                suggestions={[
                    { icon: '🧾', text: 'Log first expense', action: 'Help me log my first expense with correct category and date.' },
                    { icon: '📘', text: 'Beginner guide', action: 'I am new. Explain how to use FinleyBook in order, step by step.', highlight: true },
                    { icon: '📊', text: 'Budget setup', action: 'How should I set my first monthly budget limits?' },
                    { icon: '🧠', text: 'Weekly review', action: 'Give me a weekly money review checklist in this app.' },
                ]}
            />
        </div>
    )
}
