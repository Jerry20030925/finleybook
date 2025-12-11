'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useCurrency } from '../CurrencyProvider'
import { useLanguage } from '../LanguageProvider'
import toast from 'react-hot-toast'

interface QuickExpenseEntryProps {
    onAddExpense: (amount: number, category: string, emoji: string) => void
}

interface QuickButton {
    emoji: string
    labelKey?: string
    label?: string // Legacy support
    amount: number
    category: string
}

// Default quick buttons - users can customize these
const DEFAULT_QUICK_BUTTONS: QuickButton[] = [
    { emoji: '☕️', labelKey: 'Coffee', amount: 5, category: 'Food & Dining' },
    { emoji: '🍔', labelKey: 'Meal', amount: 15, category: 'Food & Dining' },
    { emoji: '🛒', labelKey: 'Groceries', amount: 50, category: 'Shopping' },
    { emoji: '🚗', labelKey: 'Transport', amount: 20, category: 'Transportation' },
    { emoji: '🎬', labelKey: 'Fun', amount: 30, category: 'Entertainment' },
]

export default function QuickExpenseEntry({ onAddExpense }: QuickExpenseEntryProps) {
    const { t } = useLanguage()
    const [showCustom, setShowCustom] = useState(false)
    const [customAmount, setCustomAmount] = useState('')
    const [selectedButton, setSelectedButton] = useState<number | null>(null)
    const [quickButtons, setQuickButtons] = useState<QuickButton[]>(DEFAULT_QUICK_BUTTONS)
    const { formatAmount } = useCurrency()

    // Load user's custom quick buttons on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedButtons = localStorage.getItem('userQuickButtons')
                if (savedButtons) {
                    setQuickButtons(JSON.parse(savedButtons))
                }
            } catch (error) {
                console.error('Error loading custom quick buttons:', error)
            }
        }
    }, [])

    const handleQuickAdd = (button: typeof DEFAULT_QUICK_BUTTONS[0], index: number) => {
        // Visual feedback
        setSelectedButton(index)

        // Haptic feedback (if supported)
        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }

        // Add expense
        onAddExpense(button.amount, button.category, button.emoji)

        // Toast feedback
        toast.success(`Added ${formatAmount(button.amount)}`, {
            icon: button.emoji,
            duration: 2000,
        })

        // Reset animation
        setTimeout(() => setSelectedButton(null), 300)
    }

    const handleCustomAdd = () => {
        const amount = parseFloat(customAmount)
        if (amount > 0) {
            onAddExpense(amount, 'Other', '💰')

            // Toast feedback
            toast.success(`Added ${formatAmount(amount)}`, {
                icon: '💰',
                duration: 2000,
            })

            setCustomAmount('')
            setShowCustom(false)
        }
    }

    // ... (keep useEffect)

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{t('quickActions.title')}</h3>
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    {showCustom ? t('quickActions.viewTransactions') : 'Custom'}
                </button>
            </div>

            {!showCustom ? (
                <div className="grid grid-cols-5 gap-3">
                    {quickButtons.map((button, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleQuickAdd(button, index)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all"
                            whileTap={{ scale: 0.9 }}
                            animate={selectedButton === index ? {
                                scale: [1, 1.1, 1],
                                backgroundColor: ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)']
                            } : {}}
                        >
                            <span className="text-3xl">{button.emoji}</span>
                            <span className="text-xs font-medium text-gray-700">
                                {button.labelKey || button.label}
                            </span>
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
