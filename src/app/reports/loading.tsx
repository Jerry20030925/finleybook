'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function Loading() {
    const prefersReducedMotion = useReducedMotion()

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
                <motion.div
                    className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full"
                    animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'linear' }}
                />
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 text-sm text-slate-400 font-medium"
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    )
}
