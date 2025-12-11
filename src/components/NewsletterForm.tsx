'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Subscription failed')
            }

            setStatus('success')
            toast.success('Welcome to the community! 🌟')
            setEmail('')

            // Reset after 3 seconds
            setTimeout(() => setStatus('idle'), 3000)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Something went wrong. Please try again.')
            setStatus('idle')
        }
    }

    return (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600 mb-3">Join our global community</span>
            <form onSubmit={handleSubmit} className="flex relative">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={`px-4 py-2 text-white text-sm font-medium rounded-r-lg transition-all min-w-[80px] flex items-center justify-center
                        ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}
                        disabled:opacity-80 disabled:cursor-not-allowed
                    `}
                >
                    <AnimatePresence mode="wait">
                        {status === 'loading' ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Loader2 size={16} className="animate-spin" />
                            </motion.div>
                        ) : status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Check size={16} />
                            </motion.div>
                        ) : (
                            <motion.span
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Join
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </form>
        </div>
    )
}
