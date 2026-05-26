import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import ResendService from '@/lib/resendService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        if (!adminDb) {
            console.error('Firebase Admin not initialized');
            return new NextResponse('Internal Server Error: Database not connected', { status: 500 });
        }

        const usersSnapshot = await adminDb.collection('users').get();
        const results = {
            processed: 0,
            sent: { day1: 0, day3: 0, day7: 0, day14: 0 },
            skipped: 0,
            errors: 0,
        };

        const now = new Date();

        // Process in batches of 10
        const docs = usersSnapshot.docs;
        for (let i = 0; i < docs.length; i += 10) {
            const batch = docs.slice(i, i + 10);
            const batchResults = await Promise.allSettled(
                batch.map(async (doc) => {
                    const user = doc.data();
                    const signupDate = user.createdAt?.toDate
                        ? user.createdAt.toDate()
                        : new Date(user.createdAt);

                    if (!signupDate || !user.email) return;

                    // Skip users who opted out of marketing emails
                    if (user.emailPreferences?.marketing === false) {
                        results.skipped++;
                        return;
                    }

                    const diffTime = Math.abs(now.getTime() - signupDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    const emailLog = user.emailLog || {};
                    const firstName = user.displayName?.split(' ')[0] || 'there';

                    // Day 1: Welcome follow-up (quick-start tips)
                    if (diffDays === 1 && !emailLog.welcomeFollowupSent) {
                        await ResendService.sendWelcomeEmail(user.email, firstName);
                        await doc.ref.update({
                            'emailLog.welcomeFollowupSent': true,
                            'emailLog.lastSent': new Date(),
                        });
                        results.sent.day1++;
                    }

                    // Day 3: Hidden Features
                    if (diffDays === 3 && !emailLog.hiddenFeaturesSent) {
                        await ResendService.sendHiddenFeaturesEmail(user.email, firstName);
                        await doc.ref.update({
                            'emailLog.hiddenFeaturesSent': true,
                            'emailLog.lastSent': new Date(),
                        });
                        results.sent.day3++;
                    }

                    // Day 7: Discount (Free users only)
                    if (diffDays === 7 && !emailLog.discountSent && user.subscriptionStatus !== 'active') {
                        await ResendService.sendDiscountEmail(user.email, firstName);
                        await doc.ref.update({
                            'emailLog.discountSent': true,
                            'emailLog.lastSent': new Date(),
                        });
                        results.sent.day7++;
                    }

                    // Day 14: Trial ending nudge (Free users only)
                    if (diffDays === 14 && !emailLog.trialEndingSent && user.subscriptionStatus !== 'active') {
                        await ResendService.sendTrialEndingEmail(user.email, firstName, 0);
                        await doc.ref.update({
                            'emailLog.trialEndingSent': true,
                            'emailLog.lastSent': new Date(),
                        });
                        results.sent.day14++;
                    }

                    results.processed++;
                })
            );

            // Count errors from settled results
            batchResults.forEach((r) => {
                if (r.status === 'rejected') {
                    console.error('Drip campaign batch error:', r.reason);
                    results.errors++;
                }
            });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('Drip Campaign Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
