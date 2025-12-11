'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { Challenge, joinChallenge } from '@/lib/socialService'
import { useAuth } from '../AuthProvider'

interface ChallengeCardProps {
    challenge: Challenge
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
    const { user } = useAuth()
    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleJoin = async () => {
        if (!user) return
        setLoading(true)
        try {
            await joinChallenge(user.uid, challenge.id)
            setJoined(true)
        } catch (error) {
            console.error('Failed to join challenge', error)
        } finally {
            setLoading(false)
        }
    }

    const [daysLeft, setDaysLeft] = useState<number>(0)

    useEffect(() => {
        const left = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        setDaysLeft(left)
    }, [challenge.endDate])

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-colors ${challenge.type === 'savings_race' ? 'bg-indigo-400' : 'bg-green-400'
                }`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${challenge.type === 'savings_race' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'
                        }`}>
                        <Trophy size={20} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                        {challenge.type === 'savings_race' ? 'Race' : 'Challenge'}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1">{challenge.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{challenge.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{challenge.participants.length} Joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{daysLeft} days left</span>
                    </div>
                </div>

                {joined ? (
                    <div className="w-full bg-green-50 text-green-700 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium">
                        <CheckCircle size={16} />
                        Active
                    </div>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Joining...' : 'Join Challenge'}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                )}
            </div>
        </div>
    )
}
