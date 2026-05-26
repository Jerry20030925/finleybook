'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    HomeIcon,
    CalculatorIcon,
    UserIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    CalculatorIcon as CalculatorIconSolid,
    UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { useLanguage } from './LanguageProvider'
import { isMobileApp } from '@/lib/mobileUtils'
import { useAuth } from './AuthProvider'
import { useSubscription } from './SubscriptionProvider'

import { useGlobalModal } from './GlobalModalProvider'
import { PlusIcon } from '@heroicons/react/24/solid'
import { useExperience } from '@/components/ExperienceProvider'

export default function BottomNavigation() {
    const pathname = usePathname()
    const { t } = useLanguage()
    const { user } = useAuth()
    const { isProMember } = useSubscription()
    const { openAddTransaction } = useGlobalModal()
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
    const [isNavHiddenByScroll, setIsNavHiddenByScroll] = useState(false)
    const lastScrollY = useRef(0)
    const { reduceMotion, allowRichMotion } = useExperience()

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!window.visualViewport) return

        const viewport = window.visualViewport
        const updateKeyboardState = () => {
            const keyboardVisible = viewport.height < window.innerHeight * 0.78
            setIsKeyboardOpen(keyboardVisible)
        }

        updateKeyboardState()
        viewport.addEventListener('resize', updateKeyboardState)

        return () => {
            viewport.removeEventListener('resize', updateKeyboardState)
        }
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        let rafId: number | null = null

        const onScroll = () => {
            if (rafId !== null) return
            rafId = requestAnimationFrame(() => {
                const currentY = window.scrollY
                const delta = currentY - lastScrollY.current

                if (currentY <= 24) {
                    setIsNavHiddenByScroll(false)
                } else if (delta > 8) {
                    setIsNavHiddenByScroll(true)
                } else if (delta < -8) {
                    setIsNavHiddenByScroll(false)
                }

                lastScrollY.current = currentY
                rafId = null
            })
        }

        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [])

    useEffect(() => {
        setIsNavHiddenByScroll(false)
    }, [pathname])

    // Authentication Guard
    if (!user) return null

    const tabs = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: t('nav.transactions'), href: '/transactions', icon: ChartBarIcon, activeIcon: ChartBarIcon },
        { name: 'ADD', href: '#', icon: PlusIcon, activeIcon: PlusIcon, isAction: true }, // Special Action Button
        { name: t('nav.budget'), href: '/budget', icon: CalculatorIcon, activeIcon: CalculatorIconSolid },
        { name: t('nav.me'), href: '/profile', icon: UserIcon, activeIcon: UserIconSolid },
    ]

    const isTabActive = (href: string) => {
        if (!pathname) return false

        if (href === '/profile') {
            return pathname.startsWith('/profile') || pathname.startsWith('/settings')
        }

        return pathname === href || pathname.startsWith(`${href}/`)
    }

    return (
        <div className={clsx(
            "finley-bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-200",
            "border-t border-gray-200/90 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]",
            "pb-[calc(env(safe-area-inset-bottom)+4px)]",
            isKeyboardOpen || isNavHiddenByScroll ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
            style={{
                paddingLeft: 'max(0.375rem, env(safe-area-inset-left))',
                paddingRight: 'max(0.375rem, env(safe-area-inset-right))',
            }}
            role="navigation"
            aria-label="Bottom navigation"
        >
            <div className="flex justify-around items-end h-[68px] pb-1">
                {tabs.map((tab) => {
                    const isActive = isTabActive(tab.href)
                    const Icon = isActive ? tab.activeIcon : tab.icon

                    if (tab.isAction) {
                        return (
                            <div key="add-action" className="relative -top-5 px-0.5">
                                <motion.button
                                    type="button"
                                    aria-label="Add transaction"
                                    whileHover={allowRichMotion ? { scale: 1.08, boxShadow: '0 12px 28px -4px rgba(99,102,241,0.55)' } : undefined}
                                    whileTap={allowRichMotion ? { scale: 0.88, rotate: 90 } : undefined}
                                    onClick={async () => {
                                        if (isMobileApp() && isProMember) {
                                            try {
                                                const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
                                                await Haptics.impact({ style: ImpactStyle.Medium })
                                            } catch (e) { }
                                        }
                                        openAddTransaction()
                                    }}
                                    className="relative w-[60px] h-[60px] min-w-[60px] min-h-[60px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center border-4 border-white"
                                >
                                    {/* Ambient glow ring — easeInOut for symmetric breathing */}
                                    {allowRichMotion && (
                                        <motion.span
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0"
                                            animate={{ scale: [1, 1.55], opacity: [0.38, 0] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.2 }}
                                            style={{ willChange: 'transform, opacity' }}
                                        />
                                    )}
                                    <PlusIcon className="w-8 h-8" />
                                </motion.button>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={async () => {
                                if (isMobileApp() && isProMember) {
                                    try {
                                        const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
                                        await Haptics.impact({ style: ImpactStyle.Light })
                                    } catch (e) { }
                                }
                            }}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full min-h-[52px] space-y-1 relative pt-1.5 transition-colors duration-300 rounded-2xl",
                                isActive ? "text-violet-600" : "text-gray-400 hover:text-gray-600"
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {/* Morphing background — layoutId shared layout animation */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-x-1.5 top-1 bottom-1 rounded-2xl z-0"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(237,233,254,1) 0%, rgba(224,231,255,1) 100%)',
                                        willChange: 'transform',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                                />
                            )}

                            <motion.div
                                className="relative z-10"
                                animate={!allowRichMotion || reduceMotion ? {
                                    scale: isActive ? 1.06 : 1,
                                    y: isActive ? -1 : 0,
                                } : {
                                    scale: isActive ? [1, 1.15, 1.07] : 1,
                                    y: isActive ? -2 : 0,
                                    rotate: isActive ? [0, -4, 3, 0] : 0,
                                }}
                                whileTap={{ scale: 0.88 }}
                                style={{ willChange: 'transform' }}
                                transition={{
                                    type: 'spring',
                                    // was 400/22 — softened for less harsh tap rebound
                                    stiffness: 360,
                                    damping: 26,
                                    duration: reduceMotion ? 0.14 : 0.28,
                                }}
                            >
                                <Icon className="w-6 h-6" />
                            </motion.div>
                            <motion.span
                                className="text-[10px] font-bold truncate max-w-[64px] relative z-10"
                                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0.7 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tab.name}
                            </motion.span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
