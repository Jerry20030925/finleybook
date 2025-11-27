'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Gift, Copy, Check, Mail, MessageCircle, Share2, Ticket } from 'lucide-react'
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
        <div className="max-w-md mx-auto p-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Gift 30 Days of Pro
                </h1>
                <p className="text-sm text-gray-600">
                    Help your friends stop losing money. For every friend who joins, you get 1 free month.
                </p>
            </motion.div>

            {/* Black Gold Gift Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative mb-6 filter drop-shadow-xl"
            >
                {/* Card Container */}
                <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl overflow-hidden text-white">
                    {/* Golden Glow Effects */}
                    <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-yellow-600/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Ticket Cutouts & Dashed Line */}
                    <div className="absolute top-1/2 left-0 w-4 h-8 bg-white rounded-r-full -translate-y-1/2 -ml-2 z-10" />
                    <div className="absolute top-1/2 right-0 w-4 h-8 bg-white rounded-l-full -translate-y-1/2 -mr-2 z-10" />
                    <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-gray-700/50" />

                    {/* Top Section */}
                    <div className="p-6 pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Ticket className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-bold text-yellow-500 tracking-wider">GIFT CARD</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">FinleyBook Pro</h2>
                                <p className="text-gray-400 text-xs mt-0.5">30-Day Access Pass</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-500">$9.99</div>
                                <div className="text-gray-500 text-[10px] uppercase tracking-wide">Value</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-6 pt-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">You have</p>
                                <div className="text-lg font-bold text-white flex items-center">
                                    {giftsRemaining} Gifts Remaining
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Code</p>
                                <div className="font-mono text-sm text-yellow-500/90 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                    {referralCode}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Share Button */}
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleShare('generic')}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl mb-6 active:scale-95"
            >
                <Share2 size={18} />
                Send Gift to Friends
            </motion.button>

            {/* 3-Step Logic */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100"
            >
                <div className="flex justify-between items-start text-center relative">
                    {/* Connecting Line */}
                    <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-200 -z-10" />

                    <div className="flex flex-col items-center flex-1">
                        <div className="w-8 h-8 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center mb-2 z-10">
                            <span className="text-sm font-bold text-gray-900">1</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 leading-tight">Share Gift</p>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center mb-2 z-10 shadow-md">
                            <span className="text-sm font-bold">2</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 leading-tight">Friend Joins</p>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mb-2 z-10 shadow-md">
                            <span className="text-sm font-bold">3</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 leading-tight">Get Free Month</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
