'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle2, Crown, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProUpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    featureName?: string
}

export default function ProUpgradeModal({ isOpen, onClose, featureName = 'This feature' }: ProUpgradeModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    const benefits = [
        "Unlimited AI Insights & Chat",
        "Custom Vision Board Backgrounds",
        "Advanced Wealth Analytics",
        "Priority Support",
        "Multiple Goal Tracking"
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>

                            {/* Header Gradient */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/30 rounded-full blur-xl -ml-5 -mb-5"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-xl ring-1 ring-white/30">
                                        <Crown size={28} className="text-yellow-300 fill-yellow-300" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Unlock Pro Access</h2>
                                    <p className="text-indigo-100 text-sm max-w-xs mx-auto">
                                        <span className="font-semibold text-white">{featureName}</span> is available exclusively to Pro members.
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h3 className="text-gray-900 font-bold mb-4 text-sm uppercase tracking-wide">What you get with Pro:</h3>
                                <div className="space-y-3 mb-8">
                                    {benefits.map((benefit, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-3 text-gray-600"
                                        >
                                            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                            <span className="text-sm font-medium">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    onClick={() => router.push('/wallet')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all group shadow-lg shadow-indigo-500/20"
                                >
                                    <span>Upgrade Now</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>

                                <p className="text-center mt-4 text-xs text-gray-400">
                                    7-day money-back guarantee. Cancel anytime.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
