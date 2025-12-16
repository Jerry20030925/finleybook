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
    UserIcon,
    ChartBarIcon
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

import { useGlobalModal } from './GlobalModalProvider'
import { PlusIcon } from '@heroicons/react/24/solid'

export default function BottomNavigation() {
    const pathname = usePathname()
    const { t } = useLanguage()
    const { user } = useAuth()
    const { isProMember } = useSubscription()
    const { openAddTransaction } = useGlobalModal()

    // Authentication Guard
    if (!user) return null

    if (!isMobileApp()) {
        // Option to hide on desktop if needed
    }

    const tabs = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
        { name: t('nav.reports'), href: '/reports', icon: ChartBarIcon, activeIcon: ChartBarIcon }, // Using Reports instead of Transactions list
        { name: 'ADD', href: '#', icon: PlusIcon, activeIcon: PlusIcon, isAction: true }, // Special Action Button
        { name: t('nav.budget'), href: '/budget', icon: CalculatorIcon, activeIcon: CalculatorIconSolid },
        { name: t('nav.me'), href: '/profile', icon: UserIcon, activeIcon: UserIconSolid },
    ]

    return (
        <div className={clsx(
            "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50",
            "md:hidden"
        )}>
            <div className="flex justify-around items-end h-16 pb-1">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href
                    const Icon = isActive ? tab.activeIcon : tab.icon

                    if (tab.isAction) {
                        return (
                            <div key="add-action" className="relative -top-5">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={async () => {
                                        if (isMobileApp() && isProMember) {
                                            try {
                                                const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
                                                await Haptics.impact({ style: ImpactStyle.Medium })
                                            } catch (e) { }
                                        }
                                        openAddTransaction()
                                    }}
                                    className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center border-4 border-white"
                                >
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
                                "flex flex-col items-center justify-center w-full h-full space-y-1 relative pt-2",
                                isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >

                            <motion.div
                                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
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
