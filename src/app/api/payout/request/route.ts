import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        // 1. Auth Check (Mocked)
        // const userId = request.headers.get('x-user-id');
        // if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Mock user ID for demo
        const userId = 'mock-user-id';

        // 2. Get User Balance & Stripe Account
        if (!adminDb) {
            console.error('Firebase Admin not initialized');
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        const availableBalance = userData?.wallet_snapshot?.available_balance || 0;
        const stripeAccountId = userData?.affiliate_settings?.stripe_account_id;

        if (!stripeAccountId) {
            return NextResponse.json({ error: 'No payout method linked' }, { status: 400 });
        }

        if (availableBalance < 5000) { // Min $50.00
            return NextResponse.json({ error: 'Insufficient funds (Min $50)' }, { status: 400 });
        }

        // 3. Initiate Transfer (Payout)
        // In a real Connect flow, you might Transfer to the connected account first, then Payout
        // Or if you use Destination Charges, funds are already there.
        // Assuming we hold funds in Platform and Transfer to Connected Account:

        // const transfer = await stripe.transfers.create({
        //   amount: availableBalance,
        //   currency: 'aud',
        //   destination: stripeAccountId,
        // });

        // 4. Update Ledger & Balance
        const batch = adminDb.batch();

        // Debit Ledger
        const ledgerRef = adminDb.collection('wallet_ledger').doc();
        batch.set(ledgerRef, {
            userId,
            type: 'PAYOUT_REQUEST',
            amount: -availableBalance,
            currency: 'AUD',
            status: 'PENDING', // Or CLEARED if instant
            source: {
                network: 'SYSTEM',
                external_ref_id: 'transfer_mock_id', // transfer.id
                merchant_name: 'Finleybook Payout',
            },
            created_at: FieldValue.serverTimestamp(),
        });

        // Update User Snapshot
        batch.update(userDoc.ref, {
            'wallet_snapshot.available_balance': 0, // Reset to 0
        });

        await batch.commit();

        return NextResponse.json({ success: true, amount: availableBalance });

    } catch (error) {
        console.error('Payout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
