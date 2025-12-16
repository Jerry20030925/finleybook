import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * Calculates the new streak based on the last login date.
 * 
 * Rules:
 * - If last login was today: No change.
 * - If last login was yesterday: Streak + 1.
 * - If last login was before yesterday: Reset to 1.
 */
export const calculateStreak = (lastLoginDate: Date | null, currentStreak: number = 0): { streak: number, isStreakActive: boolean } => {
    if (!lastLoginDate) {
        return { streak: 1, isStreakActive: true }
    }

    const now = new Date()

    // Convert to simplified date strings (YYYY-MM-DD) for local time comparison
    // This avoids issues with finding "yesterday" across midnight if using raw timestamps
    const toDateString = (date: Date) => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    const todayStr = toDateString(now)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = toDateString(yesterday)

    // Last login date string
    const lastLoginStr = toDateString(lastLoginDate)

    if (lastLoginStr === todayStr) {
        // Logged in today already
        return { streak: Math.max(1, currentStreak), isStreakActive: true }
    } else if (lastLoginStr === yesterdayStr) {
        // Logged in yesterday - Streak continues!
        return { streak: currentStreak + 1, isStreakActive: true }
    } else {
        // Missed a day (last login was before yesterday) - Reset
        // Note: If lastLoginDate is in future (time sync issue), default to keep current or 1.
        // We will assume reset to 1.
        return { streak: 1, isStreakActive: true }
    }
}

/**
 * Updates the user's streak in Firestore.
 * Should be called on every app initialization/login.
 */
export const updateUserStreak = async (userId: string) => {
    if (!userId) return

    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        // Default values for new users
        let streak = 0
        let lastLoginDate: Date | null = null

        if (userSnap.exists()) {
            const data = userSnap.data()
            const lastLoginTimestamp = data.lastLogin as Timestamp
            streak = data.streak || 0
            if (lastLoginTimestamp) {
                lastLoginDate = lastLoginTimestamp.toDate()
            }
        }

        // Calculate new values with current time
        const newValues = calculateStreak(lastLoginDate, streak)
        const newStreak = newValues.streak

        const { setDoc } = await import('firebase/firestore') // Dynamic import to match usage

        // Use setDoc with merge: true to handle both new and existing documents gracefully
        await setDoc(userRef, {
            streak: newStreak,
            lastLogin: serverTimestamp(),
        }, { merge: true })

        return newStreak
    } catch (error) {
        console.error('Error updating streak:', error)
    }
    return 0
}
