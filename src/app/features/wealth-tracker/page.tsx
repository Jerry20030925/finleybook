'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChartBarIcon, ArrowTrendingUpIcon, ShieldCheckIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function WealthTrackerPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                                Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Wealth Command Center</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Stop guessing where your money goes. FinleyBook's AI Wealth Tracker gives you a god-mode view of your entire financial life—assets, liabilities, and opportunities, all in one place.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25">
                                    Start Tracking for Free
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Drilldown */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Feature 1: Heatmap */}
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-indigo-50 p-4 rounded-xl inline-block mb-4">
                                <EyeIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Heatmap Analysis</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Understand your spending at a glance. Our AI visualizes your cash flow as a heatmap, instantly highlighting where you're overspending and where you have opportunities to save. No more digging through spreadsheets.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                    Spot recurring subscriptions you forgot about
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                    Identify high-spending categories instantly
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Placeholder for screenshot/visual */}
                            <div className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-inner">
                                <span className="text-gray-400 font-medium">[Heatmap UI Screenshot]</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 2: Trend Analysis */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-emerald-50 p-4 rounded-xl inline-block mb-4">
                                <ArrowTrendingUpIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Predictive Cash Flow Trends</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Don't just look back—look forward. FinleyBook analyzes your historical data to predict your future net worth and cash flow stability. See the impact of today's coffee on next month's savings.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                                    AI-driven net worth forecasting
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                                    Smart alerts for upcoming bills
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Placeholder for screenshot/visual */}
                            <div className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-inner">
                                <span className="text-gray-400 font-medium">[Trend Analysis Graph]</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 3: Security */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-blue-50 p-4 rounded-xl inline-block mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bank-Grade Security</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Your financial data is sensitive, and we treat it that way. We use 256-bit encryption and read-only access to ensure your information never falls into the wrong hands.
                            </p>
                            <Link href="/security" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center">
                                Learn more about our security <span className="ml-1">→</span>
                            </Link>
                        </motion.div>
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Placeholder for screenshot/visual */}
                            <div className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-inner">
                                <span className="text-gray-400 font-medium">[Security Lock Visual]</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Take Control?</h2>
                    <p className="text-lg text-gray-400 mb-8">Join thousands of users who have optimized their wealth with FinleyBook.</p>
                    <Link href="/dashboard" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                        Get Started Now
                    </Link>
                </div>
            </section>
        </div>
    )
}
