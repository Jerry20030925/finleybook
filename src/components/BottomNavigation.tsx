'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    HomeIcon,
    BanknotesIcon,
    ChartPieIcon,
    TrophyIcon,
    EllipsisHorizontalIcon,
    CalculatorIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    BanknotesIcon as BanknotesIconSolid,
    ChartPieIcon as ChartPieIconSolid,
    TrophyIcon as TrophyIconSolid,
    EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
    CalculatorIcon as CalculatorIconSolid,
    UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { useLanguage } from './LanguageProvider'
import { isMobileApp } from '@/lib/mobileUtils'
import { useAuth } from './AuthProvider'
import { useSubscription } from './SubscriptionProvider'

export default function BottomNavigation() {
    const pathname = usePathname()
    const { t } = useLanguage()
    const { user } = useAuth()
    const { isProMember } = useSubscription()

    // Authentication Guard
    if (!user) return null

    // Only show on mobile app or small screens
    // We can use CSS media queries to hide on desktop, and checks for mobile app
    // But for the native app "feel", this is crucial.
    // We'll enforce it via CSS mostly, but if isMobileApp is false, we might want to hide it entirely if it's desktop web.
    // Actually, usually bottom nav is good for mobile web too.
    // But let's stick to the user request: "Mobile Interface".

    if (!isMobileApp()) {
        // Can also check window width if we want mobile web to have it, 
        // but for now let's just show it if isMobileApp() to start, or maybe hidden md:hidden
    }

    const tabs = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: t('nav.transactions'), href: '/transactions', icon: BanknotesIcon, activeIcon: BanknotesIconSolid },
        { name: t('nav.budget'), href: '/budget', icon: CalculatorIcon, activeIcon: CalculatorIconSolid },
        { name: t('nav.goals'), href: '/goals', icon: TrophyIcon, activeIcon: TrophyIconSolid },
        { name: t('nav.me'), href: '/profile', icon: UserIcon, activeIcon: UserIconSolid },
    ]

    // If we have too many, we might need a 'More' tab. 
    // currently 5 which fits standard guidelines.

    return (
        <div className={clsx(
            "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50",
            // Hide on desktop (md and up) regardless of isMobileApp, just in case
            "md:hidden"
        )}>
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href
                    const Icon = isActive ? tab.activeIcon : tab.icon

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={async () => {
                                if (isMobileApp() && isProMember) {
                                    try {
                                        const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
                                        await Haptics.impact({ style: ImpactStyle.Light })
                                    } catch (e) {
                                        // Ignore
                                    }
                                }
                            }}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                                isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {/* Animated Background Indicator (Optional, subtle) */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-1 w-12 h-1 bg-primary-500 rounded-b-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <motion.div
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Icon className="w-6 h-6" />
                            </motion.div>
                            <span className="text-[10px] font-medium truncate max-w-[64px]">
                                {tab.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
