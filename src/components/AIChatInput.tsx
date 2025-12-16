'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { addTransaction } from '@/lib/dataService'
import toast from 'react-hot-toast'
import { useSubscription } from './SubscriptionProvider'
import ProUpgradeModal from './ProUpgradeModal'

interface ParsedTransaction {
    amount: number
    currency: string
    merchant: string
    category: string
    date: string
    description: string
    items: string[]
    emotional_context: 'happy' | 'stress' | 'impulse' | 'sad' | 'neutral'
}

interface AIChatInputProps {
    isOpen?: boolean
    onClose?: () => void
    trigger?: React.ReactNode // Optional custom trigger
}

export default function AIChatInput({ isOpen: externalIsOpen, onClose: externalOnClose, trigger }: AIChatInputProps = {}) {
    const { user } = useAuth()
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    // Controlled vs Uncontrolled logic
    const isControlled = externalIsOpen !== undefined
    const isOpen = isControlled ? externalIsOpen : internalIsOpen
    const setIsOpen = (value: boolean) => {
        if (isControlled) {
            if (!value && externalOnClose) externalOnClose()
        } else {
            setInternalIsOpen(value)
        }
    }
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null)
    const [showBubble, setShowBubble] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const { isProMember } = useSubscription()

    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Show bubble hint after 3 seconds on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setShowBubble(true)
        }, 3000)
        return () => clearTimeout(timer)
    }, [isOpen])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            setShowBubble(false)
        }
    }, [isOpen])

    if (!user) return null

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        // Removed strict client-side blocking to allow limited free usage
        /* if (!isProMember) {
            setShowUpgradeModal(true)
            return
        } */

        setIsLoading(true)
        setParsedTx(null) // Reset previous result

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/ai/parse-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ input }),
            })

            const data = await response.json()

            if (response.status === 403) {
                setShowUpgradeModal(true);
                toast.error("Monthly limit reached 🔒")
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process')
            }

            if (data.data.error) {
                toast.error(data.data.error)
            } else {
                setParsedTx(data.data)
            }

        } catch (error) {
            console.error('AI parse error:', error)
            toast.error('Could not understand that. Try again?')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirm = async () => {
        if (!parsedTx || !user) return

        try {
            await addTransaction({
                userId: user.uid,
                amount: parsedTx.amount,
                category: parsedTx.category, // Saving the raw string for better UX if keys aren't perfect
                description: parsedTx.description || parsedTx.merchant,
                date: new Date(parsedTx.date),
                type: 'expense', // Default to expense for now
                emotionalTag: parsedTx.emotional_context
            })

            toast.success('Transaction saved!', {
                icon: '🎉',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            })
            setParsedTx(null)
            setInput('')
            setIsOpen(false)

        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save transaction')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="print:hidden">
            {/* Overlay */}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Bubble Hint */}
            <AnimatePresence>
                {!isOpen && showBubble && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-24 right-8 z-40 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-cyan-100 max-w-[200px]"
                    >
                        <div className="text-sm font-medium">Record expenses in seconds! ⚡️</div>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-b border-r border-cyan-100"></div>
                        <button
                            onClick={() => setShowBubble(false)}
                            className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-0.5 text-gray-500 hover:bg-gray-300"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button (Custom or Floating FAB) */}
            {trigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            ) : !isControlled && (
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl text-white transition-all ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={false}
                    animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
                >
                    {isOpen ? <XMarkIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6 animate-pulse" />}
                </motion.button>
            )}

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-24 z-50 md:w-96 bg-[#0f111a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col font-sans origin-bottom-right"
                        style={{ maxHeight: '80vh', height: '600px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 p-4 text-white shadow-lg relative overflow-hidden backdrop-blur-md">
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <SparklesIcon className="w-5 h-5 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Finley AI</h3>
                                        <p className="text-[10px] text-cyan-100 uppercase tracking-wider">Your Financial Brain</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 opacity-70" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col">
                            {parsedTx ? (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 p-5 rounded-2xl"
                                >
                                    <div className="text-sm text-cyan-300 mb-3 font-medium flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>Use this record?</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold text-white">${parsedTx.amount}</span>
                                        <span className="text-sm text-gray-400">{parsedTx.currency}</span>
                                    </div>
                                    <div className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                        {parsedTx.merchant}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-cyan-200 border border-white/5">
                                            {parsedTx.category}
                                        </span>
                                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-cyan-200 border border-white/5">
                                            {new Date(parsedTx.date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setParsedTx(null)}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors border border-white/5 active:scale-95 transition-transform"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </motion.div>
                            ) : isLoading ? (
                                <div className="h-full flex flex-col justify-center items-center text-center">
                                    <div className="flex space-x-2 mb-4">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-3 h-3 bg-cyan-500 rounded-full"
                                                animate={{
                                                    y: [0, -10, 0],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: i * 0.2
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-cyan-300 font-medium">Finley is thinking...</p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-center items-center">
                                    {/* Dynamic Avatar with Animation */}
                                    <motion.div
                                        className="mb-8 relative"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 4,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <div className="w-32 h-32 relative rounded-full flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden border-2 border-cyan-500/30">
                                            <img
                                                src="/finley_ai_avatar.png"
                                                alt="Finley AI"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse blur-md"></div>
                                        </div>
                                    </motion.div>

                                    <h3 className="text-white text-lg font-medium mb-6 text-center">How can I help you save today?</h3>

                                    {/* Smart Grid Suggestions */}
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        {[
                                            { icon: "📝", text: 'Log "Lunch $15"', action: "Lunch for $15" },
                                            { icon: "📊", text: "Analyze spend", action: "Analyze my spending", highlight: true },
                                            { icon: "💰", text: "Sub Check", action: "Find subscriptions" },
                                            { icon: "🎯", text: "Set Goal", action: "Set a saving goal" }
                                        ].map((item, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setInput(item.action)}
                                                className={`${item.highlight
                                                    ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 hover:from-cyan-900/50 text-cyan-200 border-cyan-500/20'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'} 
                                                    text-xs py-3 px-3 rounded-xl text-left transition border flex items-center gap-2 group`}
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <span>{item.text}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0f111a] border-t border-white/5">
                            <form onSubmit={handleSubmit} className="relative group/input">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 blur-[1px] -m-[1px]" />
                                <div className="relative bg-[#1a1d2d] rounded-2xl flex items-center p-2 gap-2">
                                    <div className="pl-2">
                                        <SparklesIcon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask anything about your money..."
                                        className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base md:text-sm max-h-32"
                                        rows={1}
                                        disabled={isLoading}
                                        style={{ minHeight: '44px', paddingTop: '10px' }}
                                    />
                                    <div className="flex items-center gap-1 pr-1">
                                        <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors">
                                            <MicrophoneIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName="AI Assistant"
            />
        </div>
    )
}
