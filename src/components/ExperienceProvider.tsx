'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { doc, onSnapshot } from 'firebase/firestore'

import { useAuth } from '@/components/AuthProvider'
import { db } from '@/lib/firebase'
import { isMobileDevice } from '@/lib/mobileUtils'
import { getStoredReduceMotionPreference, setStoredReduceMotionPreference } from '@/lib/experience'

type ExperienceContextValue = {
    reduceMotion: boolean
    allowRichMotion: boolean
    isMobile: boolean
    lowPowerDevice: boolean
    dataSaverEnabled: boolean
}

const defaultValue: ExperienceContextValue = {
    reduceMotion: false,
    allowRichMotion: true,
    isMobile: false,
    lowPowerDevice: false,
    dataSaverEnabled: false,
}

const ExperienceContext = createContext<ExperienceContextValue>(defaultValue)

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    const [userReduceMotion, setUserReduceMotion] = useState<boolean | null>(null)
    const [systemReduceMotion, setSystemReduceMotion] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [lowPowerDevice, setLowPowerDevice] = useState(false)
    const [dataSaverEnabled, setDataSaverEnabled] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const stored = getStoredReduceMotionPreference()
        if (stored !== null) {
            setUserReduceMotion(stored)
        }
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const updateSystemMotion = () => setSystemReduceMotion(mediaQuery.matches)
        updateSystemMotion()

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updateSystemMotion)
            return () => mediaQuery.removeEventListener('change', updateSystemMotion)
        }

        mediaQuery.addListener(updateSystemMotion)
        return () => mediaQuery.removeListener(updateSystemMotion)
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        let rafId: number | null = null

        const updateDeviceProfile = () => {
            setIsMobile(isMobileDevice())

            const concurrency = window.navigator.hardwareConcurrency || 8
            const deviceMemory = (window.navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8
            setLowPowerDevice(concurrency <= 4 || deviceMemory <= 4)

            const connection = (window.navigator as Navigator & {
                connection?: { saveData?: boolean; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void }
            }).connection
            setDataSaverEnabled(Boolean(connection?.saveData))
        }

        const scheduleUpdateDeviceProfile = () => {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId)
            }
            rafId = window.requestAnimationFrame(() => {
                rafId = null
                updateDeviceProfile()
            })
        }

        updateDeviceProfile()
        window.addEventListener('resize', scheduleUpdateDeviceProfile, { passive: true })
        window.addEventListener('orientationchange', scheduleUpdateDeviceProfile)

        const connection = (window.navigator as Navigator & {
            connection?: { addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void }
        }).connection

        connection?.addEventListener?.('change', scheduleUpdateDeviceProfile)

        return () => {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId)
            }
            window.removeEventListener('resize', scheduleUpdateDeviceProfile)
            window.removeEventListener('orientationchange', scheduleUpdateDeviceProfile)
            connection?.removeEventListener?.('change', scheduleUpdateDeviceProfile)
        }
    }, [])

    useEffect(() => {
        if (!user?.uid) return
        if (!db) return

        const userRef = doc(db, 'users', user.uid)
        return onSnapshot(userRef, (snapshot) => {
            if (!snapshot.exists()) return

            const nextValue = snapshot.data()?.experiencePreferences?.reduceMotion
            if (typeof nextValue !== 'boolean') return

            setUserReduceMotion(nextValue)
            setStoredReduceMotionPreference(nextValue)
        })
    }, [user?.uid])

    // Accessibility first:
    // - reduceMotion should only follow explicit user/system preference.
    // - low power / data saver should reduce heavy effects, not kill all transitions.
    const reduceMotion = systemReduceMotion || userReduceMotion === true
    const allowRichMotion = !reduceMotion && !dataSaverEnabled && !lowPowerDevice

    useEffect(() => {
        if (typeof document === 'undefined') return

        const motionMode = reduceMotion ? 'reduced' : 'full'
        document.documentElement.setAttribute('data-motion', motionMode)
        document.body.setAttribute('data-motion', motionMode)
    }, [reduceMotion])

    const value = useMemo<ExperienceContextValue>(() => ({
        reduceMotion,
        allowRichMotion,
        isMobile,
        lowPowerDevice,
        dataSaverEnabled,
    }), [allowRichMotion, dataSaverEnabled, isMobile, lowPowerDevice, reduceMotion])

    return (
        <ExperienceContext.Provider value={value}>
            <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
                {children}
            </MotionConfig>
        </ExperienceContext.Provider>
    )
}

export function useExperience() {
    return useContext(ExperienceContext)
}
