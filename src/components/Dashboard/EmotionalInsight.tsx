'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../AuthProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'

export default function EmotionalInsight() {
    const { user } = useAuth()
    const [stats, setStats] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return
            try {
                const txs = await getUserTransactions(user.uid, 50)
                // Group by emotion
                const emotionStats: Record<string, number> = {}
                txs.forEach(t => {
                    if (t.type === 'expense' && t.emotionalTag) {
                        emotionStats[t.emotionalTag] = (emotionStats[t.emotionalTag] || 0) + 1
                    }
                })
                setStats(emotionStats)
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    const emotions = [
        { key: 'happy', label: 'Happpy', emoji: '🥰', color: 'bg-yellow-100 text-yellow-700' },
        { key: 'stress', label: 'Stress', emoji: '😫', color: 'bg-red-100 text-red-700' },
        { key: 'impulse', label: 'Impulse', emoji: '💸', color: 'bg-purple-100 text-purple-700' },
        { key: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-700' },
        { key: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-100 text-gray-700' },
    ]

    const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1

    if (loading) return <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />

    return (
        <motion.div
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <h3 className="font-bold text-gray-900 mb-4">Mood & Spending</h3>

            <div className="space-y-3">
                {emotions.map(emotion => {
                    const count = stats[emotion.key] || 0
                    if (count === 0) return null
                    const percent = (count / total) * 100

                    return (
                        <div key={emotion.key} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${emotion.color}`}>
                                {emotion.emoji}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-700">{emotion.label}</span>
                                    <span className="text-gray-400">{count} txns</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${emotion.key === 'stress' ? 'bg-red-500' : emotion.key === 'impulse' ? 'bg-purple-500' : 'bg-indigo-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
                {Object.keys(stats).length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">
                        No emotional data yet. Try tagging your next expense!
                    </p>
                )}
            </div>
        </motion.div>
    )
}
