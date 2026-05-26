'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function Loading() {
    const prefersReducedMotion = useReducedMotion()

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <motion.div
                    className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full"
                    animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 1, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'linear' }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-slate-600 font-medium"
                >
                    Loading FinleyBook...
                </motion.div>
            </div>
        </div>
    )
}
