'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle2, Sparkles, Coins } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import CountrySelector, { useCountry } from './CountrySelector'
import HeroSection from './HeroSection'
import HowItWorksSection from './HowItWorksSection'
import TestimonialsSection from './TestimonialsSection'
import FAQSection from './FAQSection'
import LoadingAnimation from './LoadingAnimation'
import EarningsCalculator from './EarningsCalculator'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Footer from './Footer'

interface LandingPageProps {
    onStart: () => void
    onLogin: () => void
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
    const { t } = useLanguage()
    const { selectedCountry, updateCountry } = useCountry()
    // Removed artificial loading state for SEO optimization

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden flex flex-col"
        >
            {/* Top Navigation */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-2 md:gap-4"
            >
                <button
                    onClick={onLogin}
                    className="text-gray-600 font-semibold hover:text-indigo-600 transition-colors px-2 py-1 md:px-4 md:py-2 text-sm md:text-base"
                >
                    {t('auth.login')}
                </button>
                <div className="scale-90 md:scale-100 origin-right flex items-center gap-2">
                    <CountrySelector
                        selectedCountry={selectedCountry}
                        onCountryChange={updateCountry}
                    />
                    <LanguageSwitcher />
                </div>
            </motion.div>

            {/* Hero Section */}
            <HeroSection onStart={onStart} />

            {/* Earnings Calculator Widget */}
            <section className="relative z-20 mt-0 mb-20">
                <EarningsCalculator />
            </section>

            {/* Enhanced Features Section */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                id="features"
                className="py-24 bg-white relative"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                        >
                            <Sparkles size={16} />
                            {t('landing.features.badge')}
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold text-gray-900 mb-4"
                        >
                            {t('landing.features.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            {t('landing.features.desc')}
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <EnhancedFeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                            title={t('landing.feature.safe.title')}
                            desc={t('landing.feature.safe.desc')}
                            delay={0.4}
                            color="emerald"
                        />
                        <EnhancedFeatureCard
                            icon={<Coins className="w-8 h-8 text-amber-500" />}
                            title={t('landing.feature.drag.title')}
                            desc={t('landing.feature.drag.desc')}
                            delay={0.5}
                            color="amber"
                        />
                        <EnhancedFeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-indigo-500" />}
                            title={t('landing.feature.time.title')}
                            desc={t('landing.feature.time.desc')}
                            delay={0.6}
                            color="indigo"
                        />
                    </div>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* FAQ Section */}
            <FAQSection />

            {/* Footer */}
            {/* Footer */}
            <Footer selectedCountry={selectedCountry} onCountryChange={updateCountry} />
        </motion.div>
    )
}

function EnhancedFeatureCard({
    icon,
    title,
    desc,
    delay,
    color
}: {
    icon: React.ReactNode,
    title: string,
    desc: string,
    delay: number,
    color: 'emerald' | 'amber' | 'indigo'
}) {
    const colorClasses = {
        emerald: {
            bg: 'from-emerald-50 to-green-100',
            border: 'border-emerald-200',
            glow: 'shadow-emerald-500/20'
        },
        amber: {
            bg: 'from-amber-50 to-orange-100',
            border: 'border-amber-200',
            glow: 'shadow-amber-500/20'
        },
        indigo: {
            bg: 'from-indigo-50 to-purple-100',
            border: 'border-indigo-200',
            glow: 'shadow-indigo-500/20'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{
                y: -10,
                rotateX: 5,
                rotateY: 5,
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            style={{ perspective: 1000 }}
            className={`
                relative bg-white p-8 rounded-3xl border-2 ${colorClasses[color].border}
                hover:shadow-2xl ${colorClasses[color].glow} transition-all duration-300 cursor-default group overflow-hidden
            `}
        >
            {/* Background gradient on hover */}
            <div className={`
                absolute inset-0 bg-gradient-to-br ${colorClasses[color].bg} 
                opacity-0 group-hover:opacity-30 transition-opacity duration-300
            `} />

            {/* Content */}
            <div className="relative z-10">
                <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-lg"
                    whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.5 }
                    }}
                >
                    {icon}
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {title}
                </h3>

                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {desc}
                </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={24} />
            </div>
        </motion.div>
    )
}
