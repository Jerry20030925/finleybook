'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import CountrySelector, { useCountry } from './CountrySelector'
import HeroSection from './HeroSection'
import LoadingAnimation from './LoadingAnimation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface LandingPageProps {
    onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
    const { t } = useLanguage()
    const { selectedCountry, updateCountry } = useCountry()
    const [isLoading, setIsLoading] = useState(true)
    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false)
            setTimeout(() => setShowContent(true), 300)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    // Show loading animation
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LoadingAnimation type="financial" size="lg" />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 space-y-3"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                <Sparkles className="text-indigo-600" />
                                Loading FinleyBook
                            </h2>
                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-gray-600"
                            >
                                Preparing your financial journey...
                            </motion.p>
                            
                            {/* Progress dots */}
                            <div className="flex justify-center gap-2 mt-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-indigo-600 rounded-full"
                                        animate={{ 
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 1, 
                                            repeat: Infinity,
                                            delay: i * 0.3
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden flex flex-col"
        >
            {/* Top Navigation */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 right-6 z-50 flex items-center gap-4"
            >
                <CountrySelector 
                    selectedCountry={selectedCountry} 
                    onCountryChange={updateCountry}
                />
                <LanguageSwitcher />
            </motion.div>

            {/* Hero Section */}
            <HeroSection onStart={onStart} />

            {/* Enhanced Features Section */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
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
                            {t('landing.features.badge') || 'Why Choose FinleyBook'}
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold text-gray-900 mb-4"
                        >
                            {t('landing.features.title') || 'Built for Modern Financial Management'}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            {t('landing.features.desc') || 'Experience the future of personal finance with our innovative tools and AI-powered insights.'}
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
                            icon={<Zap className="w-8 h-8 text-amber-500" />}
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
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
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
