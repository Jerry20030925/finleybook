import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ResendService } from '@/lib/resendService';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // Store in Firestore
        await adminDb.collection('verificationCodes').doc(email).set({
            code,
            expiresAt: Timestamp.fromMillis(expiresAt),
            createdAt: Timestamp.now(),
            attempts: 0
        });

        // Send email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finleybook.com';
        const verificationLink = `${baseUrl}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;
        await ResendService.sendVerificationEmail(email, name || 'there', code, verificationLink);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Send code error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
