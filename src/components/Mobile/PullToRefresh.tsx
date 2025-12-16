'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const y = useMotionValue(0)
    const pullThreshold = 80 // Pixel distance to trigger refresh

    // Transform values for the loading icon
    const rotate = useTransform(y, [0, pullThreshold], [0, 360])
    const opacity = useTransform(y, [0, pullThreshold / 2, pullThreshold], [0, 0.5, 1])

    const handlePointerEnd = async () => {
        if (y.get() > pullThreshold) {
            setIsRefreshing(true)
            // Snap to loading position
            animate(y, 50, { type: "spring", stiffness: 300, damping: 30 })

            try {
                // Perform the refresh
                await onRefresh()
            } finally {
                // Reset after completion
                setIsRefreshing(false)
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
            }
        } else {
            // Snap back if threshold not met
            animate(y, 0, { type: "spring", stiffness: 400, damping: 40 })
        }
    }

    return (
        <div className="relative isolate">
            {/* Loading Indicator */}
            <motion.div
                style={{ opacity, y: -40, x: '-50%' }}
                className="absolute top-4 left-1/2 z-0 flex items-center justify-center pointer-events-none"
            >
                <motion.div
                    style={{ rotate }}
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    className="p-2 bg-white rounded-full shadow-md border border-gray-100"
                >
                    <ArrowPathIcon className="w-5 h-5 text-primary-600" />
                </motion.div>
            </motion.div>

            {/* Draggable Content */}
            <motion.div
                style={{ y }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2} // Feeling of resistance
                onDragEnd={handlePointerEnd}
                className="relative z-10 bg-gray-50 min-h-screen" // Add background to cover loader
            >
                {children}
            </motion.div>
        </div>
    )
}
