'use client'

import { useAuth } from '@/components/AuthProvider'
import ReferralStatsCard from '@/components/Referral/ReferralStats'
import ShareSection from '@/components/Referral/ShareSection'
import PageLoader from '@/components/PageLoader'

export default function ReferralPage() {
    const { user, loading } = useAuth()

    if (loading) return <PageLoader />

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h1>
                    <p className="text-gray-600">登录后查看您的邀请奖励</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">邀请好友，共赢奖励</h1>
                <p className="text-lg text-gray-600">
                    帮助朋友省钱，同时为您自己赢得免费会员时长。
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <ShareSection />

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">奖励规则</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>朋友通过您的链接注册，获得首月 $0.99 优惠。</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>每成功邀请 1 人，您的会员有效期延长 1 个月。</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>累计邀请 10 人，解锁终身免费会员 (Lifetime Access)。</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <ReferralStatsCard />

                    {/* Placeholder for Savings Report Card */}
                    <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-xl border border-orange-200">
                        <h3 className="font-bold text-orange-900 mb-2">晒出你的省钱战报</h3>
                        <p className="text-sm text-orange-800 mb-4">
                            生成一张专属战报，告诉朋友你省了多少钱。
                        </p>
                        <button className="w-full bg-white text-orange-600 font-medium py-2 rounded-lg hover:bg-orange-50 transition-colors">
                            生成战报 (即将上线)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
