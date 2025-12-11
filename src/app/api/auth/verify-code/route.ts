import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const docRef = adminDb.collection('verificationCodes').doc(email);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        const data = doc.data();

        if (!data) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Check expiration
        if (Date.now() > data.expiresAt.toMillis()) {
            return NextResponse.json({ error: 'Code expired' }, { status: 400 });
        }

        // Check code match
        if (data.code !== code) {
            // Increment attempts
            await docRef.update({
                attempts: (data.attempts || 0) + 1
            });
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Delete used code
        await docRef.delete();

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Verify code error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
