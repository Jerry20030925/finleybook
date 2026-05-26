import { adminDb } from '@/lib/firebase-admin';
import ResendService from '@/lib/resendService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }

        // Define "Today" and "Yesterday" based on Server Time (UTC)
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(todayStart.getDate() - 1);

        const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD for duplicate guard

        // Query users who logged in yesterday but NOT today
        const snapshot = await adminDb.collection('users')
            .where('lastLogin', '>=', yesterdayStart)
            .where('lastLogin', '<', todayStart)
            .get();

        let sentCount = 0;
        let skipped = 0;
        const processingErrors: { email: string; error: string }[] = [];

        // Process in batches of 10
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 10) {
            const batch = docs.slice(i, i + 10);
            const batchResults = await Promise.allSettled(
                batch.map(async (doc) => {
                    const user = doc.data();

                    // Skip if no streak worth saving
                    if (!user.streak || user.streak <= 0) return;

                    // Skip if user opted out
                    if (user.emailPreferences?.streakReminders === false) {
                        skipped++;
                        return;
                    }

                    // Duplicate-send guard: check if already sent today
                    if (user.lastStreakReminder === todayStr) {
                        skipped++;
                        return;
                    }

                    await ResendService.sendStreakReminder(
                        user.email,
                        user.displayName || user.name || 'Friend',
                        user.streak
                    );

                    // Mark reminder sent
                    await doc.ref.update({
                        lastStreakReminder: todayStr,
                    });

                    sentCount++;
                })
            );

            batchResults.forEach((r) => {
                if (r.status === 'rejected') {
                    console.error('Streak reminder batch error:', r.reason);
                    processingErrors.push({ email: 'unknown', error: String(r.reason) });
                }
            });
        }

        return NextResponse.json({
            success: true,
            processed: snapshot.size,
            sent: sentCount,
            skipped,
            errors: processingErrors,
        });
    } catch (error: any) {
        console.error('Streak Cron Error:', error);
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
