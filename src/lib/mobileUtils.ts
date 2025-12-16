
import { Capacitor } from '@capacitor/core'

/**
 * Checks if the application is running in a native mobile environment (iOS or Android).
 * This usually returns true when running inside a Capacitor Web View.
 */
export const isMobileApp = (): boolean => {
    return Capacitor.isNativePlatform()
}
