'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
    SparklesIcon,
    ChartBarIcon,
    FlagIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/components/LanguageProvider'
import { useSubscription } from '@/components/SubscriptionProvider'

const shortcuts = [
    { href: '/wealth', key: 'nav.rewards', icon: SparklesIcon },
    { href: '/reports', key: 'nav.reports', icon: ChartBarIcon },
    { href: '/goals', key: 'nav.goals', icon: FlagIcon },
    { href: '/subscription', key: 'nav.subscription', icon: CreditCardIcon },
]

export default function MobileShortcutBar() {
    const prefersReducedMotion = useReducedMotion()
    const { t } = useLanguage()
    const { isProMember } = useSubscription()

    return (
        <motion.div
            className="md:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.22, ease: 'easeOut' }}
        >
            <div className="grid grid-cols-4 gap-2">
                {shortcuts.map((item, index) => {
                    const Icon = item.icon
                    const isSubscription = item.href === '/subscription'

                    return (
                        <motion.div
                            key={item.href}
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            transition={{ delay: prefersReducedMotion ? 0 : index * 0.04, duration: 0.18 }}
                        >
                            <Link
                                href={item.href}
                                className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-1 py-2.5 active:scale-[0.98] transition-all"
                            >
                                <Icon className="w-5 h-5 text-slate-700" />
                                <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight line-clamp-2">
                                    {t(item.key)}
                                </span>
                                {isSubscription && !isProMember && (
                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
                                )}
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
