'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link as LinkIcon, ArrowRight, Loader2, CheckCircle, ExternalLink, ShoppingBag, X } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { getGoals, Goal } from '@/lib/dataService'

export default function AmazonCashbackInput() {
    const { user } = useAuth()
    const { t } = useLanguage()

    // Form State
    const [url, setUrl] = useState('')
    const [estimatedAmount, setEstimatedAmount] = useState('')
    const [selectedGoalId, setSelectedGoalId] = useState('')

    // App State
    const [loading, setLoading] = useState(false)
    const [analyzed, setAnalyzed] = useState(false)
    const [metadata, setMetadata] = useState<{ title: string, image: string, price: number } | null>(null)
    const [affiliateLink, setAffiliateLink] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)

    const [error, setError] = useState('')
    const [goals, setGoals] = useState<Goal[]>([])

    useEffect(() => {
        if (user?.uid) {
            getGoals(user.uid).then(setGoals).catch(console.error)
        }
    }, [user])

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setLoading(true)
        setError('')
        setAnalyzed(false)
        setMetadata(null)

        try {
            const res = await fetch('/api/cashback/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    estimatedAmount: parseFloat(estimatedAmount) || 0,
                    uid: user?.uid,
                    goalId: selectedGoalId
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to analyze link')
            }

            setAffiliateLink(data.url)
            setMetadata(data.metadata)
            setAnalyzed(true)
            setLoading(false)

        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleActivate = () => {
        if (!affiliateLink) return
        window.open(affiliateLink, '_blank')
        setShowConfirmation(true)
    }

    const handleReset = () => {
        setUrl('')
        setEstimatedAmount('')
        setAnalyzed(false)
        setMetadata(null)
        setShowConfirmation(false)
    }

    // Determine Earning
    const price = metadata?.price || parseFloat(estimatedAmount) || 0
    const earning = (price * (selectedGoalId ? 0.15 : 0.05)).toFixed(2)

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden transition-all">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <LinkIcon className="text-orange-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Amazon Cashback</h3>
                        <p className="text-sm text-gray-500">Paste link to activate cashback</p>
                    </div>
                </div>

                {!analyzed ? (
                    <form onSubmit={handleAnalyze} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Paste product link..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base text-gray-900"
                        />

                        <div className="flex gap-3">
                            <select
                                value={selectedGoalId}
                                onChange={(e) => setSelectedGoalId(e.target.value)}
                                className="w-1/3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                            >
                                <option value="">Boost Goal...</option>
                                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                            </select>

                            {/* Fallback estimation if scraping fails or not yet run */}
                            <input
                                type="number"
                                placeholder="Est. Price"
                                value={estimatedAmount}
                                onChange={(e) => setEstimatedAmount(e.target.value)}
                                className="w-1/3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                            />

                            <button
                                type="submit"
                                disabled={loading || !url}
                                className="flex-1 bg-black text-white font-bold rounded-xl py-3 px-6 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-800"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Analyze'}
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                    </form>
                ) : (
                    <div className="space-y-4">
                        {/* Product Card */}
                        <div className="flex gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 items-start">
                            {metadata?.image ? (
                                <img src={metadata.image} alt="Product" className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-200" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                    <ShoppingBag size={24} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                                    {metadata?.title || 'Unknown Product'}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
                                    {metadata?.price && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Step */}
                        {!showConfirmation ? (
                            <button
                                onClick={handleActivate}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-3 px-6 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                            >
                                Activate Cashback
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                    +${earning}
                                </span>
                                <ExternalLink size={18} />
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 rounded-xl p-4 text-center border border-green-100"
                            >
                                <h4 className="font-bold text-green-800 mb-2">Did you complete the purchase?</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 bg-white border border-green-200 text-green-700 py-2 rounded-lg font-medium hover:bg-green-50"
                                    >
                                        Yes, Bought!
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="flex-1 text-gray-500 py-2 text-sm hover:underline"
                                    >
                                        Not yet
                                    </button>
                                </div>
                                <p className="text-xs text-green-600 mt-2">
                                    We'll track this transaction. Money usually appears in 3-5 days.
                                </p>
                            </motion.div>
                        )}

                        {!showConfirmation && (
                            <button onClick={handleReset} className="w-full text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
                                <X size={12} /> Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
