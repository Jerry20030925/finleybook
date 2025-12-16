'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { useCurrency } from './CurrencyProvider'

interface CountUpProps {
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    className?: string
}

export default function CountUp({ value, prefix = '', suffix = '', decimals = 2, className }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 30, // Higher damping = less overshoot, more stable "landing"
        stiffness: 100, // Speed of the spring
        duration: 1.5 // Target duration in seconds (note: spring ignores duration if stiffness/damping are set excessively, but helpful for hybrid calls)
    })
    const isInView = useInView(ref, { once: true, margin: "0px" })
    const { formatAmount } = useCurrency() // We might use this for formatting, but complex since we are animating raw numbers

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [motionValue, isInView, value])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // We manually format here to avoid react render cycle thrashing
                // For simple formatting:
                const formatted = latest.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                })
                ref.current.textContent = `${prefix}${formatted}${suffix}`
            }
        })
    }, [springValue, decimals, prefix, suffix])

    // Initial render static to prevent hydration mismatch/jumps if JS is slow?
    // Actually, we start at 0.

    return <span ref={ref} className={className}>{prefix}0.00{suffix}</span>
}
