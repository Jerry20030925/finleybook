import { useCallback } from 'react'

export function useConfetti() {
    const fire = useCallback(async () => {
        try {
            const confetti = (await import('canvas-confetti')).default
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
                ticks: 160,
                gravity: 1.2,
                scalar: 1.1,
                drift: 0,
            })
        } catch {
            // canvas-confetti not available — fail silently
        }
    }, [])

    return { fire }
}
