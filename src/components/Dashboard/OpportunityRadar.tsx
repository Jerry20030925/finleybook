'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState } from 'react'
import { Check, X, ShoppingBag, Tag, AlertCircle } from 'lucide-react'

interface Opportunity {
    id: string
    type: 'dupe' | 'deal' | 'sub'
    title: string
    description: string
    savedAmount: number
    originalPrice?: number
    newPrice?: number
}

interface OpportunityRadarProps {
    onAccept: (opportunity: Opportunity) => void
    onReject: (opportunity: Opportunity) => void
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: '1',
        type: 'dupe',
        title: '平替发现',
        description: 'Aesop 洗手液 ($45) vs Thankyou ($8)',
        savedAmount: 37,
        originalPrice: 45,
        newPrice: 8
    },
    {
        id: '2',
        type: 'sub',
        title: '闲置订阅',
        description: 'Disney+ 已闲置 25 天',
        savedAmount: 14
    },
    {
        id: '3',
        type: 'deal',
        title: '羊毛警报',
        description: 'Coles 洗洁精半价',
        savedAmount: 5
    }
]

export default function OpportunityRadar({ onAccept, onReject }: OpportunityRadarProps) {
    const [cards, setCards] = useState(MOCK_OPPORTUNITIES)

    const removeCard = (id: string) => {
        setCards((prev) => prev.filter((c) => c.id !== id))
    }

    return (
        <div className="relative w-full max-w-sm mx-auto h-64 mt-8">
            {cards.map((card, index) => (
                <Card
                    key={card.id}
                    card={card}
                    active={index === cards.length - 1}
                    onSwipe={(dir) => {
                        if (dir === 'right') onAccept(card)
                        else onReject(card)
                        removeCard(card.id)
                    }}
                />
            ))}
            {cards.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    暂无新机会，明天再来！
                </div>
            )}
        </div>
    )
}

function Card({ card, active, onSwipe }: { card: Opportunity, active: boolean, onSwipe: (dir: 'left' | 'right') => void }) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-30, 30])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
    const background = useTransform(
        x,
        [-200, 0, 200],
        ['rgb(254, 202, 202)', 'rgb(255, 255, 255)', 'rgb(167, 243, 208)']
    )

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe('right')
        } else if (info.offset.x < -100) {
            onSwipe('left')
        }
    }

    if (!active) return null

    return (
        <motion.div
            style={{ x, rotate, opacity, background }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${card.type === 'dupe' ? 'bg-purple-100 text-purple-600' :
                        card.type === 'sub' ? 'bg-red-100 text-red-600' :
                            'bg-amber-100 text-amber-600'
                    }`}>
                    {card.type === 'dupe' && <ShoppingBag size={20} />}
                    {card.type === 'sub' && <AlertCircle size={20} />}
                    {card.type === 'deal' && <Tag size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{card.title}</h3>
                    <p className="text-xs text-gray-500">向右滑赚取 ${card.savedAmount}</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-gray-700 font-medium text-lg leading-relaxed">
                    {card.description}
                </p>
            </div>

            <div className="flex justify-between mt-4 text-sm font-bold">
                <div className="text-red-400 flex items-center gap-1">
                    <X size={16} /> 忽略
                </div>
                <div className="text-emerald-500 flex items-center gap-1">
                    执行 <Check size={16} />
                </div>
            </div>
        </motion.div>
    )
}
