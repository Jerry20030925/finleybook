'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, TrendingUp } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'

interface LandingPageProps {
    onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
    const { t } = useLanguage()
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                            {t('landing.badge')}
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            {t('landing.hero.title.prefix')}<span className="text-indigo-600">{t('landing.hero.title.highlight')}</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            {t('landing.hero.desc')}
                        </p>

                        <button
                            onClick={onStart}
                            className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
                        >
                            {t('landing.cta.start')}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-sm text-gray-500 mt-4">{t('landing.hero.sub')}</p>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-200 rounded-full blur-3xl opacity-20" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-3xl opacity-20" />
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                        title={t('landing.feature.safe.title')}
                        desc={t('landing.feature.safe.desc')}
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-amber-500" />}
                        title={t('landing.feature.drag.title')}
                        desc={t('landing.feature.drag.desc')}
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-8 h-8 text-indigo-500" />}
                        title={t('landing.feature.time.title')}
                        desc={t('landing.feature.time.desc')}
                    />
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    )
}
