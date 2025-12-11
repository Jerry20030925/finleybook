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
        ? `${window.location.origin}/redeem?code=${referralCode}`
        : ''

    const handleShare = async () => {
        const shareData = {
            title: '🎁 You’ve received a 30-day FinleyBook Pro gift',
            text: `I'm using FinleyBook to save money. Here is a 30-day Pro Pass for you (Worth $9.99). Code: ${referralCode}`,
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
            alert('Gift link copied! Send it to your friend.')
            onClose()
        }
    }

    const handleWhatsApp = () => {
        const text = `Hi! I'm using FinleyBook to save money. Here is a 30-day Pro Pass for you (Worth $9.99). Claim it here: ${shareUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const handleWeChat = () => {
        // WeChat doesn't have a direct web share API like WhatsApp, so we copy to clipboard
        const text = `Hi! I'm using FinleyBook to save money. Here is a 30-day Pro Pass for you (Worth $9.99). Claim it here: ${shareUrl}`
        navigator.clipboard.writeText(text)
        alert('Message copied! Open WeChat to paste and send.')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Premium Gift Card Header */}
                <div className="bg-[#1a1a1a] p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 to-purple-600/20 opacity-50"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="text-yellow-400 font-bold tracking-widest text-xs mb-2">GIFT CARD</div>
                        <h2 className="text-2xl font-bold text-white mb-1">FinleyBook Pro</h2>
                        <p className="text-gray-400 text-sm mb-4">30-Day Access Pass</p>

                        <div className="bg-white/10 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                            <p className="text-xs text-gray-400 mb-1">YOUR CODE</p>
                            <p className="text-xl font-mono font-bold text-yellow-400 tracking-wider select-all">
                                {referralCode || 'LOADING...'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Dynamic Reward Prompt */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-900">2/3 Friends Gifted</span>
                            <span className="text-indigo-600">66%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full w-2/3 relative">
                                <div className="absolute -right-1 -top-1 w-4 h-4 bg-white rounded-full border-2 border-red-500"></div>
                            </div>
                        </div>
                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                            <Gift size={12} />
                            Invite 1 more friend to get Lifetime Pro forever.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleShare}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Share2 size={20} />
                            Copy Gift Link
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleWhatsApp}
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                WhatsApp
                            </button>
                            <button
                                onClick={handleWeChat}
                                className="w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                WeChat
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        They get Pro, you get rewards. Win-win.
                    </p>
                </div>
            </div>
        </div>
    )
}
