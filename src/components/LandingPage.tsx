'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import ProfitOrb from './Dashboard/ProfitOrb'
import CountrySelector, { useCountry } from './CountrySelector'
import Link from 'next/link'

interface LandingPageProps {
    onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
    const { t } = useLanguage()
    const { selectedCountry, updateCountry } = useCountry()

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[100px]" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                <CountrySelector 
                    selectedCountry={selectedCountry} 
                    onCountryChange={updateCountry}
                />
                <LanguageSwitcher />
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left Column: Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-left z-10"
                        >
                            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-6 tracking-wide uppercase">
                                {t('landing.badge')}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                                {t('landing.hero.title.prefix')}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
                                    {t('landing.hero.title.highlight')}
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                                {t('landing.hero.desc')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <button
                                    onClick={onStart}
                                    className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
                                >
                                    {t('landing.cta.start')}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200/50">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    {t('landing.hero.sub')}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Live Demo (Profit Orb) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:flex justify-center items-center"
                        >
                            <div className="relative w-[400px] h-[700px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-2xl z-20" />

                                {/* Screen Content */}
                                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
                                    <div className="scale-75 transform origin-center">
                                        <ProfitOrb totalSaved={320.50} />
                                    </div>
                                    <div className="absolute bottom-20 w-full px-8">
                                        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">🍔</div>
                                                <div className="flex-1">
                                                    <div className="h-2 w-24 bg-gray-700 rounded mb-1"></div>
                                                    <div className="h-2 w-16 bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reflection */}
                                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-30"
                            >
                                <div className="flex items-center gap-2 font-bold text-emerald-600">
                                    <TrendingUp size={20} />
                                    +$125.00
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto px-6 py-24 w-full">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                            title={t('landing.feature.safe.title')}
                            desc={t('landing.feature.safe.desc')}
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-amber-500" />}
                            title={t('landing.feature.drag.title')}
                            desc={t('landing.feature.drag.desc')}
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-indigo-500" />}
                            title={t('landing.feature.time.title')}
                            desc={t('landing.feature.time.desc')}
                            delay={0.6}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        Copyright © 2025 FinleyBook Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">
                            Terms of Use
                        </Link>
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                            <CountrySelector 
                                selectedCountry={selectedCountry} 
                                onCountryChange={updateCountry}
                                className="scale-90"
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-default group"
        >
            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {desc}
            </p>
        </motion.div>
    )
}
