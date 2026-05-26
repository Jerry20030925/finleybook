'use client'

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useExperience } from '@/components/ExperienceProvider'
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '@/lib/motionTokens'

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const systemReducedMotion = useReducedMotion()
    const { reduceMotion, allowRichMotion, isMobile } = useExperience()
    const { scrollYProgress } = useScroll()
    const progressScaleX = useSpring(scrollYProgress, {
        ...MOTION_SPRING.scrollProgress
    })
    const hideGlobalChromePages = ['/', '/privacy', '/terms']
    const hideGlobalChrome = hideGlobalChromePages.includes(pathname || '')
    // Keep lightweight route transitions on mobile and constrained devices.
    // Rich effects (like progress bar) still respect performance constraints.
    const canAnimateRoutes = !reduceMotion
    const showProgress = !hideGlobalChrome && allowRichMotion && !isMobile && !systemReducedMotion

    const wrapperClass = clsx(
        'min-h-[100dvh]',
        hideGlobalChrome ? 'pb-0' : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0'
    )

    if (!canAnimateRoutes) {
        return (
            <div className={wrapperClass}>
                {children}
            </div>
        )
    }

    return (
        <div className={wrapperClass}>
            {showProgress && (
                <motion.div
                    aria-hidden="true"
                    className="pointer-events-none fixed top-16 left-0 right-0 z-40 h-[2px] origin-left bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 opacity-70"
                    style={{ scaleX: progressScaleX }}
                />
            )}

            {allowRichMotion && (
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`route-flash-${pathname}`}
                        aria-hidden="true"
                        className="pointer-events-none fixed inset-x-0 top-16 z-30 h-14 bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent blur-xl"
                        initial={{ opacity: 0, x: '-22%' }}
                        animate={{ opacity: [0, 0.7, 0], x: ['-22%', '0%', '22%'] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: MOTION_DURATION.routeFlash, ease: MOTION_EASE.out }}
                    />
                </AnimatePresence>
            )}

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={pathname}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 15, scale: 0.99, filter: 'blur(3px)' }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -10, scale: 0.99, filter: 'blur(1px)' }}
                    transition={{ duration: reduceMotion ? MOTION_DURATION.micro : MOTION_DURATION.route, ease: MOTION_EASE.standard }}
                    className="will-change-transform"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
