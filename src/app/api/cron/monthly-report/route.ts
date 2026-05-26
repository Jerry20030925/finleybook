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
        const db = adminDb;
        const usersSnapshot = await db.collection('users').get();

        // Calculate date range for last month
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const monthName = firstDayLastMonth.toLocaleString('default', { month: 'long' });
        const monthKey = `${firstDayLastMonth.getFullYear()}_${String(firstDayLastMonth.getMonth() + 1).padStart(2, '0')}`;

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
                    const userId = userDoc.id;
                    const email = userData.email;

                    if (!email) return;

                    // Skip users who opted out of report emails
                    if (userData.emailPreferences?.reports === false) {
                        skipped++;
                        return;
                    }

                    // Duplicate-send guard
                    const emailLog = userData.emailLog || {};
                    if (emailLog[`monthlyReport_${monthKey}`]) {
                        skipped++;
                        return;
                    }

                    // Fetch transactions for last month
                    const txsSnapshot = await db.collection('transactions')
                        .where('userId', '==', userId)
                        .where('date', '>=', firstDayLastMonth)
                        .where('date', '<=', lastDayLastMonth)
                        .get();

                    let totalSpent = 0;
                    let totalEarnings = 0;
                    const categoryMap: Record<string, number> = {};

                    txsSnapshot.docs.forEach(doc => {
                        const tx = doc.data();
                        const amount = Math.abs(tx.amount);

                        if (tx.type === 'expense') {
                            totalSpent += amount;
                            if (tx.category) {
                                categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amount;
                            }
                        } else if (tx.type === 'income' && tx.isCashback) {
                            totalEarnings += amount;
                        }
                    });

                    // Find top category
                    let topCategory = 'General';
                    let maxCatAmount = 0;
                    Object.entries(categoryMap).forEach(([cat, amount]) => {
                        if (amount > maxCatAmount) {
                            maxCatAmount = amount;
                            topCategory = cat;
                        }
                    });

                    // Only send if there was activity
                    if (totalSpent > 0 || totalEarnings > 0) {
                        console.log(`Sending monthly report to: ${email}`);
                        await ResendService.sendMonthlyReportEmail(email, userData.displayName || 'Friend', {
                            monthName,
                            totalSpent: totalSpent.toFixed(2),
                            totalEarnings: totalEarnings.toFixed(2),
                            topCategory,
                            percentage: totalSpent > 0 ? ((totalEarnings / totalSpent) * 100).toFixed(1) : '0',
                        });

                        // Mark as sent for this month
                        await userDoc.ref.update({
                            [`emailLog.monthlyReport_${monthKey}`]: true,
                            'emailLog.lastSent': new Date(),
                        });

                        emailCount++;
                    }
                })
            );

            batchResults.forEach((r) => {
                if (r.status === 'rejected') {
                    console.error('Monthly report batch error:', r.reason);
                    errors++;
                }
            });
        }

        return NextResponse.json({ success: true, emailsSent: emailCount, skipped, errors });
    } catch (error: any) {
        console.error('Monthly Report Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
