'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../AuthProvider'
import { getCashbackTransactions } from '@/lib/dataService'
import { Sprout, TreeDeciduous, Flower2, CloudRain, Sun } from 'lucide-react'

export default function FinancialGarden() {
    const { user } = useAuth()
    const [totalHealing, setTotalHealing] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            try {
                // Fetch REAL cashback transactions
                const txs = await getCashbackTransactions(user.uid)
                // Sum the confirmed/paid amounts (or all if we want to show potential)
                // Let's count 'pending' as well to show potential growth immediately
                const healing = txs.reduce((sum, t) => sum + (t.userCashbackAmount || 0), 0)
                setTotalHealing(healing)
            } catch (error) {
                console.error('Error fetching garden data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    const getStage = (amount: number) => {
        if (amount === 0) return { icon: Sprout, label: 'Seedling', next: 10, quote: "Potential awaits." }
        if (amount < 10) return { icon: Sprout, label: 'Sprout', next: 50, quote: "First signs of life!" }
        if (amount < 50) return { icon: Flower2, label: 'Bloom', next: 100, quote: "Growing strong." }
        if (amount < 100) return { icon: TreeDeciduous, label: 'Sapling', next: 500, quote: "Roots are deep." }
        return { icon: TreeDeciduous, label: 'Forest', next: 1000, quote: "An ecosystem thrives." }
    }

    const stage = getStage(totalHealing)
    const progress = Math.min(100, (totalHealing / stage.next) * 100)
    const Icon = stage.icon

    if (loading) return <div className="h-48 bg-gray-50 rounded-3xl animate-pulse" />

    return (
        <motion.div
            className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 relative overflow-hidden text-white shadow-xl h-full flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
        >
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sun size={120} className="text-yellow-300 animate-spin-slow" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-10">
                <CloudRain size={80} className="text-blue-300" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Financial Garden
                        <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-400/30">Lvl {Math.floor(totalHealing / 10) + 1}</span>
                    </h3>
                    <p className="text-xs text-emerald-100/80">{stage.quote}</p>
                </div>
            </div>

            {/* Main Visual */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse-slow"></div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <Icon size={80} className="text-emerald-100 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
                    </motion.div>
                </div>
            </div>

            {/* Stats & Progress */}
            <div className="relative z-10 space-y-3 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-emerald-200 mb-1">Total Cashback Growth</div>
                        <div className="text-2xl font-bold">${totalHealing.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-emerald-200">Next Stage</div>
                        <div className="font-bold">${stage.next}</div>
                    </div>
                </div>

                <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
                <div className="text-[10px] text-center text-emerald-200/60 font-medium tracking-wider uppercase">
                    {progress.toFixed(0)}% to {stage.next === 10 ? 'Sprout' : stage.next === 50 ? 'Bloom' : 'Level Up'}
                </div>
            </div>
        </motion.div>
    )
}
