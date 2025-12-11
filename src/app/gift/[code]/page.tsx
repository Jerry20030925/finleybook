'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check, Shield, Zap, Lock, TrendingUp, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function FriendLandingPage() {
    const params = useParams()
    const code = params.code as string
    const [claimed, setClaimed] = useState(false)
    const [currency, setCurrency] = useState('USD')
    const [value, setValue] = useState('9.99')

    // Simulate GeoIP / Currency detection
    useEffect(() => {
        // In a real app, use a library or API
        const userLang = navigator.language
        if (userLang.includes('AU')) {
            setCurrency('AUD')
            setValue('14.99')
        } else if (userLang.includes('CN')) {
            setCurrency('CNY')
            setValue('68.00')
        } else if (userLang.includes('GB')) {
            setCurrency('GBP')
            setValue('7.99')
        }
    }, [])

    const handleClaim = () => {
        // In a real app, this would set a cookie or redirect to signup with code
        setClaimed(true)
        // Simulate redirect delay
        setTimeout(() => {
            window.location.href = `/?ref=${code}&promo=GIFT30`
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black -z-10" />
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full text-center relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide">
                        ✨ YOU'VE RECEIVED A GIFT
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                        30 Days of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                            FinleyBook Pro
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Value <span className="text-white font-bold">{currency} ${value}</span> · Free for you
                    </p>
                </motion.div>

                {/* The Gift Card Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
                    className="relative mb-10 perspective-1000"
                >
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="flex justify-between items-start mb-8">
                            <div className="text-left">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">GIFT FROM</div>
                                <div className="text-lg font-bold text-white">Your Friend</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">EXPIRES</div>
                                <div className="text-lg font-bold text-red-500">48 Hours</div>
                            </div>
                        </div>

                        <div className="text-left">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">PRO ACCESS</div>
                            <div className="flex gap-2 text-xs text-gray-400">
                                <span className="bg-gray-800 px-2 py-1 rounded">AI Insights</span>
                                <span className="bg-gray-800 px-2 py-1 rounded">Unlimited</span>
                                <span className="bg-gray-800 px-2 py-1 rounded">No Ads</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        onClick={handleClaim}
                        disabled={claimed}
                        className="w-full bg-white text-black text-lg font-bold py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-6 relative overflow-hidden"
                    >
                        {claimed ? (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-6 h-6" /> Claimed! Redirecting...
                            </span>
                        ) : (
                            <span>Claim My 30 Days Free</span>
                        )}
                    </button>

                    <p className="text-sm text-gray-500">
                        No credit card required · Cancel anytime
                    </p>
                </motion.div>

                {/* Social Proof Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 pt-8 border-t border-gray-800"
                >
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black" />
                            ))}
                        </div>
                        <span>Joined by 8,421+ people this week</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
