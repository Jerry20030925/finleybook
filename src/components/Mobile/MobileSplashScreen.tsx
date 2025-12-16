'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Logo from '../Logo'

export default function MobileSplashScreen({ onComplete }: { onComplete: () => void }) {
    // Automatically trigger completion after animation
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete()
        }, 2500) // 2.5 seconds total duration
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="relative">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ delay: 0.8, duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Logo size="xl" />
                    </motion.div>
                </div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-6 text-2xl font-black tracking-tight text-gray-900"
                >
                    FinleyBook
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-2 text-sm font-medium text-gray-500 tracking-wide"
                >
                    WEALTH MANAGEMENT REIMAGINED
                </motion.p>
            </motion.div>

            <motion.div
                className="absolute bottom-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <div className="h-1 w-32 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.2, duration: 2, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </div>
    )
}
