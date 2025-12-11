'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Share2, Ticket, Clock, Users, MessageCircle, ChevronDown } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import toast from 'react-hot-toast'

interface ReferralGiftCardProps {
    code?: string
    forceShow?: boolean
    onExpire?: () => void
}

export default function ReferralGiftCard({ code, forceShow = false, onExpire }: ReferralGiftCardProps) {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [copied, setCopied] = useState(false)
    const [giftsRemaining, setGiftsRemaining] = useState(3)
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null)
    const [isExpired, setIsExpired] = useState(false)
    const [socialProofCount, setSocialProofCount] = useState(847)
    const [showPreview, setShowPreview] = useState(false)

    // Use provided code or fallback to UID slice (or default)
    const referralCode = code || user?.uid?.slice(0, 8) || 'dI1Qc6MI'
    // Use the new landing page route
    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/gift/${referralCode}`
        : `https://finleybook.com/gift/${referralCode}`

    // Viral Copy - Optimized for "Friend-to-Friend" trust
    const messages = {
        generic: `Hey! I found this AI wealth app called FinleyBook 🚀. I have 3 Pro Passes left to gift. Use my code ${referralCode} for a free month:`,
        whatsapp: `Hey! I found this AI wealth app called FinleyBook 🚀. I have 3 Pro Passes left to gift. Use my code *${referralCode}* for a free month: ${referralLink}`
    }

    // Dynamic Countdown Timer Logic (New User Restriction: 48h)
    useEffect(() => {
        if (!user) return

        // Get account creation time
        // Note: Firebase Auth user object usually has metadata.creationTime (string)
        // If not available, fallback to a "recent" time for demo or handle gracefully
        const creationTimeStr = user.metadata?.creationTime || user.createdAt?.toDate?.()?.toString() || new Date().toISOString()
        const creationTime = new Date(creationTimeStr).getTime()
        const deadline = creationTime + (48 * 60 * 60 * 1000) // 48 hours from creation

        const updateTimer = () => {
            const now = Date.now()
            const diff = deadline - now

            if (diff <= 0) {
                setIsExpired(true)
                setTimeLeft({ days: 0, hours: 0, minutes: 0 })
                if (onExpire) onExpire()
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            setTimeLeft({ days, hours, minutes })
        }

        updateTimer() // Initial call
        const timer = setInterval(updateTimer, 60000) // Update every minute
        return () => clearInterval(timer)
    }, [user])

    // Social Proof Ticker Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setSocialProofCount(prev => prev + Math.floor(Math.random() * 3))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(`${messages.generic} ${referralLink}`)
        setCopied(true)
        toast.success('Gift code copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = (platform: 'wechat' | 'whatsapp' | 'copy') => {
        switch (platform) {
            case 'wechat':
                handleCopy() // WeChat usually requires manual paste
                break
            case 'whatsapp':
                window.location.href = `whatsapp://send?text=${encodeURIComponent(messages.whatsapp)}`
                break
            case 'copy':
                handleCopy()
                break
        }
    }

    // Avatar Stack Component
    const AvatarStack = () => (
        <div className="flex -space-x-2 mr-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 40}`}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    )

    // Hide component if expired (New User Restriction), UNLESS forceShow is true
    // if (isExpired && !forceShow) return null

    // Determine urgency level
    const isUrgent = timeLeft && timeLeft.days === 0 && timeLeft.hours < 12

    return (
        <div className="max-w-md mx-auto p-4">
            {/* Header with Reframed Concept */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    New User Welcome Gift
                </h1>
                <p className="text-sm text-gray-500">
                    Gift Pro to friends. You get <span className="font-bold text-orange-500">1 Month Pro</span>.
                </p>
            </motion.div>

            {/* Black Gold Gift Card - Ultimate Version */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative mb-8 filter drop-shadow-2xl"
            >
                {/* ... (omitting unchanged parts for brevity if possible, but replace_file_content needs contiguous block) ... */}
                {/* Actually, the replace_file_content needs to be precise. I will target the specific blocks. */}
                {/* Wait, I can use multi_replace for this as "Lifetime" appears in multiple places. */}

                {/* Countdown Badge on Card */}
                {timeLeft && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full text-xs font-bold shadow-sm border flex items-center gap-1 ${isUrgent ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        <Clock size={12} />
                        <span>
                            {isUrgent ? '🔥 Last ' : 'Ends in '}
                            {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                            {timeLeft.hours}h {timeLeft.minutes}m
                        </span>
                    </div>
                )}

                {/* Card Container */}
                <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl overflow-hidden text-white border border-yellow-500/30 shadow-2xl">
                    {/* Golden Glow Effects */}
                    <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-yellow-600/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Limited Edition Watermark */}
                    <div className="absolute top-4 right-4 text-yellow-500/10 text-4xl font-black italic transform -rotate-12 pointer-events-none select-none">
                        LIMITED
                    </div>

                    {/* Ticket Cutouts & Dashed Line */}
                    <div className="absolute top-1/2 left-0 w-4 h-8 bg-white dark:bg-gray-900 rounded-r-full -translate-y-1/2 -ml-2 z-10" />
                    <div className="absolute top-1/2 right-0 w-4 h-8 bg-white dark:bg-gray-900 rounded-l-full -translate-y-1/2 -mr-2 z-10" />
                    <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-yellow-500/20" />

                    {/* Top Section */}
                    <div className="p-6 pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Ticket className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-400 tracking-wider">NEW USER GIFT</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                                    FinleyBook Pro
                                </h2>
                                <p className="text-gray-400 text-xs mt-0.5">30-Day Access Pass</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-400">$9.99</div>
                                <div className="text-yellow-500/60 text-[10px] uppercase tracking-wide">VALUE</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-6 pt-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">YOU HAVE</p>
                                <div className="text-2xl font-bold text-red-500 flex items-center gap-2 drop-shadow-md">
                                    {giftsRemaining === 1 ? 'Last Gift Remaining!' : `${giftsRemaining} Gifts Remaining`}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">CODE</p>
                                <div className="font-mono text-sm text-yellow-400 bg-yellow-900/30 px-3 py-1.5 rounded border border-yellow-500/30 tracking-wider">
                                    {referralCode}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Gamified Progress Bar */}
            <div className="mb-8 relative px-2">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">2/3 Friends Gifted</span>
                    <span className="text-gray-500">66%</span>
                </div>
                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-visible">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-orange-500/30" style={{ width: '66%' }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-sm z-10"></div>
                    </div>

                    {/* Pulsing Treasure Chest */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 group cursor-pointer">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            Unlock 1 Month Pro
                        </div>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5
                            }}
                            className="text-3xl filter drop-shadow-md z-20 relative"
                        >
                            🎁
                        </motion.div>
                        {/* Glow behind chest */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400/30 blur-xl rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-sm mt-3 text-center">
                    <span className="font-bold text-orange-600">Only 1 left</span> to unlock 1 Month Pro!
                </p>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3 mb-6">
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleShare('copy')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied!' : 'Copy Gift Link'}
                </motion.button>

                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => handleShare('whatsapp')}
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                        <Share2 size={18} />
                        WhatsApp
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => handleShare('wechat')}
                        className="bg-[#07C160] hover:bg-[#06ad56] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                    >
                        <MessageCircle size={18} />
                        WeChat
                    </motion.button>
                </div>
            </div>

            {/* Message Preview */}
            <div className="mb-8">
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center justify-center gap-1 text-xs text-gray-400 mx-auto hover:text-gray-600 transition-colors"
                >
                    <span>Preview Message</span>
                    <ChevronDown size={12} className={`transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500 italic text-center">
                                "{messages.generic}"
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Social Proof Ticker */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3"
            >
                <AvatarStack />
                <div className="text-xs text-gray-600 font-medium">
                    <span className="font-bold text-gray-900">{socialProofCount.toLocaleString()}</span> users have gifted Pro today
                </div>
            </motion.div>
        </div>
    )
}
