'use client'

import { useState, useEffect } from 'react'
import { X, Gift, Share2 } from 'lucide-react'
import { generateReferralCode } from '@/lib/referralService'
import { useAuth } from '@/components/AuthProvider'

interface GiftModalProps {
    isOpen: boolean
    onClose: () => void
    savedAmount: number
}

export default function GiftModal({ isOpen, onClose, savedAmount }: GiftModalProps) {
    const { user } = useAuth()
    const [referralCode, setReferralCode] = useState('')

    useEffect(() => {
        if (user && isOpen) {
            generateReferralCode(user.uid, user.email || undefined).then(setReferralCode)
        }
    }, [user, isOpen])

    if (!isOpen) return null

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${referralCode}`
        : ''

    const handleShare = async () => {
        const shareData = {
            title: '我刚刚省了一笔钱！',
            text: `太棒了！我刚刚通过 FinleyBook 找回了 $${savedAmount} 的冤枉钱。你也快查一下，送你 1 个月免费试用：`,
            url: shareUrl,
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
                onClose()
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
            alert('链接已复制，快去分享给朋友吧！')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-md">
                        <Gift className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">太棒了！🎉</h2>
                    <p className="text-indigo-100">你刚刚省下了 ${savedAmount}！</p>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 text-center mb-6">
                        你的朋友可能也在为这笔冤枉钱买单。<br />
                        <span className="font-semibold text-gray-900">送朋友一张 $9 抵用券</span>，帮他们也省省钱。
                    </p>

                    <button
                        onClick={handleShare}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Share2 size={20} />
                        送朋友 $9 抵用券
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        朋友省钱，你得免单 (Give 1, Get 1)
                    </p>
                </div>
            </div>
        </div>
    )
}
