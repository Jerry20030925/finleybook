'use client'

import { motion } from 'framer-motion'
import { Plane, Laptop, Home } from 'lucide-react'
import { useLanguage } from '../LanguageProvider'

interface DreamStepProps {
    annualLoss: number
    onNext: () => void
}

export default function DreamStep({ annualLoss, onNext }: DreamStepProps) {
    const { t } = useLanguage()

    const getDreamItem = () => {
        if (annualLoss < 1000) return { icon: <Laptop size={48} />, label: t('onboarding.dream.ipad') }
        if (annualLoss < 3000) return { icon: <Plane size={48} />, label: t('onboarding.dream.flight') }
        return { icon: <Home size={48} />, label: t('onboarding.dream.rent') }
    }

    const item = getDreamItem()

    return (
        <div className="text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('onboarding.dream.title')}
                </h2>
                <p className="text-gray-600 mb-8">{t('onboarding.dream.desc')}</p>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl mb-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-center mb-4 text-white/90">
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{item.label}</h3>
                    <p className="text-indigo-100 mt-2 text-sm">{t('onboarding.dream.value', { amount: annualLoss })}</p>
                </div>
            </motion.div>

            <button
                onClick={onNext}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
                {t('onboarding.dream.cta')}
            </button>
        </div>
    )
}
