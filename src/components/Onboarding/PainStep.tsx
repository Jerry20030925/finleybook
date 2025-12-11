'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useLanguage } from '../LanguageProvider'

interface PainStepProps {
    onNext: (amount: number) => void
    currency: string
}

export default function PainStep({ onNext, currency }: PainStepProps) {
    const { t } = useLanguage()
    const [amount, setAmount] = useState(50)
    const annualLoss = amount * 12

    // Color shift based on amount
    const getIntensity = () => {
        const percentage = (amount - 50) / (500 - 50)
        return percentage // 0 to 1
    }

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(val)
    }

    return (
        <div className="text-center">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-gray-900 mb-2"
            >
                {t('onboarding.pain.title')}
            </motion.h2>
            <p className="text-gray-600 mb-8">{t('onboarding.pain.desc')}</p>

            <div className="mb-12 relative">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                    {formatMoney(amount)}
                </div>
                <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{t('onboarding.pain.min', { amount: formatMoney(50) })}</span>
                    <span>{t('onboarding.pain.max', { amount: formatMoney(2000) })}</span>
                </div>
            </div>

            <motion.div
                className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100"
                animate={{
                    backgroundColor: `rgba(255, ${200 - getIntensity() * 100}, ${200 - getIntensity() * 100}, 0.1)`
                }}
            >
                <p className="text-sm text-gray-600 mb-1">{t('onboarding.pain.annual')}</p>
                <p className="text-xs text-gray-400 mb-2">(10 years @ 5% compound)</p>
                <motion.div
                    key={annualLoss}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-gray-900"
                >
                    {/* Approximation: Monthly Payment * 12 * 10 * 1.3 (compound factor roughly) */}
                    {/* Precise FV(0.05/12, 120, -amount, 0) */}
                    {/* Let's use a simpler heuristic for visual impact: Monthly * 155 */}
                    {formatMoney(amount * 155)}
                </motion.div>
            </motion.div>

            <button
                onClick={() => onNext(amount)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                {t('onboarding.pain.next')}
            </button>
        </div>
    )
}
