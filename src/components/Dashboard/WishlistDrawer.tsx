'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronUp, Lock, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { getGoals, deleteGoal, Goal } from '@/lib/dataService'
import { MOTION_SPRING, MODAL_VARIANTS, LIST_STAGGER_VARIANTS } from '@/lib/motionTokens'

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

export default function WishlistDrawer({ onGiveUp }: WishlistDrawerProps) {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [items, setItems] = useState<WishlistItem[]>([])

    useEffect(() => {
        if (!user) return

        const fetchWishlist = async () => {
            const goals = await getGoals(user.uid)
            // Assumption: "Wishlist" items are purchase goals that are not completed
            const wishlistGoals = goals.filter(g => g.category === 'purchase' && !g.isCompleted)

            const mappedItems = wishlistGoals.map(g => {
                const deadline = new Date(g.deadline)
                const today = new Date()
                const diffTime = Math.max(0, deadline.getTime() - today.getTime())
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                return {
                    id: g.id!,
                    name: g.title,
                    price: g.targetAmount,
                    daysLeft
                }
            })
            setItems(mappedItems)
        }

        fetchWishlist()
    }, [user, isOpen]) // Refetch when opened

    const handleGiveUp = async (item: WishlistItem) => {
        try {
            await deleteGoal(item.id)
            setItems(prev => prev.filter(i => i.id !== item.id))
            onGiveUp(item)
        } catch (error) {
            console.error('Failed to delete wishlist item', error)
        }
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
                className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-40 gap-2"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={MOTION_SPRING.button}
            >
                <div className="w-8 h-1 bg-gray-300 rounded-full hidden" />
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronUp size={14} className="text-blue-500" />
                    </motion.div>
                    欲望冷静区 ({items.length})
                </span>
            </motion.div>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            variants={MODAL_VARIANTS.overlay}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={MOTION_SPRING.drawer}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
                        >
                            {/* Drag handle indicator */}
                            <motion.div
                                className="mx-auto w-10 h-1 bg-gray-200 rounded-full mb-4"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            />

                            <div className="flex justify-between items-center mb-6">
                                <motion.h3
                                    className="text-lg font-bold text-gray-900"
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, ...MOTION_SPRING.listItem }}
                                >
                                    欲望冷静区 🧊
                                </motion.h3>
                                <motion.button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    关闭
                                </motion.button>
                            </div>

                            <motion.div
                                className="space-y-4 pb-12"
                                variants={LIST_STAGGER_VARIANTS.container}
                                initial="hidden"
                                animate="show"
                            >
                                <AnimatePresence mode="popLayout">
                                    {items.map(item => (
                                        <motion.div
                                            key={item.id}
                                            variants={LIST_STAGGER_VARIANTS.item}
                                            layout
                                            exit={{
                                                opacity: 0,
                                                x: -80,
                                                scale: 0.9,
                                                transition: { duration: 0.25, ease: "easeIn" }
                                            }}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 card-lift"
                                        >
                                            <motion.div
                                                className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl"
                                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                🎁
                                            </motion.div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-500">${item.price}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <motion.div
                                                    className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full"
                                                    animate={{ scale: [1, 1.02, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <Lock size={12} /> {item.daysLeft}天后解锁
                                                </motion.div>
                                                <motion.button
                                                    onClick={() => handleGiveUp(item)}
                                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                    whileHover={{ scale: 1.06 }}
                                                    whileTap={{ scale: 0.92 }}
                                                >
                                                    <Trash2 size={12} /> 不买了 (赚${item.price})
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {items.length === 0 && (
                                    <motion.div
                                        className="text-center py-12 text-gray-400"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        空空如也，看来你最近很理智！
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
