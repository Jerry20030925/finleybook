import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!adminAuth) {
            return new NextResponse('Auth Error', { status: 500 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }

        // 1. Get User Data (Balance & Stripe Account ID)
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData) {
            return new NextResponse('User not found', { status: 404 });
        }

        const availableBalance = userData.wallet?.available || 0;
        const stripeAccountId = userData.stripeAccountId;

        if (availableBalance <= 0) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Check Withdrawal Limits
        const isPro = userData.subscription?.plan === 'pro' && userData.subscription?.status === 'active';
        const limit = isPro ? 50000 : 5000; // $500 vs $50 (in cents)

        if (availableBalance > limit) {
            return NextResponse.json({
                error: `Withdrawal limit exceeded. ${isPro ? 'Pro limit is $500/month.' : 'Free limit is $50/month. Upgrade to Pro for higher limits.'}`
            }, { status: 400 });
        }

        if (!stripeAccountId) {
            return NextResponse.json({ error: 'No bank account connected. Please connect Stripe first.' }, { status: 400 });
        }

        // Check if account is restricted
        if (userData.stripeAccountStatus && !userData.stripeAccountStatus.payoutsEnabled) {
            return NextResponse.json({ error: 'Your account is restricted. Please complete Stripe setup in Wallet settings.' }, { status: 400 });
        }

        // 2. Create Transfer to Connected Account
        // Note: In production, you might want to batch these or use manual payouts.
        // For this flow, we'll do an instant transfer (or standard payout).

        // Since we are the platform, we transfer FROM our platform account TO the connected account.
        // Amount is in cents.
        const amountInCents = Math.round(availableBalance * 100);

        const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: 'aud', // Assuming AUD for now
            destination: stripeAccountId,
            description: `Cashback Payout for ${userData.email}`,
        });

        // 3. Deduct Balance & Record Transaction
        const batch = adminDb.batch();

        // Deduct from Available Balance
        const userRef = adminDb.collection('users').doc(userId);
        batch.update(userRef, {
            'wallet.available': FieldValue.increment(-availableBalance)
        });

        // Create Withdrawal Transaction
        const transactionRef = adminDb.collection('transactions').doc();
        batch.set(transactionRef, {
            id: transactionRef.id,
            userId,
            type: 'withdrawal',
            amount: availableBalance,
            currency: 'AUD',
            status: 'PAID',
            stripeTransferId: transfer.id,
            date: Timestamp.now(),
            createdAt: Timestamp.now()
        });

        await batch.commit();

        return NextResponse.json({ success: true, transferId: transfer.id });

    } catch (error: any) {
        console.error('Payout Error:', error);
        return NextResponse.json({ error: error.message || 'Payout failed' }, { status: 500 });
    }
}
