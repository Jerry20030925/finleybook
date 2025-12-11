'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Download, Instagram } from 'lucide-react'
import { useRef } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

interface ShareChallengeModalProps {
    isOpen: boolean
    onClose: () => void
    dailyTarget: number
    achieved: number
}

export default function ShareChallengeModal({ isOpen, onClose, dailyTarget, achieved }: ShareChallengeModalProps) {
    const { formatAmount } = useCurrency()
    const cardRef = useRef<HTMLDivElement>(null)

    // In a real app, we would use html2canvas to export cardRef
    const handleDownload = () => {
        // Simulation
        alert("Image saved! (Simulated)")
    }

    const handleShare = (platform: string) => {
        // Simulation
        alert(`Sharing to ${platform}...`)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* INSTAGRAM STORY PREVIEW AREA */}
                        <div
                            ref={cardRef}
                            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 blur-[80px] rounded-full mix-blend-overlay animate-pulse"></div>

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-6 tracking-widest border border-white/30">
                                    #FINLEYMISSIONS
                                </span>

                                <h2 className="text-4xl font-black mb-2 leading-none">
                                    MISSION<br />COMPLETED
                                </h2>

                                <div className="my-8 relative">
                                    <div className="absolute inset-0 bg-white blur-xl opacity-30 animate-pulse rounded-full"></div>
                                    <div className="relative text-5xl font-black text-yellow-300 drop-shadow-xl">
                                        {formatAmount(achieved)}
                                    </div>
                                    <div className="text-sm font-medium opacity-80 mt-1">
                                        Earned & Saved Today
                                    </div>
                                </div>

                                <p className="text-lg font-medium leading-relaxed max-w-[200px] mx-auto">
                                    I just turned my dream into data. 🚀
                                </p>
                            </div>

                            {/* Footer Branding */}
                            <div className="absolute bottom-6 flex items-center gap-2 opacity-80">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">
                                    F
                                </div>
                                <span className="font-bold tracking-wide text-sm">FinleyBook</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 bg-white">
                            <p className="text-center text-sm font-medium text-gray-500 mb-4">
                                Inspire others & unlock streak bonus
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleShare('Instagram')}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    <Instagram size={18} />
                                    Story
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    <Download size={18} />
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
