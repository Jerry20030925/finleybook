'use client'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserCircleIcon, TrophyIcon, BanknotesIcon, ChartBarIcon, ShieldCheckIcon, WalletIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

import SubscriptionStatus from '@/components/SubscriptionStatus'
import ReferralGiftCard from '@/components/ReferralGiftCard'
import { useCurrency } from '@/components/CurrencyProvider'

export default function ProfilePage() {
    const { user, loading } = useAuth()
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
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
                        >
                            {t('profile.edit')} <span aria-hidden="true">&rarr;</span>
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
                            <p className="text-gray-500">{t('profile.joined', { date: 'Dec 2025' })}</p>
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

                {/* Referral Hub */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">{t('profile.referral.title')}</h3>
                        <p className="text-gray-500 text-sm">{t('profile.referral.desc')}</p>
                    </div>
                    <div className="p-6">
                        <ReferralGiftCard code={referralStats.referralCode} />
                    </div>
                </div>

                {/* Redeem Code Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">{t('profile.redeem.title')}</h3>
                        <p className="text-gray-500 text-sm">{t('profile.redeem.desc')}</p>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-2 max-w-md">
                            <input
                                type="text"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                                placeholder={t('profile.redeem.placeholder')}
                                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                            />
                            <button
                                onClick={async () => {
                                    if (!redeemCode) return;
                                    setRedeeming(true);
                                    setRedeemMessage(null);
                                    try {
                                        const token = await user?.getIdToken();
                                        const res = await fetch('/api/referral/redeem', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ code: redeemCode })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            setRedeemMessage({ type: 'success', text: data.message });
                                            setRedeemCode('');
                                            await user?.getIdToken(true);
                                        } else {
                                            setRedeemMessage({ type: 'error', text: data.error });
                                        }
                                    } catch (e) {
                                        setRedeemMessage({ type: 'error', text: t('profile.redeem.failed') });
                                    } finally {
                                        setRedeeming(false);
                                    }
                                }}
                                disabled={redeeming || !redeemCode}
                                className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {redeeming ? '...' : t('profile.redeem.button')}
                            </button>
                        </div>
                        {redeemMessage && (
                            <p className={`mt-2 text-sm ${redeemMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {redeemMessage.text}
                            </p>
                        )}
                    </div>
                </div>

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
            </div >
        </div >
    )
}
