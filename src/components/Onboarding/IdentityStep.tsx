'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useLanguage } from '../LanguageProvider'

interface IdentityStepProps {
    onSelect: (identity: string) => void
}

export default function IdentityStep({ onSelect }: IdentityStepProps) {
    const { t } = useLanguage()

    const IDENTITIES = [
        { id: 'survival', icon: '🌱', title: t('onboarding.identity.survival.title'), desc: t('onboarding.identity.survival.desc') },
        { id: 'shopaholic', icon: '🛍️', title: t('onboarding.identity.shopaholic.title'), desc: t('onboarding.identity.shopaholic.desc') },
        { id: 'saver', icon: '🚀', title: t('onboarding.identity.saver.title'), desc: t('onboarding.identity.saver.desc') },
    ]

    return (
        <div className="text-center">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 mb-8"
            >
                {t('onboarding.identity.title')}
            </motion.h2>

            <div className="grid gap-4">
                {IDENTITIES.map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(item.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </span>
                        <div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
