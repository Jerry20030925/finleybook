'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'

export default function EarningsCalculator() {
    const { t } = useLanguage()
    const { formatAmount } = useCurrency()
    const [spend, setSpend] = useState(500)

    // Assuming average 8% cashback
    const savings = Math.floor(spend * 0.08)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-6 py-12"
        >
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -ml-20 -mb-20" />

                <div className="relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        {t('landing.calculator.title')}
                    </h2>

                    <div className="max-w-xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <label className="text-indigo-200 text-sm font-medium uppercase tracking-wider">
                                {t('landing.calculator.spend')}
                            </label>
                            <div className="text-5xl font-bold">
                                {formatAmount(spend)}
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="50"
                                value={spend}
                                onChange={(e) => setSpend(parseInt(e.target.value))}
                                className="w-full h-2 bg-indigo-700/50 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                            <p
                                className="text-lg md:text-xl leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: t('landing.calculator.result', { amount: formatAmount(savings) })
                                        .replace('text-indigo-600', 'text-emerald-400') // Override color for dark bg
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
