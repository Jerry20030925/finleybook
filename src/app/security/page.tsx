'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, LockClosedIcon, ServerIcon, DocumentCheckIcon } from '@heroicons/react/24/outline'

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-slate-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block p-4 rounded-full bg-slate-800 mb-6"
                    >
                        <ShieldCheckIcon className="w-12 h-12 text-emerald-400" />
                    </motion.div>
                    <motion.h1
                        className="text-4xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Security is our #1 Priority
                    </motion.h1>
                    <motion.p
                        className="text-xl text-slate-300 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        We use bank-grade encryption and security practices to ensure your data is safe, private, and secure.
                    </motion.p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Security Pillars */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <LockClosedIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">256-bit Encryption</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. This is the same level of security used by major banks and financial institutions.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <ServerIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Infrastructure</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our servers are hosted in SOC 2 Type II compliant data centers. We employ strict access controls and regular security audits to maintain the integrity of our systems.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                <DocumentCheckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We never sell your personal data. Your financial information is yours alone. We access it only to provide the services you requested.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Financial Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-amber-900 mb-4">Financial Disclaimer</h2>
                    <div className="prose prose-amber text-amber-800">
                        <p>
                            FinleyBook is a financial data analysis  and wealth tracking tool. We are not a registered investment advisor, broker-dealer, or financial institution.
                        </p>
                        <p>
                            The content, tools, and information provided on FinleyBook are for informational and educational purposes only and do not constitute professional financial advice.
                            Calculations and projections are estimates based on the data you provide and historical trends, and actual results may vary.
                        </p>
                        <p>
                            Before making any significant financial decisions, we recommend consulting with a qualified financial professional who can consider your individual circumstances.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
