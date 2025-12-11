'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// import { Plane, Laptop, Home } from 'lucide-react' // Unused now
import { useLanguage } from '../LanguageProvider'

interface DreamStepProps {
    annualLoss: number
    onNext: () => void
    currency: string
}

export default function DreamStep({ onNext, currency }: { onNext: (data: { title: string, amount: number, icon: string, deadline: string }) => void, currency: string }) {
    const { t } = useLanguage()
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [deadline, setDeadline] = useState('')
    const [selectedIcon, setSelectedIcon] = useState('🏖️')

    const icons = ['🏖️', '🏠', '🚗', '💍', '🎓', '💻', '🚀', '🏔️']

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !amount || !deadline) {
            // toast.error('Please fill in all fields')
            return
        }
        onNext({
            title,
            amount: parseFloat(amount),
            icon: selectedIcon,
            deadline
        })
    }

    return (
        <div className="text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-left"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                        {selectedIcon}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {t('onboarding.dream.inputTitle')}
                </h2>
                <p className="text-gray-500 mb-8 text-center text-sm">
                    {t('onboarding.dream.inputDesc')}
                </p>

                <div className="flex gap-2 justify-center mb-6 flex-wrap">
                    {[
                        { label: '🚗 Tesla Model 3', title: 'Tesla Model 3', amount: '45000', icon: '🚗' },
                        { label: '🏠 House Deposit', title: 'House Deposit', amount: '80000', icon: '🏠' },
                        { label: '✈️ Europe Trip', title: 'Europe Trip', amount: '5000', icon: '✈️' },
                        { label: '💻 Macbook Pro', title: 'Macbook Pro', amount: '2500', icon: '💻' }
                    ].map(chip => (
                        <button
                            key={chip.label}
                            type="button"
                            onClick={() => {
                                setTitle(chip.title)
                                setAmount(chip.amount)
                                setSelectedIcon(chip.icon)
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-transparent hover:border-gray-300"
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                            Dream Name
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Trip to Iceland"
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                            Target Amount ({currency})
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="5000"
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                            When do you want this?
                        </label>
                        <input
                            type="date"
                            required
                            value={deadline}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                            Choose an Icon
                        </label>
                        <div className="flex gap-2 justify-center flex-wrap bg-gray-50 p-3 rounded-xl">
                            {icons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4"
                    >
                        {t('onboarding.dream.submitFrom', { defaultValue: "Set My Goal" })}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
