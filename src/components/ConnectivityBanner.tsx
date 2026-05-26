'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

export default function ConnectivityBanner() {
    const prefersReducedMotion = useReducedMotion()
    const [isOnline, setIsOnline] = useState(true)
    const [showOnlineRecovered, setShowOnlineRecovered] = useState(false)
    const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        setIsOnline(window.navigator.onLine)

        const handleOffline = () => {
            setIsOnline(false)
            setShowOnlineRecovered(false)
            if (recoveryTimeoutRef.current) {
                clearTimeout(recoveryTimeoutRef.current)
                recoveryTimeoutRef.current = null
            }
        }

        const handleOnline = () => {
            setIsOnline(true)
            setShowOnlineRecovered(true)
            if (recoveryTimeoutRef.current) {
                clearTimeout(recoveryTimeoutRef.current)
            }
            recoveryTimeoutRef.current = setTimeout(() => {
                setShowOnlineRecovered(false)
            }, 2500)
        }

        window.addEventListener('offline', handleOffline)
        window.addEventListener('online', handleOnline)

        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
            if (recoveryTimeoutRef.current) {
                clearTimeout(recoveryTimeoutRef.current)
            }
        }
    }, [])

    const showBanner = !isOnline || showOnlineRecovered
    if (!showBanner) return null

    const offlineMode = !isOnline

    return (
        <AnimatePresence>
            <motion.div
                key={offlineMode ? 'offline' : 'online'}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: 'easeOut' }}
                className={`fixed left-1/2 top-3 z-[70] -translate-x-1/2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg border ${offlineMode
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
            >
                <span className="inline-flex items-center gap-2">
                    {offlineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
                    {offlineMode ? 'Offline mode: some features may be unavailable' : 'Connection restored'}
                </span>
            </motion.div>
        </AnimatePresence>
    )
}
