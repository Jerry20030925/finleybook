import { db } from '@/lib/firebase'
import { doc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

const STREAK_MILESTONES = [7, 30, 100, 365]

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
        // Missed a day - Reset
        return { streak: 1, isStreakActive: true }
    }
}

/**
 * Get the last 7 days as date strings for the weekly calendar view.
 */
export const getLastSevenDays = (): string[] => {
    const days: string[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        days.push(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)
    }
    return days
}

/**
 * Check if a milestone was just reached and hasn't been celebrated yet.
 */
export const checkNewMilestone = (
    streak: number,
    celebratedMilestones: number[]
): number | null => {
    for (const milestone of STREAK_MILESTONES) {
        if (streak >= milestone && !celebratedMilestones.includes(milestone)) {
            return milestone
        }
    }
    return null
}

export { STREAK_MILESTONES }

/**
 * Updates the user's streak in Firestore.
 * Should be called on every app initialization/login.
 * Returns streak data including longestStreak and milestones.
 */
export const updateUserStreak = async (userId: string) => {
    if (!userId) return { streak: 0, longestStreak: 0, milestones: [] as number[], lastSevenDays: [] as string[], newMilestone: null as number | null }

    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        // Default values for new users
        let streak = 0
        let longestStreak = 0
        let milestones: number[] = []
        let loginDates: string[] = []
        let lastLoginDate: Date | null = null

        if (userSnap.exists()) {
            const data = userSnap.data()
            const lastLoginTimestamp = data.lastLogin as Timestamp
            streak = data.streak || 0
            longestStreak = data.longestStreak || 0
            milestones = data.streakMilestones || []
            loginDates = data.loginDates || []
            if (lastLoginTimestamp) {
                lastLoginDate = lastLoginTimestamp.toDate()
            }
        }

        // Calculate new values with current time
        const newValues = calculateStreak(lastLoginDate, streak)
        const newStreak = newValues.streak
        const newLongestStreak = Math.max(longestStreak, newStreak)

        // Check for new milestone
        const newMilestone = checkNewMilestone(newStreak, milestones)
        const updatedMilestones = newMilestone
            ? [...milestones, newMilestone]
            : milestones

        // Track today's login date
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
        const updatedLoginDates = loginDates.includes(todayStr)
            ? loginDates
            : [...loginDates.slice(-30), todayStr] // Keep last 30 days

        const { setDoc } = await import('firebase/firestore')

        await setDoc(userRef, {
            streak: newStreak,
            longestStreak: newLongestStreak,
            streakMilestones: updatedMilestones,
            loginDates: updatedLoginDates,
            lastLogin: serverTimestamp(),
        }, { merge: true })

        // Build last 7 days activity
        const last7 = getLastSevenDays()
        const activeDays = last7.filter(d => updatedLoginDates.includes(d))

        return {
            streak: newStreak,
            longestStreak: newLongestStreak,
            milestones: updatedMilestones,
            lastSevenDays: activeDays,
            newMilestone,
        }
    } catch (error) {
        console.error('Error updating streak:', error)
    }
    return { streak: 0, longestStreak: 0, milestones: [] as number[], lastSevenDays: [] as string[], newMilestone: null as number | null }
}
