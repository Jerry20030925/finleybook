import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import ResendService from '@/lib/resendService';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { clickId, userId, merchantId, saleAmount, commissionAmount, status, currency } = payload;

        if (!userId || !merchantId || !saleAmount || !commissionAmount) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }

        // 1. Fetch User to check Pro status
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return new NextResponse('User not found', { status: 404 });
        }
        const userData = userDoc.data();
        const isPro = userData?.subscription?.plan === 'pro';

        // 2. Calculate Cashback
        // Free: 50% of commission
        // Pro: 100% of commission
        const userShare = isPro ? 1.0 : 0.5;
        const cashbackAmount = commissionAmount * userShare;

        // 3. Fetch Merchant Name (for email)
        const merchantDoc = await adminDb.collection('merchants').doc(merchantId).get();
        const merchantName = merchantDoc.exists ? merchantDoc.data()?.name : 'Partner Merchant';

        // 4. Create Transaction Record
        const transactionRef = adminDb.collection('transactions').doc();
        const transactionData = {
            id: transactionRef.id,
            userId,
            merchantId,
            merchantName,
            type: 'cashback',
            amount: cashbackAmount,
            saleAmount,
            commissionAmount, // Store total commission for internal records
            currency: currency || 'USD',
            status: status || 'PENDING', // PENDING, APPROVED, DECLINED, PAID
            clickId,
            date: Timestamp.now(),
            estimatedPayoutDate: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            isPro, // Snapshot of status at time of purchase
            createdAt: Timestamp.now()
        };

        await transactionRef.set(transactionData);

        // 5. Update User's Pending Balance (Atomic Increment)
        // We only increment if status is PENDING or APPROVED
        if (status === 'PENDING' || status === 'APPROVED') {
            await adminDb.collection('users').doc(userId).update({
                'wallet.pendingBalance': FieldValue.increment(cashbackAmount)
            });
        }

        // 6. Send Notification Email
        // Only send if it's a new PENDING transaction
        if (status === 'PENDING') {
            const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(cashbackAmount);
            const payoutDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

            await ResendService.sendCashbackDetectedEmail(
                userData?.email,
                userData?.displayName || 'Valued Member',
                merchantName,
                formattedAmount,
                payoutDate
            );
        }

        return NextResponse.json({ success: true, transactionId: transactionRef.id });

    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
