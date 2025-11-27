'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronUp, Lock, Trash2 } from 'lucide-react'

interface WishlistItem {
    id: string
    name: string
    price: number
    daysLeft: number
    image?: string
}

interface WishlistDrawerProps {
    onGiveUp: (item: WishlistItem) => void
}

const MOCK_WISHLIST: WishlistItem[] = [
    { id: '1', name: 'Nike Air Jordan', price: 200, daysLeft: 3 },
    { id: '2', name: 'Sony WH-1000XM5', price: 350, daysLeft: 5 },
]

export default function WishlistDrawer({ onGiveUp }: WishlistDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [items, setItems] = useState(MOCK_WISHLIST)

    const handleGiveUp = (item: WishlistItem) => {
        onGiveUp(item)
        setItems(prev => prev.filter(i => i.id !== item.id))
    }

    return (
        <>
            {/* Handle */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(e, info) => {
                    if (info.offset.y < -50) setIsOpen(true)
                }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center cursor-pointer z-40"
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <ChevronUp size={14} /> 欲望冷静区 ({items.length})
                </span>
            </motion.div>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">欲望冷静区 🧊</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    关闭
                                </button>
                            </div>

                            <div className="space-y-4 pb-12">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                                            🎁
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">${item.price}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                                <Lock size={12} /> {item.daysLeft}天后解锁
                                            </div>
                                            <button
                                                onClick={() => handleGiveUp(item)}
                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> 不买了 (赚${item.price})
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        空空如也，看来你最近很理智！
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
