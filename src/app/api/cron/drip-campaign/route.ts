import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ResendService } from '@/lib/resendService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Verify authorization (e.g. check for a secret header from Vercel Cron)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow local dev testing without secret if needed, or enforce strict auth
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
            sentHiddenFeatures: 0,
            sentDiscount: 0,
            errors: 0
        };

        const now = new Date();

        for (const doc of usersSnapshot.docs) {
            const user = doc.data();
            const signupDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);

            if (!signupDate) continue;

            const diffTime = Math.abs(now.getTime() - signupDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Check if email already sent
            const emailLog = user.emailLog || {};

            // Day 3: Hidden Features
            if (diffDays === 3 && !emailLog.hiddenFeaturesSent) {
                try {
                    await ResendService.sendHiddenFeaturesEmail(user.email, user.displayName?.split(' ')[0]);
                    await doc.ref.update({
                        'emailLog.hiddenFeaturesSent': true,
                        'emailLog.lastSent': new Date()
                    });
                    results.sentHiddenFeatures++;
                } catch (e) {
                    console.error(`Failed to send Day 3 email to ${user.email}`, e);
                    results.errors++;
                }
            }

            // Day 7: Discount (Free users only)
            if (diffDays === 7 && !emailLog.discountSent && user.subscriptionStatus !== 'active') {
                try {
                    await ResendService.sendDiscountEmail(user.email, user.displayName?.split(' ')[0]);
                    await doc.ref.update({
                        'emailLog.discountSent': true,
                        'emailLog.lastSent': new Date()
                    });
                    results.sentDiscount++;
                } catch (e) {
                    console.error(`Failed to send Day 7 email to ${user.email}`, e);
                    results.errors++;
                }
            }

            results.processed++;
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
