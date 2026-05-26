'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles, ArrowRight, TrendingUp, Wallet, ShoppingBag,
    Star, Clock, ChevronRight, Zap, Gift, Shield
} from 'lucide-react'
import { useCurrency } from '@/components/CurrencyProvider'
import Link from 'next/link'
import CountUp from '@/components/CountUp'

interface MerchantDeal {
    id: string
    name: string
    logo: string
    category: string
    baseRate: number
    proRate: number
    isHot?: boolean
    isFeatured?: boolean
    url: string
    color: string
}

const MERCHANTS: MerchantDeal[] = [
    {
        id: 'amazon-au',
        name: 'Amazon AU',
        logo: '📦',
        category: 'Retail',
        baseRate: 2.5,
        proRate: 5.0,
        isHot: true,
        isFeatured: true,
        url: 'https://www.amazon.com.au',
        color: 'from-orange-500 to-amber-500',
    },
    {
        id: 'myer',
        name: 'Myer',
        logo: '🛍️',
        category: 'Department Store',
        baseRate: 5.0,
        proRate: 10.0,
        isFeatured: true,
        url: 'https://www.myer.com.au',
        color: 'from-red-500 to-rose-500',
    },
    {
        id: 'the-iconic',
        name: 'The Iconic',
        logo: '👗',
        category: 'Fashion',
        baseRate: 4.0,
        proRate: 8.0,
        url: 'https://www.theiconic.com.au',
        color: 'from-purple-500 to-violet-500',
    },
    {
        id: 'ebay-au',
        name: 'eBay AU',
        logo: '🛒',
        category: 'Marketplace',
        baseRate: 1.5,
        proRate: 3.0,
        url: 'https://www.ebay.com.au',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'booking-com',
        name: 'Booking.com',
        logo: '🏨',
        category: 'Travel',
        baseRate: 3.5,
        proRate: 7.0,
        isHot: true,
        url: 'https://www.booking.com',
        color: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'kogan',
        name: 'Kogan',
        logo: '💻',
        category: 'Electronics',
        baseRate: 3.0,
        proRate: 6.0,
        url: 'https://www.kogan.com',
        color: 'from-green-500 to-emerald-500',
    },
]

const STEPS = [
    {
        icon: ShoppingBag,
        title: 'Shop via Finleybook',
        desc: 'Click "Shop Now" on any merchant deal below. Your link is automatically tracked.',
    },
    {
        icon: Clock,
        title: 'Cashback tracked',
        desc: 'Your cashback is tracked and added to your pending balance within 24–48 hours.',
    },
    {
        icon: Wallet,
        title: 'Redeem anytime',
        desc: 'Once approved (typically 30 days), withdraw to your bank or PayPal.',
    },
]

export default function RewardsPage() {
    const { country } = useCurrency()
    const [activeTab, setActiveTab] = useState<'deals' | 'activity'>('deals')

    // Demo wallet values — will be pulled from Firestore once backend is live
    const pendingBalance = 12.00
    const availableBalance = 48.50
    const lifetimeEarned = 145.50

    // Simulate pro status — replace with real subscription check
    const isPro = false

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pb-24">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 px-4 pt-12 pb-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none" />
                <div className="relative max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
                        <Sparkles size={12} />
                        Cashback Rewards Hub
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Your shopping pays you back
                    </h1>
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                        Earn cashback at 200+ stores. Pro members get 2× the rate on every purchase.
                    </p>

                    {/* Wallet Snapshot */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                            { label: 'Pending', value: pendingBalance, color: 'text-amber-400' },
                            { label: 'Available', value: availableBalance, color: 'text-emerald-400' },
                            { label: 'Lifetime', value: lifetimeEarned, color: 'text-indigo-300' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 text-center"
                            >
                                <p className={`text-lg font-black ${item.color}`}>
                                    <CountUp value={item.value} prefix={country.symbol} decimals={2} />
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-wider">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-3">
                        <Link href="/wallet" className="flex-1">
                            <button className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Wallet size={15} />
                                Withdraw
                            </button>
                        </Link>
                        <Link href="/redeem" className="flex-1">
                            <button className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Gift size={15} />
                                Redeem
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
                {/* Pro Boost Banner */}
                {!isPro && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950 to-violet-950 p-4 flex items-center gap-4"
                    >
                        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                            <Zap size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">Unlock 2× Cashback with Pro</p>
                            <p className="text-xs text-indigo-300 mt-0.5">
                                Pro members earn double on every deal — from {country.symbol}3.25/month
                            </p>
                        </div>
                        <Link href="/pricing">
                            <button className="shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 transition-colors">
                                Upgrade
                                <ArrowRight size={13} />
                            </button>
                        </Link>
                    </motion.div>
                )}

                {/* Tab toggle */}
                <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
                    {(['deals', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 h-8 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab
                                ? 'bg-white text-gray-900'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab === 'deals' ? 'Featured Deals' : 'My Activity'}
                        </button>
                    ))}
                </div>

                {activeTab === 'deals' && (
                    <div className="space-y-3">
                        {MERCHANTS.map((merchant, i) => {
                            const rate = isPro ? merchant.proRate : merchant.baseRate
                            return (
                                <motion.div
                                    key={merchant.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center gap-4"
                                >
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${merchant.color} flex items-center justify-center text-2xl shrink-0`}>
                                        {merchant.logo}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white">{merchant.name}</p>
                                            {merchant.isHot && (
                                                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                                                    HOT
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{merchant.category}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-black text-emerald-400">{rate}%</p>
                                        <p className="text-[10px] text-gray-500 -mt-0.5">cashback</p>
                                    </div>

                                    <a
                                        href={merchant.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold flex items-center gap-1 transition-all"
                                    >
                                        Shop
                                        <ChevronRight size={13} />
                                    </a>
                                </motion.div>
                            )
                        })}

                        {!isPro && (
                            <p className="text-center text-xs text-gray-600 pt-1">
                                Showing base rates. <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">Upgrade to Pro</Link> for 2× cashback on all stores.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                            <TrendingUp size={22} className="text-gray-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No activity yet</p>
                        <p className="text-xs text-gray-600 mt-1 max-w-[220px] mx-auto leading-relaxed">
                            Your cashback transactions will appear here once you shop through Finleybook.
                        </p>
                        <button
                            onClick={() => setActiveTab('deals')}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                        >
                            <ShoppingBag size={13} />
                            Browse Deals
                        </button>
                    </div>
                )}

                {/* How it works */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">How it works</p>
                    <div className="space-y-4">
                        {STEPS.map((step) => {
                            const StepIcon = step.icon
                            return (
                                <div key={step.title} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                        <StepIcon size={14} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{step.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Trust row */}
                <div className="grid grid-cols-2 gap-3 pb-4">
                    {[
                        { icon: Shield, text: 'No card details shared with Finleybook' },
                        { icon: Star, text: 'Cashback credited within 48 hours of purchase' },
                    ].map((item) => {
                        const Icon = item.icon
                        return (
                            <div key={item.text} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-2">
                                <Icon size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
