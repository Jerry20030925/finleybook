'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Gift, Copy, Check, Mail, MessageCircle, Share2 } from 'lucide-react'
import { useAuth } from './AuthProvider'
import toast from 'react-hot-toast'

export default function ReferralGiftCard() {
    const { user } = useAuth()
    const [copied, setCopied] = useState(false)
    const [giftsRemaining, setGiftsRemaining] = useState(3) // TODO: Get from database

    // Generate referral link
    const referralCode = user?.uid?.slice(0, 8) || 'DEMO'
    const referralLink = `https://finleybook.vercel.app?ref=${referralCode}`

    // Pre-written messages
    const messages = {
        generic: `Hey! I've been using FinleyBook to manage my money. Here is a 30-day Pro pass (worth $9.99) on me. No bank linking needed. 🎁 ${referralLink}`,
        friends: `Found this app that helps track spending without connecting bank accounts. It's super fast. Here's a free month to try it out. ${referralLink}`
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        toast.success('Link copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = (platform: 'email' | 'sms' | 'generic') => {
        const message = messages.generic

        switch (platform) {
            case 'email':
                window.location.href = `mailto:?subject=Gift: 30 Days of FinleyBook Pro&body=${encodeURIComponent(message)}`
                break
            case 'sms':
                window.location.href = `sms:?body=${encodeURIComponent(message)}`
                break
            case 'generic':
                if (navigator.share) {
                    navigator.share({
                        title: 'Gift: 30 Days of FinleyBook Pro',
                        text: message,
                    })
                } else {
                    handleCopy()
                }
                break
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gift 30 Days of Pro
                </h1>
                <p className="text-gray-600">
                    Help your friends stop losing money. For every friend who joins, you get 1 free month.
                </p>
            </motion.div>

            {/* Gift Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mb-8"
            >
                {/* Card with ticket-style cutouts */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                    {/* Left cutout */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-r-full -ml-3" />

                    {/* Right cutout */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-l-full -mr-3" />

                    {/* Dashed line */}
                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-gray-700" />

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Top section */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Gift className="text-yellow-400" size={24} />
                                    <span className="text-yellow-400 font-bold text-sm">GIFT CARD</span>
                                </div>
                                <h2 className="text-white text-2xl font-bold">FinleyBook Pro</h2>
                                <p className="text-gray-400 text-sm mt-1">30-Day Access Pass</p>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-400 text-3xl font-bold">$9.99</div>
                                <div className="text-gray-500 text-xs">Value</div>
                            </div>
                        </div>

                        {/* Bottom section */}
                        <div className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-xs mb-1">Your Gifts Remaining</div>
                                    <div className="text-white text-xl font-bold">{giftsRemaining}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 text-xs mb-1">Referral Code</div>
                                    <div className="text-white font-mono text-sm">{referralCode}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Share Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-8"
            >
                <button
                    onClick={() => handleShare('generic')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    <Share2 size={20} />
                    Send Gift to Friends
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleShare('email')}
                        className="bg-white border-2 border-gray-200 hover:border-indigo-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Mail size={18} />
                        Email
                    </button>
                    <button
                        onClick={() => handleShare('sms')}
                        className="bg-white border-2 border-gray-200 hover:border-indigo-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <MessageCircle size={18} />
                        Message
                    </button>
                </div>
            </motion.div>

            {/* Copy Link */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-4 mb-8"
            >
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-mono"
                    />
                    <button
                        onClick={handleCopy}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </motion.div>

            {/* How it Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 border-2 border-gray-100"
            >
                <h3 className="font-bold text-gray-900 mb-4">How it Works</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-indigo-600 font-bold">1</span>
                        </div>
                        <p className="text-xs text-gray-600">Share your gift link</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-indigo-600 font-bold">2</span>
                        </div>
                        <p className="text-xs text-gray-600">Friend gets 30 days free</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-indigo-600 font-bold">3</span>
                        </div>
                        <p className="text-xs text-gray-600">You earn 1 free month</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats (Optional) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center"
            >
                <p className="text-sm text-gray-500">
                    You've helped <span className="font-bold text-indigo-600">0 friends</span> save money
                </p>
            </motion.div>
        </div>
    )
}
