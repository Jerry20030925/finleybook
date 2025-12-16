'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const slides = [
    {
        title: "Track Your Net Worth",
        description: "Connect your accounts and watch your wealth grow in real-time.",
        image: "📊" // We can use real images later, emoji for now
    },
    {
        title: "Earn Cashback Automatically",
        description: "Shop at your favorite stores and get paid. No points, just cash.",
        image: "💰"
    },
    {
        title: "AI Financial Insights",
        description: "Get smart recommendations to optimize your spending and saving.",
        image: "🤖"
    }
]

export default function MobileOnboarding({ onComplete }: { onComplete: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            onComplete()
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
                    >
                        <div className="text-8xl mb-12">
                            {slides[currentIndex].image}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">
                            {slides[currentIndex].title}
                        </h2>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            {slides[currentIndex].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-8 pb-12">
                <div className="flex justify-center space-x-2 mb-8">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-primary-600' : 'w-2 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:bg-gray-800 transform active:scale-95 transition-all"
                >
                    {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    <ChevronRightIcon className="h-5 w-5 stroke-[3px]" />
                </button>
            </div>
        </div>
    )
}
