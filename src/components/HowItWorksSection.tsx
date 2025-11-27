'use client'

import { motion } from 'framer-motion'
import { Wallet, PieChart, BellRing, ArrowRight } from 'lucide-react'

export default function HowItWorksSection() {
    const steps = [
        {
            icon: <Wallet className="w-8 h-8 text-white" />,
            title: "Connect or Track",
            desc: "Link your accounts securely or manually track cash expenses in seconds.",
            color: "bg-blue-500"
        },
        {
            icon: <PieChart className="w-8 h-8 text-white" />,
            title: "Get Insights",
            desc: "We automatically categorize your spending and show you where your money goes.",
            color: "bg-purple-500"
        },
        {
            icon: <BellRing className="w-8 h-8 text-white" />,
            title: "Stay on Track",
            desc: "Receive smart alerts and weekly reports to help you save more effortlessly.",
            color: "bg-emerald-500"
        }
    ]

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        How FinleyBook Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Three simple steps to financial freedom. No complex spreadsheets required.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{step.desc}</p>

                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
