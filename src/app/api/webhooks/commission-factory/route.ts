import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { Transaction, TransactionStatus } from '@/types/rebate';

// Commission Factory Webhook Payload Interface
interface CFWebhookPayload {
    Id: string; // Transaction ID
    Status: 'Pending' | 'Approved' | 'Void';
    Commission: number; // The commission amount YOU receive
    SaleValue: number;
    UniqueId: string; // This is our userId
    UniqueId2?: string; // This is our clickId
    MerchantId: string;
    MerchantName: string;
    Currency: string;
    DateCreated: string;
}

export async function POST(request: Request) {
    if (!adminDb) {
        return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 });
    }
    try {
        const rawBody = await request.text();
        // TODO: Verify HMAC Signature here in production

        const payload: CFWebhookPayload = JSON.parse(rawBody);
        const { Id, Status, Commission, UniqueId, UniqueId2, MerchantName, SaleValue, Currency } = payload;

        if (!UniqueId || !UniqueId2) {
            return NextResponse.json({ error: 'Missing UniqueId or UniqueId2' }, { status: 400 });
        }

        // 1. Verify Click Existence (Attribution)
        const clickDoc = await adminDb.collection('clicks').doc(UniqueId2).get();
        if (!clickDoc.exists) {
            console.warn(`Click ${UniqueId2} not found for transaction ${Id}. Attribution failed.`);
            // We might still want to record it, but flag it. For now, proceed.
        }

        // 2. Map Status
        const statusMap: Record<string, TransactionStatus> = {
            'Pending': 'PENDING',
            'Approved': 'APPROVED', // Funds are confirmed but maybe not yet payable (holding period)
            'Void': 'DECLINED'
        };
        const newStatus = statusMap[Status] || 'PENDING';

        // 3. Idempotency & Transaction Record
        const txRef = adminDb.collection('transactions').doc(`cf_${Id}`);
        const txDoc = await txRef.get();

        const userDoc = await adminDb.collection('users').doc(UniqueId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const isPro = userData?.subscription?.plan === 'pro';

        // Hybrid Model: Pro gets 100%, Free gets 50%
        const userShare = isPro ? Commission : Commission * 0.5;

        // Amounts in standard units (Dollars) for Transaction record, Cents for Ledger
        const amountInCents = Math.round(userShare * 100);

        const batch = adminDb.batch();

        if (txDoc.exists) {
            // UPDATE existing transaction
            const existingTx = txDoc.data() as Transaction;

            if (existingTx.networkStatus !== Status) {
                // Status changed
                batch.update(txRef, {
                    networkStatus: Status,
                    status: newStatus,
                    updatedAt: Timestamp.now()
                });

                // Update Ledger & User Balance based on state transition
                // Case 1: Pending -> Approved (Confirmed)
                if (existingTx.status === 'PENDING' && newStatus === 'APPROVED') {
                    // Move from Pending Balance to Available Balance? 
                    // Or just keep in Pending until "Payable"? 
                    // For simplicity in this MVP: Approved = Available.
                    // In real world, there is a "Locking Period".

                    batch.update(userDoc.ref, {
                        'wallet_snapshot.pending_balance': FieldValue.increment(-amountInCents),
                        'wallet_snapshot.available_balance': FieldValue.increment(amountInCents),
                        'wallet_snapshot.lifetime_earnings': FieldValue.increment(amountInCents)
                    });

                    // Ledger Entry for Approval
                    const ledgerRef = adminDb.collection('wallet_ledger').doc();
                    batch.set(ledgerRef, {
                        userId: UniqueId,
                        type: 'COMMISSION_APPROVED',
                        amount: amountInCents,
                        currency: Currency || 'AUD',
                        status: 'CLEARED',
                        source: { network: 'COMMISSION_FACTORY', external_ref_id: Id, merchant_name: MerchantName },
                        created_at: FieldValue.serverTimestamp()
                    });
                }

                // Case 2: Pending -> Declined
                if (existingTx.status === 'PENDING' && newStatus === 'DECLINED') {
                    batch.update(userDoc.ref, {
                        'wallet_snapshot.pending_balance': FieldValue.increment(-amountInCents)
                    });

                    // Ledger Entry for Decline
                    const ledgerRef = adminDb.collection('wallet_ledger').doc();
                    batch.set(ledgerRef, {
                        userId: UniqueId,
                        type: 'COMMISSION_DECLINED',
                        amount: -amountInCents, // Negative to show removal? Or just 0 with type?
                        // Actually, ledger usually records movements. 
                        // If we added to pending, we should remove from pending.
                        // But ledger usually tracks "Available" funds history. 
                        // Pending funds are often just a snapshot state.
                        // Let's just update the snapshot and log a "VOID" event for audit.
                        currency: Currency || 'AUD',
                        status: 'VOIDED',
                        source: { network: 'COMMISSION_FACTORY', external_ref_id: Id, merchant_name: MerchantName },
                        created_at: FieldValue.serverTimestamp()
                    });
                }
            }
        } else {
            // CREATE new transaction
            const newTx: Transaction = {
                id: txRef.id,
                userId: UniqueId,
                clickId: UniqueId2,
                merchantName: MerchantName,
                externalTxId: Id,
                networkStatus: Status,
                orderAmount: SaleValue,
                commissionAmount: Commission,
                userCashbackAmount: userShare,
                currency: Currency || 'AUD',
                status: newStatus,
                occurredAt: Timestamp.now(), // Approximation
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            batch.set(txRef, newTx);

            // Initial Ledger Entry (Pending)
            if (newStatus === 'PENDING') {
                batch.update(userDoc.ref, {
                    'wallet_snapshot.pending_balance': FieldValue.increment(amountInCents)
                });

                // Optional: Log pending in ledger? 
                // Usually ledger is for "Real Money". Pending is "Potential Money".
                // We'll skip adding to 'wallet_ledger' for Pending to keep ledger clean, 
                // relying on 'transactions' collection for pending state.
                // BUT, the user wants to see it in the UI. 
                // Let's add it with status 'PENDING' to ledger for visibility if needed, 
                // or just query 'transactions' for pending items.
                // Decision: Query 'transactions' for pending. Ledger for confirmed.
            }
        }

        await batch.commit();
        return NextResponse.json({ success: true, id: txRef.id });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
