'use client'

import { motion } from 'framer-motion'
import { ArrowTrendingUpIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/components/SubscriptionProvider'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export default function PlanValueCard() {
    const router = useRouter()
    const { subscription, isProMember, usage, getRemainingUsage, currentPlanName } = useSubscription()

    if (!subscription) return null

    const limits = SUBSCRIPTION_PLANS[subscription.planKey].limits
    const txProgress = limits.transactions > 0 ? Math.min((usage.transactions / limits.transactions) * 100, 100) : 0
    const budgetProgress = limits.budgets > 0 ? Math.min((usage.budgets / limits.budgets) * 100, 100) : 0
    const exportProgress = limits.exports > 0 ? Math.min((usage.exports / limits.exports) * 100, 100) : 0
    const txRemaining = getRemainingUsage('transactions')
    const budgetRemaining = getRemainingUsage('budgets')
    const exportRemaining = getRemainingUsage('exports')

    if (isProMember) {
        return (
            <motion.div
                className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 rounded-2xl p-5 text-white border border-indigo-700/30 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-200" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Pro Active</h3>
                    </div>
                    <span className="text-[11px] bg-white/15 px-2 py-1 rounded-full">{currentPlanName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-white/10 rounded-lg p-2">
                        <div className="text-indigo-100">Transactions</div>
                        <div className="font-bold">Unlimited</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                        <div className="text-indigo-100">Budgets</div>
                        <div className="font-bold">Unlimited</div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => router.push('/subscription')}
                    className="w-full rounded-lg bg-white text-indigo-700 text-sm font-bold py-2 hover:bg-indigo-50 transition-colors"
                >
                    Manage Plan
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Free Plan</h3>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{currentPlanName}</span>
            </div>

            <div className="space-y-3 mb-4">
                <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-600">
                        <span>Transactions this month</span>
                        <span>{usage.transactions}/{limits.transactions}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${txProgress}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{txRemaining} remaining</p>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-600">
                        <span>Budget categories</span>
                        <span>{usage.budgets}/{limits.budgets}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${budgetProgress}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{budgetRemaining} remaining</p>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-600">
                        <span>Exports</span>
                        <span>{usage.exports}/{limits.exports}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${exportProgress}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{exportRemaining} remaining</p>
                </div>
            </div>

            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 mb-4">
                <div className="flex items-start gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <p className="text-xs text-indigo-700">
                        Upgrade to unlock unlimited tracking, AI insights, and professional export workflows.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => router.push('/subscribe')}
                className="w-full rounded-lg bg-slate-900 text-white text-sm font-bold py-2 hover:bg-black transition-colors"
            >
                Upgrade to Pro
            </button>
        </motion.div>
    )
}
