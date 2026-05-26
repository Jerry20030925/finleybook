
import { useState, useEffect } from 'react'
import { isMobileDevice } from '@/lib/mobileUtils'

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const update = () => {
            setIsMobile(isMobileDevice())
        }

        update()
        window.addEventListener('resize', update, { passive: true })
        window.addEventListener('orientationchange', update)

        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('orientationchange', update)
        }
    }, [])

    return isMobile
}
