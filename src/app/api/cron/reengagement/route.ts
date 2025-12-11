import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import ResendService from '@/lib/resendService';

export async function GET(request: Request) {
    // 1. Verify Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }
        const db = adminDb;

        // Calculate cutoff date (14 days ago)
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Query inactive users
        const usersSnapshot = await db.collection('users')
            .where('lastLogin', '<', cutoffDate)
            .get();

        let emailCount = 0;

        const promises = usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const email = userData.email;

            if (!email) return;

            // Spam Prevention: Check if we sent this recently (e.g., in the last 30 days)
            const lastSent = userData.lastReengagementEmailSent?.toDate();
            if (lastSent) {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (lastSent > thirtyDaysAgo) {
                    return; // Skip if sent recently
                }
            }

            // Send Email
            console.log(`Sending re-engagement email to: ${email}`);
            await ResendService.sendReengagementEmail(email, userData.displayName || 'Friend');

            // Update lastReengagementEmailSent
            await userDoc.ref.update({
                lastReengagementEmailSent: new Date()
            });

            emailCount++;
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, emailsSent: emailCount });
    } catch (error: any) {
        console.error('Re-engagement Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
