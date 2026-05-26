'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

export default function BackToTop() {
    const [visible, setVisible] = useState(false)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        if (typeof window === 'undefined') return
        let rafId: number | null = null

        const onScroll = () => {
            if (rafId !== null) return
            rafId = requestAnimationFrame(() => {
                setVisible(window.scrollY > 400)
                rafId = null
            })
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    key="back-to-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.25, ease: 'easeOut' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-24 right-5 z-40 md:bottom-8 md:right-8 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-900/10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-xl transition-shadow"
                >
                    <ChevronUpIcon className="w-5 h-5" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
