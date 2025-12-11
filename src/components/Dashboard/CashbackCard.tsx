'use client'

import { motion } from 'framer-motion'
import { Wallet, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { useCurrency } from '../CurrencyProvider'
import Link from 'next/link'

interface CashbackCardProps {
    pendingAmount?: number
    potentialAmount?: number
    lifeTimeEarned?: number
}

export default function CashbackCard({ pendingAmount = 12.00, potentialAmount = 50.00, lifeTimeEarned = 145.50 }: CashbackCardProps) {
    const { formatAmount } = useCurrency()

    return (
        <motion.div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-full min-h-[220px] flex flex-col justify-between group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
        >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Cashback Rewards</h3>
                        <p className="text-xs text-gray-400">Your shopping pays you back</p>
                    </div>
                </div>
                <div className="px-2 py-1 bg-green-500/20 rounded-lg border border-green-500/30 flex items-center gap-1.5 cursor-pointer hover:bg-green-500/30 transition-colors group/boost">
                    <TrendingUp size={12} className="text-green-400 group-hover/boost:animate-bounce" />
                    <span className="text-xs font-bold text-green-400">Boost Active</span>
                </div>
            </div>

            {/* Daily Deal Ticker */}
            <div className="relative z-10 mt-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 inline-flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-gray-300 font-medium">Daily Deal: <span className="text-white font-bold">Amazon 5% Cashback</span> 🔥</span>
            </div>

            {/* Main Value */}
            <div className="relative z-10 mt-6 mb-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{formatAmount(pendingAmount)}</span>
                    <span className="text-sm font-medium text-gray-400">pending</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-200 bg-white/5 rounded-lg p-2 max-w-fit border border-white/5">
                    <Wallet size={12} />
                    <span>Lifetime Earned: <span className="font-bold text-white">{formatAmount(lifeTimeEarned)}</span></span>
                </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto">
                <Link href="/wallet" className="col-span-1">
                    <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                        Withdraw
                    </button>
                </Link>
                <Link href="/wealth" className="col-span-1">
                    <button className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 group/btn">
                        Shop Now
                        <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </Link>
            </div>

            {/* Hidden "Potential" Teaser */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-right opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 scale-75 group-hover:scale-100 origin-right">
                <div className="text-6xl font-black">{formatAmount(potentialAmount)}</div>
                <div className="text-sm font-bold uppercase tracking-widest">Potential</div>
            </div>
        </motion.div>
    )
}
