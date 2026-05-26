'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Gift, CheckCircle, ArrowRight, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { LIST_STAGGER_VARIANTS, MOTION_SPRING } from '@/lib/motionTokens'

function RedeemContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, loading } = useAuth()
    const code = searchParams.get('code')
    const [redeeming, setRedeeming] = useState(false)
    const [redeemed, setRedeemed] = useState(false)

    useEffect(() => {
        if (!code) {
            router.push('/')
        }
    }, [code, router])

    const handleRedeem = async () => {
        if (!user) {
            // Redirect to signup with code
            router.push(`/auth?mode=signup&referralCode=${code}`)
            return
        }

        setRedeeming(true)
        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/referral/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            })

            const data = await response.json()

            if (response.ok) {
                setRedeemed(true)
                toast.success('Gift redeemed successfully!')
                setTimeout(() => router.push('/dashboard'), 3000)
            } else {
                toast.error(data.error || 'Failed to redeem gift')
            }
        } catch (error) {
            console.error('Redemption error:', error)
            toast.error('Something went wrong')
        } finally {
            setRedeeming(false)
        }
    }

    if (!code) return null

    const features = [
        'Unlimited AI Price Finder searches',
        'Double Cashback Rewards',
        'Priority Support',
        'Advanced Analytics'
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...MOTION_SPRING.modal }}
            >
                {/* Hero Section */}
                <motion.div
                    className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>

                    {/* Floating sparkles */}
                    <motion.div
                        className="absolute top-4 right-8 text-white/30"
                        animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-6 left-10 text-white/20"
                        animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        <Sparkles className="w-5 h-5" />
                    </motion.div>

                    <div className="relative z-10">
                        <motion.div
                            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-md shadow-lg"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ ...MOTION_SPRING.badge, delay: 0.2 }}
                        >
                            <Gift className="text-white w-10 h-10" />
                        </motion.div>
                        <motion.h1
                            className="text-3xl font-bold text-white mb-2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                        >
                            You've received a gift!
                        </motion.h1>
                        <motion.p
                            className="text-indigo-100 text-lg"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.4 }}
                        >
                            30 Days of FinleyBook Pro
                        </motion.p>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {redeemed ? (
                            <motion.div
                                key="redeemed"
                                className="text-center py-8"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ ...MOTION_SPRING.modal }}
                            >
                                <motion.div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ ...MOTION_SPRING.badge, delay: 0.15 }}
                                >
                                    <CheckCircle className="text-green-600 w-8 h-8" />
                                </motion.div>
                                <motion.h2
                                    className="text-2xl font-bold text-gray-900 mb-2"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    Gift Activated!
                                </motion.h2>
                                <motion.p
                                    className="text-gray-600 mb-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    Your account has been upgraded to Pro.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center justify-center w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors btn-press"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="redeem-form"
                                initial="hidden"
                                animate="show"
                                variants={LIST_STAGGER_VARIANTS.container}
                            >
                                <motion.div
                                    variants={LIST_STAGGER_VARIANTS.item}
                                    className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-center gap-3"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 12, -12, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Clock className="text-orange-500 w-5 h-5 flex-shrink-0" />
                                    </motion.div>
                                    <p className="text-sm text-orange-700 font-medium">
                                        This gift expires in 48 hours. Claim it now!
                                    </p>
                                </motion.div>

                                <motion.div variants={LIST_STAGGER_VARIANTS.item} className="space-y-4 mb-8">
                                    <h3 className="font-semibold text-gray-900">What's included:</h3>
                                    <ul className="space-y-3">
                                        {features.map((item, i) => (
                                            <motion.li
                                                key={i}
                                                className="flex items-center gap-3 text-gray-600"
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.08, ...MOTION_SPRING.listItem }}
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.55 + i * 0.08, ...MOTION_SPRING.badge }}
                                                >
                                                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                                                </motion.div>
                                                {item}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>

                                <motion.button
                                    variants={LIST_STAGGER_VARIANTS.item}
                                    onClick={handleRedeem}
                                    disabled={redeeming}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed btn-press animate-glow-pulse"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {redeeming ? (
                                        <motion.div
                                            className="rounded-full h-5 w-5 border-b-2 border-white"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                    ) : (
                                        <>
                                            {user ? 'Activate Pro Now' : 'Sign Up to Claim'}
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.div>
                                        </>
                                    )}
                                </motion.button>

                                {!user && (
                                    <motion.p
                                        className="text-center mt-4 text-sm text-gray-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        Already have an account? <Link href={`/auth?mode=signin&referralCode=${code}`} className="text-indigo-600 font-medium hover:underline">Log in</Link>
                                    </motion.p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

export default function RedeemPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
            <RedeemContent />
        </Suspense>
    )
}
