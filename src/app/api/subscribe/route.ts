import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import ResendService from '@/lib/resendService';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // 1. Save to Firestore (Subscribers collection)
        const adminDb = getAdminDb();
        const subscriberRef = adminDb.collection('subscribers').doc(email);
        const existingDoc = await subscriberRef.get();

        if (existingDoc.exists) {
            // Already subscribed, just update timestamp
            await subscriberRef.update({
                lastUpdated: FieldValue.serverTimestamp(),
                active: true
            });
            return NextResponse.json({ message: 'Welcome back! You are already subscribed.' });
        }

        await subscriberRef.set({
            email,
            subscribedAt: FieldValue.serverTimestamp(),
            source: 'footer',
            active: true,
            tags: ['newsletter', 'global_footer']
        });

        // 2. Send Welcome Email
        try {
            await ResendService.sendNewsletterWelcomeEmail(email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the request, just log it
        }

        return NextResponse.json({ message: 'Successfully subscribed!' });
    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
