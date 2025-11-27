'use client'

import { motion } from 'framer-motion'
import { Plane, Laptop, Home } from 'lucide-react'

interface DreamStepProps {
    annualLoss: number
    onNext: () => void
}

export default function DreamStep({ annualLoss, onNext }: DreamStepProps) {
    const getDreamItem = () => {
        if (annualLoss < 1000) return { icon: <Laptop size={48} />, label: '一台 iPad Air' }
        if (annualLoss < 3000) return { icon: <Plane size={48} />, label: '一张回国往返机票' }
        return { icon: <Home size={48} />, label: '三个月的房租' }
    }

    const item = getDreamItem()

    return (
        <div className="text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    如果我们能帮你找回这笔钱...
                </h2>
                <p className="text-gray-600 mb-8">明年这个时候，你可以拥有：</p>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl mb-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-center mb-4 text-white/90">
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{item.label}</h3>
                    <p className="text-indigo-100 mt-2 text-sm">价值约 ${annualLoss}</p>
                </div>
            </motion.div>

            <button
                onClick={onNext}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
                带我去找回这笔钱
            </button>
        </div>
    )
}
