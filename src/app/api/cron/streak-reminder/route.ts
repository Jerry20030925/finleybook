import { getAdminDb } from '@/lib/firebaseAdmin' // PROJ-SCOPED: Use Admin SDK for server-side privileged access
import ResendService from '@/lib/resendService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Define "Today" and "Yesterday" based on Server Time (UTC usually in Vercel)
        // Ideally we'd use user timezone, but for MVP global UTC cutoffs are acceptable
        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)

        const yesterdayStart = new Date(todayStart)
        yesterdayStart.setDate(todayStart.getDate() - 1)

        // Admin SDK Initialization
        const db = getAdminDb()

        // Query users who logged in Yesterday (between yesterdayStart and todayStart)
        // If they logged in AFTER todayStart, they are safe.
        // If they logged in BEFORE yesterdayStart, their streak is already broken (or inactive).
        // So we strictly want: YesterdayStart <= lastLogin < TodayStart
        const snapshot = await db.collection('users')
            .where('lastLogin', '>=', yesterdayStart)
            .where('lastLogin', '<', todayStart)
            .get()

        let sentCount = 0
        const processingErrors = []

        for (const doc of snapshot.docs) {
            const user = doc.data()

            // Double check streak is worth saving (> 1 makes more sense, or even > 0 to build habit)
            // Let's say streak >= 1
            if (user.streak && user.streak > 0) {
                try {
                    // Check if we already sent a reminder today?
                    // (Optional: add a 'lastStreakReminder' field to user to avoid spam if cron runs multiple times)
                    // For now, assume cron runs ONCE per day.

                    await ResendService.sendStreakReminder(
                        user.email,
                        user.displayName || user.name || 'Friend',
                        user.streak
                    )
                    sentCount++
                } catch (err: any) {
                    console.error(`Failed to send reminder to ${user.email}:`, err)
                    processingErrors.push({ email: user.email, error: err.message })
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: snapshot.size,
            sent: sentCount,
            errors: processingErrors
        })

    } catch (error: any) {
        console.error('Streak Cron Error:', error)
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
    }
}
