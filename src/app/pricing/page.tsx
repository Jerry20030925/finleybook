'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h1
                        className="text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Simple, Transparent Pricing
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Start for free, upgrade as you grow. No hidden fees.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Forever</h3>
                            <p className="text-gray-500">Essential tools for personal finance tracking.</p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <ul className="mb-8 space-y-4 flex-1">
                            <li className="flex items-center text-gray-700">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                                Basic Wealth Tracking
                            </li>
                            <li className="flex items-center text-gray-700">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                                Amazon Cashback (Standard Rate)
                            </li>
                            <li className="flex items-center text-gray-700">
                                <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                                Monthly Cash Flow Report
                            </li>
                            <li className="flex items-center text-gray-400">
                                <XMarkIcon className="w-5 h-5 mr-3" />
                                AI Price Glitch Alerts
                            </li>
                            <li className="flex items-center text-gray-400">
                                <XMarkIcon className="w-5 h-5 mr-3" />
                                Advanced Heatmap Analytics
                            </li>
                        </ul>
                        <Link
                            href="/dashboard"
                            className="block w-full py-3 px-6 text-center rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                        >
                            Get Started
                        </Link>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                            <p className="text-gray-400">Maximum power for serious wealth builders.</p>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-bold text-white">$9.99</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <ul className="mb-8 space-y-4 flex-1">
                            <li className="flex items-center text-gray-300">
                                <CheckIcon className="w-5 h-5 text-indigo-400 mr-3" />
                                Advanced Wealth Tracking & Net Worth Forecasting
                            </li>
                            <li className="flex items-center text-gray-300">
                                <CheckIcon className="w-5 h-5 text-indigo-400 mr-3" />
                                <span className="font-semibold text-white mr-1">Double</span> Amazon Cashback Rates
                            </li>
                            <li className="flex items-center text-gray-300">
                                <CheckIcon className="w-5 h-5 text-indigo-400 mr-3" />
                                Real-time AI Price Glitch Alerts
                            </li>
                            <li className="flex items-center text-gray-300">
                                <CheckIcon className="w-5 h-5 text-indigo-400 mr-3" />
                                Full Heatmap & Trend Analytics
                            </li>
                            <li className="flex items-center text-gray-300">
                                <CheckIcon className="w-5 h-5 text-indigo-400 mr-3" />
                                Priority Support
                            </li>
                        </ul>
                        <Link
                            href="/dashboard?plan=pro"
                            className="block w-full py-3 px-6 text-center rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                        >
                            Upgrade to Pro
                        </Link>
                    </motion.div>
                </div>

                {/* FAQ Section (Preview) */}
                <div className="mt-24 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Have questions?</h2>
                    <Link href="/help" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
                        Visit our Help Center
                    </Link>
                </div>
            </div>
        </div>
    )
}
