'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import Logo from './Logo'

export default function PageLoader() {
    const prefersReducedMotion = useReducedMotion()

    return (
        <motion.div
            className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            <div className="relative">
                <motion.div
                    animate={prefersReducedMotion ? { opacity: 1 } : {
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: prefersReducedMotion ? 0.1 : 2,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    <Logo size="xl" />
                </motion.div>
                <div className="mt-8 overflow-hidden h-1 w-32 bg-gray-100 rounded-full mx-auto relative">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-600"
                        animate={prefersReducedMotion ? { x: 0 } : { x: [-128, 128] }}
                        transition={{
                            duration: prefersReducedMotion ? 0.1 : 1.5,
                            repeat: prefersReducedMotion ? 0 : Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                </div>
            </div>
            <motion.p
                className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest"
                animate={prefersReducedMotion ? { opacity: 0.8 } : { opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 2, repeat: prefersReducedMotion ? 0 : Infinity }}
            >
                Finley Intelligence
            </motion.p>
        </motion.div>
    )
}
