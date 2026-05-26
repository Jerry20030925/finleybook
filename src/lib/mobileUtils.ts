
import { Capacitor } from '@capacitor/core'

/**
 * Checks if the application is running in a native mobile environment (iOS or Android).
 * This usually returns true when running inside a Capacitor Web View.
 */
export const isMobileApp = (): boolean => {
    if (typeof window === 'undefined') return false
    return Capacitor.isNativePlatform()
}

/**
 * Detects whether the current browser environment is likely a mobile device.
 * Keeps native-app detection separate so platform-specific features remain safe.
 */
export const isMobileBrowser = (): boolean => {
    if (typeof window === 'undefined') return false

    const ua = navigator.userAgent || navigator.vendor || ''
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const narrowViewport = window.matchMedia?.('(max-width: 1024px)').matches ?? window.innerWidth <= 1024

    return narrowViewport && (mobileUA || coarsePointer)
}

/**
 * Unified mobile detection for UI adaptation.
 */
export const isMobileDevice = (): boolean => {
    return isMobileApp() || isMobileBrowser()
}
