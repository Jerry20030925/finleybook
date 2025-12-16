'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GiftIcon, BellAlertIcon, CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function CashbackRewardsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/dots.svg')] bg-center opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                                Shop Smarter, <br />
                                <span className="text-white/90">Earn Harder</span>
                            </h1>
                            <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                                Why pay full price? FinleyBook's AI scans for price glitches, automates cashback, and ensures you never miss a deal on Amazon and your favorite stores.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/dashboard" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-xl">
                                    Start Earning Rewards
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Drilldown */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Feature 1: Amazon Cashback */}
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-orange-50 p-4 rounded-xl inline-block mb-4">
                                <ShoppingBagIcon className="w-8 h-8 text-orange-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">5% Cashback on Amazon</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Link your Amazon purchases and automatically earn 5% cashback on eligible items. It's free money for shopping you were going to do anyway. No receipt scanning required.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                    Automatic tracking
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                    Direct deposit to your wallet
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
                            {/* Placeholder for screenshot */}
                            <div className="bg-orange-50 rounded-2xl p-8 aspect-video flex items-center justify-center border-2 border-dashed border-orange-200">
                                <span className="text-orange-400 font-medium">[Amazon Cashback UI]</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 2: Price Glitches */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-red-50 p-4 rounded-xl inline-block mb-4">
                                <BellAlertIcon className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Price Glitch Alerts</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Our AI monitors millions of products 24/7. When a price drops abnormally (a "glitch"), you get an instant alert. Grab 90% off deals before they're fixed.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                                    Instant push notifications
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                                    Curated "Verified Glitch" list
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
                            {/* Placeholder for screenshot */}
                            <div className="bg-red-50 rounded-2xl p-8 aspect-video flex items-center justify-center border-2 border-dashed border-red-200">
                                <span className="text-red-400 font-medium">[Glitch Alert Notification]</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 3: Smart Wallet */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="bg-green-50 p-4 rounded-xl inline-block mb-4">
                                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rewards Wallet</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Watch your cashback stack up. Withdraw your earnings via PayPal, Gift Cards, or Crypto once you hit the threshold. It pays to use FinleyBook.
                            </p>
                            <Link href="/pricing" className="text-pink-600 font-medium hover:text-pink-700 flex items-center">
                                See our Pro Plan for double rewards <span className="ml-1">→</span>
                            </Link>
                        </motion.div>
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Placeholder for screenshot */}
                            <div className="bg-green-50 rounded-2xl p-8 aspect-video flex items-center justify-center border-2 border-dashed border-green-200">
                                <span className="text-green-400 font-medium">[Wallet Dashboard UI]</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Don't Leave Money on the Table</h2>
                    <p className="text-lg text-gray-400 mb-8">Every day you don't use FinleyBook, you're missing out on cashback and deals.</p>
                    <Link href="/dashboard" className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition-colors">
                        Start Saving Today
                    </Link>
                </div>
            </section>
        </div>
    )
}
