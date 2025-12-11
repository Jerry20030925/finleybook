import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

        const batch = adminDb.batch();

        // 1. Delete Transactions
        const transactionsSnapshot = await adminDb.collection('transactions')
            .where('userId', '==', userId)
            .get();

        transactionsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // 2. Reset Wallet Balance
        const userRef = adminDb.collection('users').doc(userId);
        batch.update(userRef, {
            wallet: {
                available: 0,
                pending: 0,
                lifetime: 0
            }
        });

        await batch.commit();

        return NextResponse.json({ success: true, count: transactionsSnapshot.size });

    } catch (error: any) {
        console.error('Clear Data Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
