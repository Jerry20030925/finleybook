'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import StructuredData from './StructuredData'

export default function FAQSection() {
    const faqs = [
        {
            question: "Is my data safe?",
            answer: "Absolutely. We use bank-level encryption (256-bit AES) to protect your data. We never sell your personal information to third parties."
        },
        {
            question: "Can I use FinleyBook for free?",
            answer: "Yes! We offer a generous free plan that includes all the core features you need to track expenses and set budgets. Premium features are available for power users."
        },
        {
            question: "Do I need to connect my bank account?",
            answer: "No, connecting a bank account is optional. You can fully use FinleyBook by manually adding transactions, which takes just seconds."
        },
        {
            question: "Can I export my data?",
            answer: "Yes, you can export your transaction history to CSV or Excel formats at any time from the settings menu."
        }
    ]

    return (
        <section id="faq" className="py-24 bg-gray-50">
            <StructuredData type="faq" data={faqs} />
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Frequently Asked Questions
                    </motion.h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function FAQItem({ question, answer, index }: { question: string, answer: string, index: number }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="text-lg font-semibold text-gray-900">{question}</span>
                {isOpen ? (
                    <Minus className="w-5 h-5 text-indigo-600" />
                ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
