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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastLogin = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate())

    // Difference in days
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        // Logged in today already
        return { streak: Math.max(1, currentStreak), isStreakActive: true }
    } else if (diffDays === 1) {
        // Logged in yesterday - Streak continues!
        return { streak: currentStreak + 1, isStreakActive: true }
    } else {
        // Missed a day or more - Reset
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

        if (userSnap.exists()) {
            const data = userSnap.data()
            const lastLoginTimestamp = data.lastLogin as Timestamp
            const currentStreak = data.streak || 0

            const lastLoginDate = lastLoginTimestamp ? lastLoginTimestamp.toDate() : null

            // Calculate new values
            const { streak } = calculateStreak(lastLoginDate, currentStreak)

            // Only update if it changed or if we need to set the lastLogin to now
            // We always update lastLogin to "now" on a fresh session visit, 
            // so we might as well write the streak too.
            await updateDoc(userRef, {
                streak: streak,
                lastLogin: serverTimestamp(),
                // Store a "streakLastUpdated" to prevent double counting if we called this multiple times a day?
                // Actually calculateStreak handles "today" case safely (no increment).
            })

            return streak
        }
    } catch (error) {
        console.error('Error updating streak:', error)
    }
    return 0
}
