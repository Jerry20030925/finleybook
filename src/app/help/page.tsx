'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const faqs = [
    {
        question: "How do I connect my bank account?",
        answer: "You can connect your bank account securely through our 'Link Account' feature on the dashboard. We use Plaid to securely connect to over 10,000 financial institutions."
    },
    {
        question: "Is my data safe?",
        answer: "Yes, absolutely. We use bank-grade 256-bit encryption and never store your banking credentials on our servers. You can read more in our Security Center."
    },
    {
        question: "How does the Amazon Cashback work?",
        answer: "Simply link your Amazon account or use our browser extension (coming soon). When you make a purchase, we automatically track eligible items and credit your FinleyBook wallet with 5% cashback."
    },
    {
        question: "How long does data synchronization take?",
        answer: "Initial synchronization can take a few minutes depending on the amount of historical data. After that, your data is refreshed automatically every 24 hours, or you can manually refresh it instantly on the Pro plan."
    },
    {
        question: "Can I export my data?",
        answer: "Yes, you can export your transaction history and reports as CSV or PDF files from the Settings menu."
    },
    {
        question: "How do I cancel my subscription?",
        answer: "You can manage or cancel your subscription at any time from the Billing section in your account settings. You will continue to have access until the end of your current billing period."
    }
]

export default function HelpCenterPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-indigo-600 text-white py-16 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-none shadow-lg focus:ring-2 focus:ring-indigo-300 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                <ChevronDownIcon
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Contact Support Block */}
                <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                    <p className="mb-6 opacity-90">Our support team is available 24/7 to assist you with any questions.</p>
                    <div className="flex gap-4 justify-center">
                        <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Chat with Support
                        </button>
                        <a href="mailto:support@finleybook.com" className="bg-indigo-700 bg-opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-opacity-70 transition-colors border border-indigo-400">
                            Email Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
