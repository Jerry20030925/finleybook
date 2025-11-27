'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X } from 'lucide-react'

interface BudgetSetupModalProps {
    isOpen: boolean
    onClose: () => void
    currentBudget: number
    currentWage: number
    onSave: (budget: number, wage: number) => void
}

export default function BudgetSetupModal({
    isOpen,
    onClose,
    currentBudget,
    currentWage,
    onSave
}: BudgetSetupModalProps) {
    const [budget, setBudget] = useState(currentBudget.toString())
    const [wage, setWage] = useState(currentWage.toString())

    const handleSave = () => {
        const budgetNum = parseFloat(budget)
        const wageNum = parseFloat(wage)

        if (budgetNum > 0 && wageNum > 0) {
            onSave(budgetNum, wageNum)
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Budget Setup</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Set your monthly budget and hourly wage
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-6">
                                {/* Monthly Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Disposable Budget
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            placeholder="1000"
                                            className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg text-gray-900 placeholder-gray-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 This is the amount you can spend each month after bills
                                    </p>
                                </div>

                                {/* Hourly Wage */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Hourly Wage
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={wage}
                                            onChange={(e) => setWage(e.target.value)}
                                            placeholder="25"
                                            className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-lg text-gray-900 placeholder-gray-500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            /hr
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Used for the "Worth It?" calculator
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleSave}
                                disabled={!budget || !wage || parseFloat(budget) <= 0 || parseFloat(wage) <= 0}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                            >
                                Save Settings
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
