import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import ResendService from '@/lib/resendService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }

        const now = new Date();
        const cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const usersSnapshot = await adminDb.collection('users')
            .where('lastLogin', '<', cutoffDate)
            .get();

        let emailCount = 0;
        let skipped = 0;
        let errors = 0;

        // Process in batches of 10
        const docs = usersSnapshot.docs;
        for (let i = 0; i < docs.length; i += 10) {
            const batch = docs.slice(i, i + 10);
            const batchResults = await Promise.allSettled(
                batch.map(async (userDoc) => {
                    const userData = userDoc.data();
                    const email = userData.email;

                    if (!email) return;

                    // Skip users who opted out of marketing emails
                    if (userData.emailPreferences?.marketing === false) {
                        skipped++;
                        return;
                    }

                    // Spam Prevention: Check if we sent this in the last 30 days
                    const lastSent = userData.lastReengagementEmailSent?.toDate?.();
                    if (lastSent) {
                        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (lastSent > thirtyDaysAgo) {
                            skipped++;
                            return;
                        }
                    }

                    console.log(`Sending re-engagement email to: ${email}`);
                    await ResendService.sendReengagementEmail(email, userData.displayName || 'Friend');

                    await userDoc.ref.update({
                        lastReengagementEmailSent: new Date(),
                    });

                    emailCount++;
                })
            );

            batchResults.forEach((r) => {
                if (r.status === 'rejected') {
                    console.error('Reengagement batch error:', r.reason);
                    errors++;
                }
            });
        }

        return NextResponse.json({ success: true, emailsSent: emailCount, skipped, errors });
    } catch (error: any) {
        console.error('Re-engagement Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
