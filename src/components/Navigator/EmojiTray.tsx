'use client'

import { motion, useDragControls } from 'framer-motion'
import { useRef } from 'react'

interface EmojiItem {
    id: string
    emoji: string
    label: string
    defaultAmount: number
    category: string
}

const DEFAULT_EMOJIS: EmojiItem[] = [
    { id: 'food', emoji: '🍔', label: '午餐', defaultAmount: 15, category: '餐饮' },
    { id: 'drink', emoji: '☕', label: '咖啡', defaultAmount: 6, category: '餐饮' },
    { id: 'transport', emoji: '🚗', label: '交通', defaultAmount: 10, category: '交通' },
    { id: 'shopping', emoji: '🛍️', label: '购物', defaultAmount: 50, category: '购物' },
    { id: 'game', emoji: '🎮', label: '娱乐', defaultAmount: 30, category: '娱乐' },
]

interface EmojiTrayProps {
    onDrop: (item: EmojiItem) => void
}

export default function EmojiTray({ onDrop }: EmojiTrayProps) {
    return (
        <div className="fixed bottom-8 left-0 right-0 px-4">
            <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-4 flex justify-between items-center max-w-md mx-auto overflow-x-auto gap-4">
                {DEFAULT_EMOJIS.map((item) => (
                    <DraggableEmoji key={item.id} item={item} onDrop={() => onDrop(item)} />
                ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
                拖拽图标到圆环记账
            </p>
        </div>
    )
}

function DraggableEmoji({ item, onDrop }: { item: EmojiItem, onDrop: () => void }) {
    const controls = useDragControls()
    const constraintsRef = useRef(null)

    return (
        <motion.div
            drag
            dragControls={controls}
            dragSnapToOrigin
            whileDrag={{ scale: 1.5, zIndex: 50 }}
            onDragEnd={(event, info) => {
                // Simple hit detection logic: if dragged up significantly (e.g., > 200px)
                if (info.offset.y < -150) {
                    onDrop()
                }
            }}
            className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing touch-none"
        >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-2xl shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors">
                {item.emoji}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
        </motion.div>
    )
}
