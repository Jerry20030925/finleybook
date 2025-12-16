'use client'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserCircleIcon, TrophyIcon, BanknotesIcon, ChartBarIcon, ShieldCheckIcon, WalletIcon, InformationCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

import SubscriptionStatus from '@/components/SubscriptionStatus'
import ReferralGiftCard from '@/components/ReferralGiftCard'
import { useCurrency } from '@/components/CurrencyProvider'
import AIChatInput from '@/components/AIChatInput'
import { SparklesIcon } from '@heroicons/react/24/solid'

export default function ProfilePage() {
    const { user, loading, logout } = useAuth()
    const { t } = useLanguage()
    const { formatAmount } = useCurrency()
    const router = useRouter()
    const [redeemCode, setRedeemCode] = useState('')
    const [redeeming, setRedeeming] = useState(false)
    const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [financialStats, setFinancialStats] = useState({ totalAssets: 0, transactionCount: 0 })
    const [walletBalance, setWalletBalance] = useState({ available: 0, pending: 0, lifetime: 0 })
    const [referralStats, setReferralStats] = useState({ totalReferrals: 0, currentLevel: 0, referralCode: '' })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        if (user) {
            const fetchData = async () => {
                try {
                    const [finStats, walletData, refStats] = await Promise.all([
                        import('@/lib/dataService').then(mod => mod.getUserFinancialSummary(user.uid)),
                        import('@/lib/dataService').then(mod => mod.getUserWalletBalance(user.uid)),
                        import('@/lib/referralService').then(mod => mod.getReferralStats(user.uid))
                    ])
                    setFinancialStats(finStats)
                    setWalletBalance(walletData)
                    if (refStats) setReferralStats(refStats)
                } catch (error) {
                    console.error('Error fetching profile data:', error)
                }
            }
            fetchData()
        }
    }, [user, loading, router])

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    }

    const stats = [
        { name: t('profile.stats.savings'), value: formatAmount(financialStats.totalAssets), icon: BanknotesIcon, color: 'text-green-600', bg: 'bg-green-100' },
        { name: t('profile.stats.transactions'), value: financialStats.transactionCount.toString(), icon: ChartBarIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: t('profile.stats.level'), value: referralStats.currentLevel > 0 ? `Level ${referralStats.currentLevel}` : 'Silver', icon: TrophyIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ]

    const badges = [
        { name: t('profile.badges.firstCashback'), icon: '🏅', unlocked: walletBalance.lifetime > 0 },
        { name: t('profile.badges.budgetMaster'), icon: '🚀', unlocked: financialStats.transactionCount > 10 },
        { name: t('profile.badges.wealthPro'), icon: '💎', unlocked: referralStats.currentLevel >= 3 },
    ]

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Link
                            href="/settings"
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <Cog6ToothIcon className="w-6 h-6" />
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="h-24 w-24 rounded-full border-4 border-white shadow-md" />
                            ) : (
                                <UserCircleIcon className="h-24 w-24 text-gray-300" />
                            )}
                            {user.subscription?.plan === 'pro' && (
                                <div className="absolute bottom-0 right-0 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                                    PRO
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{user.displayName || t('profile.user')}</h1>
                            <p className="text-gray-500">{t('profile.joined', {
                                date: user.metadata.creationTime
                                    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                                    : 'Dec 2025'
                            })}</p>
                            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                                {badges.map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${badge.unlocked
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        <span>{badge.icon}</span>
                                        <span>{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lifetime Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 border-t border-gray-100 pt-6">
                        {stats.map((stat) => (
                            <div key={stat.name} className="text-center relative group">
                                <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1">
                                    {stat.name}
                                    {stat.name === t('profile.stats.level') && (
                                        <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </p>
                                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>

                                {stat.name === t('profile.stats.level') && (
                                    <>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mx-auto mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${(referralStats.currentLevel / 3) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {referralStats.currentLevel}/3 to Gold
                                        </p>
                                    </>
                                )}

                                {stat.name === t('profile.stats.level') && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 hidden group-hover:block z-20 shadow-lg text-left">
                                        <p className="font-bold mb-1">{t('level.tooltip.title')}</p>
                                        <p>{t('level.tooltip.desc')}</p>
                                        <p className="mt-2 text-yellow-400">{t('level.tooltip.next', { count: 3 - (referralStats.currentLevel || 0) })}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reports & Analytics (Moved from Bottom Nav) */}
                <div onClick={() => router.push('/reports')} className="cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ChartBarIcon className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">{t('nav.reports')}</h3>
                        <p className="text-white/80 text-sm mb-4">View your financial trends and insights</p>
                        <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            Open Reports <span aria-hidden="true">&rarr;</span>
                        </span>
                    </div>
                </div>

                {/* Wallet Widget */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-xl p-6 text-white flex justify-between items-center group">
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    {/* Subtle Glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <WalletIcon className="w-5 h-5" />
                            <span className="text-sm font-medium tracking-wide uppercase">{t('profile.wallet.title')}</span>
                        </div>
                        <div className="text-4xl font-bold tracking-tight text-white">{formatAmount(walletBalance.available / 100)}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">**** **** **** 4288</div>
                    </div>
                    <div className="relative z-10 flex gap-3">
                        <Link
                            href="/wallet"
                            className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/20 transition-all active:scale-95"
                        >
                            {t('profile.wallet.withdraw')}
                        </Link>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        try {
                            await logout()
                            router.push('/')
                        } catch (error) {
                            console.error('Logout failed', error)
                        }
                    }}
                    className="w-full bg-white text-red-600 font-medium py-4 rounded-2xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 border border-red-100"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    {t('nav.signOut')}
                </button>

                {/* Subscription Status */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">{t('profile.subscription.title')}</h3>
                        <p className="text-gray-500 text-sm">{t('profile.subscription.desc')}</p>
                    </div>
                    <div className="p-6">
                        <SubscriptionStatus />
                    </div>
                </div>
                {/* AI Assistant Access */}
                <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <SparklesIcon className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                                <SparklesIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold">Finley AI Assistant</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4 max-w-sm">
                            Your personal financial intelligence. Ask about your spending, set goals, or get savings tips.
                        </p>
                        <AIChatInput
                            trigger={
                                <button className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                                    Launch Assistant
                                </button>
                            }
                        />
                    </div>
                </div>

            </div >

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent" />
            </div>

        </div >
    )
}
