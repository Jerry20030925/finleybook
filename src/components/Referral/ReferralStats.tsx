'use client'

import { useEffect, useState } from 'react'
import { getReferralStats, ReferralStats, REFERRAL_LEVELS } from '@/lib/referralService'
import { useAuth } from '@/components/AuthProvider'

export default function ReferralStatsCard() {
    const { user } = useAuth()
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            getReferralStats(user.uid).then(data => {
                setStats(data)
                setLoading(false)
            })
        }
    }, [user])

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl"></div>

    const currentReferrals = stats?.totalReferrals || 0
    const nextLevel = currentReferrals < REFERRAL_LEVELS.LEVEL_1 ? REFERRAL_LEVELS.LEVEL_1 :
        currentReferrals < REFERRAL_LEVELS.LEVEL_2 ? REFERRAL_LEVELS.LEVEL_2 :
            REFERRAL_LEVELS.LEVEL_3

    const progress = Math.min(100, (currentReferrals / nextLevel) * 100)

    const getRewardText = () => {
        if (currentReferrals < REFERRAL_LEVELS.LEVEL_1) return '解锁 1 个月免费会员'
        if (currentReferrals < REFERRAL_LEVELS.LEVEL_2) return '解锁高级比价功能'
        return '解锁终身免费会员'
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">我的邀请进度</h3>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Level {stats?.currentLevel || 0}
                </span>
            </div>

            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">已邀请 {currentReferrals} 人</span>
                    <span className="text-gray-900 font-medium">目标: {nextLevel} 人</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                    再邀请 {nextLevel - currentReferrals} 人即可{getRewardText()}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">成功邀请</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">${((stats?.totalEarned || 0) / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">累计奖励</p>
                </div>
            </div>
        </div>
    )
}
