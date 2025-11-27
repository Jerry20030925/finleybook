'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface QuickExpenseEntryProps {
    onAddExpense: (amount: number, category: string, emoji: string) => void
}

const QUICK_BUTTONS = [
    { emoji: '☕️', label: 'Coffee', amount: 5, category: 'Food & Drink' },
    { emoji: '🍔', label: 'Meal', amount: 15, category: 'Food & Drink' },
    { emoji: '🛒', label: 'Groceries', amount: 50, category: 'Groceries' },
    { emoji: '🚗', label: 'Transport', amount: 20, category: 'Transportation' },
    { emoji: '🎬', label: 'Fun', amount: 30, category: 'Entertainment' },
]

export default function QuickExpenseEntry({ onAddExpense }: QuickExpenseEntryProps) {
    const [showCustom, setShowCustom] = useState(false)
    const [customAmount, setCustomAmount] = useState('')
    const [selectedButton, setSelectedButton] = useState<number | null>(null)

    const handleQuickAdd = (button: typeof QUICK_BUTTONS[0], index: number) => {
        // Visual feedback
        setSelectedButton(index)

        // Haptic feedback (if supported)
        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }

        // Add expense
        onAddExpense(button.amount, button.category, button.emoji)

        // Reset animation
        setTimeout(() => setSelectedButton(null), 300)
    }

    const handleCustomAdd = () => {
        const amount = parseFloat(customAmount)
        if (amount > 0) {
            onAddExpense(amount, 'Other', '💰')
            setCustomAmount('')
            setShowCustom(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quick Add</h3>
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    {showCustom ? 'Quick' : 'Custom'}
                </button>
            </div>

            {!showCustom ? (
                <div className="grid grid-cols-5 gap-3">
                    {QUICK_BUTTONS.map((button, index) => (
                        <motion.button
                            key={button.label}
                            onClick={() => handleQuickAdd(button, index)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all"
                            whileTap={{ scale: 0.9 }}
                            animate={selectedButton === index ? {
                                scale: [1, 1.1, 1],
                                backgroundColor: ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)']
                            } : {}}
                        >
                            <span className="text-3xl">{button.emoji}</span>
                            <span className="text-xs font-medium text-gray-700">${button.amount}</span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
                        autoFocus
                    />
                    <button
                        onClick={handleCustomAdd}
                        disabled={!customAmount || parseFloat(customAmount) <= 0}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Expense
                    </button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
                💡 Tap to track instantly. Long press for custom amount.
            </p>
        </div>
    )
}
