'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const y = useMotionValue(0)
    const pullThreshold = 80

    // Transform values for the loading icon
    const rotate = useTransform(y, [0, pullThreshold], [0, 360])
    const opacity = useTransform(y, [0, pullThreshold / 2, pullThreshold], [0, 0.5, 1])

    const startY = useRef(0)
    const isDragging = useRef(false)

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY
            isDragging.current = true
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return

        const currentY = e.touches[0].clientY
        const diff = currentY - startY.current

        // Only allow pulling down if we are at the top
        if (window.scrollY === 0 && diff > 0) {
            // Apply resistance
            y.set(diff * 0.4)
            // Prevent native scroll/refresh behavior only when strictly pulling down
            if (e.cancelable) e.preventDefault()
        } else {
            // If scrolled down, stop custom drag
            isDragging.current = false
            y.set(0)
        }
    }

    const handleTouchEnd = async () => {
        if (!isDragging.current) return
        isDragging.current = false

        if (y.get() > pullThreshold) {
            setIsRefreshing(true)
            animate(y, 50, { type: "spring", stiffness: 300, damping: 30 })
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
            }
        } else {
            animate(y, 0, { type: "spring", stiffness: 400, damping: 40 })
        }
    }

    return (
        <div
            className="relative isolate min-h-screen"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Loading Indicator */}
            <motion.div
                style={{ opacity, y: -40, x: '-50%' }}
                className="absolute top-4 left-1/2 z-0 flex items-center justify-center pointer-events-none"
            >
                <div
                    className="p-2 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center"
                >
                    <motion.div
                        style={{ rotate }}
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    >
                        <ArrowPathIcon className="w-5 h-5 text-primary-600" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Content Container */}
            <motion.div
                style={{ y }}
                className="relative z-10 bg-gray-50 min-h-screen"
            >
                {children}
            </motion.div>
        </div>
    )
}
