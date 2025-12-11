import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateTrackingLink } from '@/lib/affiliate';
import { Merchant } from '@/types/rebate';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('mid');
    const type = searchParams.get('type') || 'CASHBACK'; // 'CASHBACK', 'BOUNTY', 'GLITCH'
    const targetUrl = searchParams.get('url'); // For Bounties/Glitches that are direct links

    // In a real app, you should validate the session here using a server-side auth check
    // For now, we'll assume the client sends the userId in a header or we trust the session cookie if we had one
    // But since we are using client-side auth mostly, we might need to pass a token.
    // To keep it simple for this MVP, we'll assume the user is authenticated if they can hit this endpoint 
    // (or we could pass userId as a param, but that's insecure).
    // BETTER: Use Firebase Admin verifyIdToken if we passed an Authorization header.

    // Let's try to get the Authorization header
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        try {
            // We need adminAuth to verify
            const { adminAuth } = await import('@/lib/firebase-admin');
            if (adminAuth) {
                const decodedToken = await adminAuth.verifyIdToken(token);
                userId = decodedToken.uid;
            } else {
                console.error('Firebase Admin Auth not initialized');
            }
        } catch (e) {
            console.error('Token verification failed', e);
        }
    }

    // Fallback for demo/testing if no token provided (NOT SECURE for production)
    // We'll look for a 'uid' query param just for testing purposes if auth fails
    if (!userId) {
        userId = searchParams.get('uid');
    }

    if (!userId) {
        return NextResponse.json({ error: 'Missing parameters or unauthorized' }, { status: 400 });
    }

    try {
        // Handle Bounty/Glitch Direct Tracking
        if (type === 'BOUNTY' || type === 'GLITCH') {
            if (!targetUrl) return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });

            // Log the click
            if (!adminDb) {
                return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
            }
            await adminDb.collection('affiliate_clicks').add({
                userId,
                type,
                targetUrl,
                click_time: Timestamp.now(),
                user_ip: request.headers.get('x-forwarded-for') || 'unknown',
            });

            return NextResponse.redirect(targetUrl);
        }

        // Handle Standard Cashback (Merchant ID required)
        if (!merchantId) {
            return NextResponse.json({ error: 'Missing merchant ID' }, { status: 400 });
        }
        // 1. Get Merchant Details
        let merchant: Merchant | undefined;

        // 1. Try to find in hardcoded list first (for speed/fallback)
        const { MOVIE_MERCHANTS } = await import('@/lib/merchants');
        merchant = MOVIE_MERCHANTS.find(m => m.id === merchantId);

        // 2. If not found, check Firestore
        if (!merchant) {
            if (!adminDb) {
                return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
            }
            const merchantDoc = await adminDb.collection('merchants').doc(merchantId).get();
            if (merchantDoc.exists) {
                merchant = merchantDoc.data() as Merchant;
            }
        }

        if (!merchant) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // 2. Create Click Record
        if (!adminDb) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }
        const clickRef = adminDb.collection('affiliate_clicks').doc();
        const clickId = clickRef.id;

        await clickRef.set({
            userId,
            merchantId,
            merchantName: merchant.name,
            type: 'CASHBACK',
            click_time: Timestamp.now(),
            unique_id_generated: userId, // We use userId as the primary tracking ID
            click_id: clickId,
            user_ip: request.headers.get('x-forwarded-for') || 'unknown',
        });

        // 3. Generate Link
        const trackingLink = generateTrackingLink(merchant, userId, clickId);

        // 4. Redirect
        return NextResponse.redirect(trackingLink);

    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
