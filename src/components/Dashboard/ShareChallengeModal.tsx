'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Download, Instagram, MessageCircle, Link2, Check } from 'lucide-react'
import { useRef, useState, useCallback } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'
import toast from 'react-hot-toast'

interface ShareChallengeModalProps {
    isOpen: boolean
    onClose: () => void
    dailyTarget: number
    achieved: number
    /** Optional: streak count to display */
    streak?: number
    /** Optional: custom title */
    title?: string
    /** Optional: custom subtitle */
    subtitle?: string
}

let html2canvasPromise: Promise<typeof import('html2canvas').default> | null = null
const loadHtml2Canvas = () => {
    if (!html2canvasPromise) {
        html2canvasPromise = import('html2canvas').then(m => m.default)
    }
    return html2canvasPromise
}

export default function ShareChallengeModal({
    isOpen,
    onClose,
    dailyTarget,
    achieved,
    streak,
    title = 'MISSION\nCOMPLETED',
    subtitle = 'I just turned my dream into data. 🚀'
}: ShareChallengeModalProps) {
    const { formatAmount } = useCurrency()
    const cardRef = useRef<HTMLDivElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [copied, setCopied] = useState(false)

    const captureCard = useCallback(async (): Promise<Blob | null> => {
        if (!cardRef.current) return null
        try {
            const html2canvas = await loadHtml2Canvas()
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
            })
            return new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
            })
        } catch (error) {
            console.error('Failed to capture card:', error)
            return null
        }
    }, [])

    const handleDownload = useCallback(async () => {
        setIsCapturing(true)
        try {
            const blob = await captureCard()
            if (!blob) {
                toast.error('Failed to capture image')
                return
            }
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `finleybook-achievement-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            toast.success('Image saved!')
        } finally {
            setIsCapturing(false)
        }
    }, [captureCard])

    const handleNativeShare = useCallback(async () => {
        setIsCapturing(true)
        try {
            const blob = await captureCard()
            if (!blob) {
                toast.error('Failed to capture image')
                return
            }

            if (typeof navigator.share === 'function') {
                const file = new File([blob], 'finleybook-achievement.png', { type: 'image/png' })
                const canShare = typeof navigator.canShare === 'function'
                    ? navigator.canShare({ files: [file] })
                    : true
                if (canShare) {
                    await navigator.share({
                        files: [file],
                        title: 'My FinleyBook Achievement',
                        text: `I saved ${formatAmount(achieved)} today! Track your finances with FinleyBook 🚀`,
                    })
                    toast.success('Shared successfully!')
                    return
                }
            }
            // Fallback: download
            await handleDownload()
        } catch (error: unknown) {
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Share cancelled')
            }
        } finally {
            setIsCapturing(false)
        }
    }, [captureCard, formatAmount, achieved, handleDownload])

    const handleWhatsApp = useCallback(() => {
        const text = encodeURIComponent(
            `🎯 I just hit my finance goal — saved ${formatAmount(achieved)} today!\n\nTrack your money with FinleyBook: https://finleybook.com`
        )
        window.open(`https://wa.me/?text=${text}`, '_blank')
    }, [formatAmount, achieved])

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(
                `🎯 I saved ${formatAmount(achieved)} today! Track your finances with FinleyBook: https://finleybook.com`
            )
            setCopied(true)
            toast.success('Copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }, [formatAmount, achieved])

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

                        {/* SHAREABLE CARD AREA */}
                        <div
                            ref={cardRef}
                            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <div className="absolute top-8 left-8 w-24 h-24 border-2 border-white/30 rounded-full" />
                                <div className="absolute bottom-12 right-8 w-16 h-16 border-2 border-white/20 rounded-full" />
                                <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/10 rounded-full blur-sm" />
                            </div>
                            <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 blur-[80px] rounded-full mix-blend-overlay animate-pulse" />

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-6 tracking-widest border border-white/30">
                                    #FINLEYMISSIONS
                                </span>

                                <h2 className="text-4xl font-black mb-2 leading-none whitespace-pre-line">
                                    {title}
                                </h2>

                                <div className="my-8 relative">
                                    <div className="absolute inset-0 bg-white blur-xl opacity-30 animate-pulse rounded-full" />
                                    <div className="relative text-5xl font-black text-yellow-300 drop-shadow-xl">
                                        {formatAmount(achieved)}
                                    </div>
                                    <div className="text-sm font-medium opacity-80 mt-1">
                                        Earned & Saved Today
                                    </div>
                                </div>

                                {streak && streak > 1 && (
                                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/80 rounded-full text-sm font-bold">
                                        🔥 {streak} Day Streak
                                    </div>
                                )}

                                <p className="text-lg font-medium leading-relaxed max-w-[200px] mx-auto">
                                    {subtitle}
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
                                Share your achievement & inspire others
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button
                                    onClick={handleNativeShare}
                                    disabled={isCapturing}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    <Share2 size={18} />
                                    {isCapturing ? 'Capturing...' : 'Share'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isCapturing}
                                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 active:scale-[0.98]"
                                >
                                    <Download size={18} />
                                    Save
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => {
                                        const text = encodeURIComponent(`🎯 I saved ${formatAmount(achieved)} today! #FinleyBook`)
                                        window.open(`https://www.instagram.com/`, '_blank')
                                        toast('Open Instagram & paste from clipboard', { icon: '📷' })
                                        navigator.clipboard?.writeText(`🎯 I saved ${formatAmount(achieved)} today! #FinleyBook`)
                                    }}
                                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <Instagram size={16} />
                                    Story
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="flex items-center justify-center gap-1.5 bg-green-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center justify-center gap-1.5 bg-gray-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
