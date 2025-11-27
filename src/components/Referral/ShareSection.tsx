'use client'

import { useState, useEffect } from 'react'
import { generateReferralCode } from '@/lib/referralService'
import { useAuth } from '@/components/AuthProvider'
import { Copy, Check, Share2 } from 'lucide-react'

export default function ShareSection() {
    const { user } = useAuth()
    const [referralCode, setReferralCode] = useState('')
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            generateReferralCode(user.uid, user.email || undefined).then(code => {
                setReferralCode(code)
                setLoading(false)
            })
        }
    }, [user])

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${referralCode}`
        : ''

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        const shareData = {
            title: '拯救好友的钱包',
            text: '兄弟，我刚用这个查了一下，发现我有三个订阅完全忘了取消，白扣了半年钱... 你也快查一下，反正试用不要钱：',
            url: shareUrl,
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            handleCopy()
        }
    }

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">送朋友 1 个月免费试用</h3>
            <p className="text-indigo-100 mb-6 text-sm">
                每邀请一位朋友注册，你也能获得 1 个月免费会员（价值 $9.99）。
            </p>

            <div className="bg-white/10 backdrop-blur-sm p-1 rounded-lg flex items-center border border-white/20 mb-4">
                <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent border-none text-white text-sm flex-1 px-3 focus:ring-0 truncate"
                />
                <button
                    onClick={handleCopy}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? '已复制' : '复制'}
                </button>
            </div>

            <button
                onClick={handleShare}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Share2 size={18} />
                立即分享给好友
            </button>
        </div>
    )
}
