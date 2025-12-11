'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { clsx } from 'clsx'
import { useLanguage } from '@/components/LanguageProvider'

interface ProfitOrbProps {
    totalSaved: number
    currency?: string
}

export default function ProfitOrb({ totalSaved, currency = '$' }: ProfitOrbProps) {
    const { t } = useLanguage()
    const controls = useAnimation()

    useEffect(() => {
        // Breathing animation
        controls.start({
            scale: [1, 1.05, 1],
            boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.3)",
                "0 0 40px rgba(16, 185, 129, 0.6)",
                "0 0 20px rgba(16, 185, 129, 0.3)"
            ],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        })
    }, [controls])

    // Trigger pulse on value increase
    useEffect(() => {
        controls.start({
            scale: [1, 1.1, 1],
            transition: { duration: 0.3 }
        })
    }, [totalSaved, controls])

    return (
        <div className="relative flex items-center justify-center w-72 h-72 mx-auto my-8">
            {/* Background Glow */}
            <div className="absolute w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />

            {/* Main Orb */}
            <motion.div
                animate={controls}
                className={clsx(
                    "relative z-10 flex flex-col items-center justify-center w-56 h-56 rounded-full",
                    "bg-gradient-to-br from-emerald-400 to-emerald-600",
                    "shadow-[0_0_50px_rgba(16,185,129,0.4)]",
                    "border-4 border-emerald-300/30 backdrop-blur-sm"
                )}
            >
                <span className="text-sm font-medium text-emerald-100 uppercase tracking-wider mb-1">
                    {t('dashboard.profitOrb.label')}
                </span>
                <div className="flex items-baseline text-white">
                    <span className="text-4xl font-bold">
                        {currency}
                    </span>
                    <motion.span
                        key={totalSaved} // Trigger animation on change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold ml-1"
                    >
                        {totalSaved.toFixed(2)}
                    </motion.span>
                </div>
                <span className="text-xs text-emerald-200 mt-2 bg-emerald-800/30 px-2 py-1 rounded-full">
                    {t('dashboard.profitOrb.sublabel')}
                </span>
            </motion.div>

            {/* Orbiting Particles (Decorative) */}
            <div className="absolute w-full h-full animate-spin-slow pointer-events-none">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-300 rounded-full blur-[1px]" />
            </div>
        </div>
    )
}
