import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { generateTrackingLink } from '@/lib/affiliate';
import { Merchant, ClickEvent } from '@/types/rebate';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(
    request: Request,
    { params }: { params: { merchantId: string } }
) {
    const merchantId = params.merchantId;
    const { searchParams } = new URL(request.url);

    // 1. Auth Check (Security)
    // In a real app, we verify the session cookie or Authorization header.
    // For this MVP, we'll check for a 'uid' query param (testing) OR Authorization header.
    let userId: string | null = null;

    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        try {
            if (adminAuth) {
                const decodedToken = await adminAuth.verifyIdToken(token);
                userId = decodedToken.uid;
            }
        } catch (e) {
            console.error('Token verification failed', e);
        }
    }

    // Fallback for testing (remove in production!)
    if (!userId) {
        userId = searchParams.get('uid');
    }

    if (!userId) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login?redirect=/wealth', request.url));
    }

    // 2. Bot Protection (Basic)
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
    if (isBot) {
        return new NextResponse('Access Denied', { status: 403 });
    }

    try {
        if (!adminDb) {
            return new NextResponse('Database Error', { status: 500 });
        }

        // 3. Get Merchant Details
        const merchantDoc = await adminDb.collection('merchants').doc(merchantId).get();
        if (!merchantDoc.exists) {
            return new NextResponse('Merchant Not Found', { status: 404 });
        }
        const merchant = merchantDoc.data() as Merchant;

        // 4. Tokenization (Generate Click ID)
        // We use Firestore's auto-generated ID as the unique click ID.
        const clickRef = adminDb.collection('clicks').doc();
        const clickId = clickRef.id;

        // 5. Persistence (Save Intent)
        const clickEvent: ClickEvent = {
            id: clickId,
            userId,
            merchantId,
            merchantName: merchant.name,
            type: 'CASHBACK',
            click_time: Timestamp.now(),
            user_ip: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: userAgent,
            status: 'CREATED'
        };

        await clickRef.set(clickEvent);

        // 6. Propagation (Construct Link & Redirect)
        // We pass the clickId as the 'uniqueId' (CF) or 'subId1' (Impact)
        const trackingLink = generateTrackingLink(merchant, userId, clickId);

        // Update status to REDIRECTED (async, don't await to speed up redirect)
        clickRef.update({ status: 'REDIRECTED' }).catch(console.error);

        // 7. Auto-Log Hook (The "Spending Loop")
        // Create a transaction record immediately to close the loop
        // We estimate the amount (placeholder) or leave it 0 for user to fill
        // ideally we would pass the amount in the query string if known

        const estimatedAmount = Number(searchParams.get('amount')) || 0;
        // If no amount, we might not want to clog the feed, OR we create a "Draft" transaction
        // For the "Effect", let's create it if we have an amount, or create a 'Click' record that shows up as a potential savings

        if (estimatedAmount > 0) {
            const projectedCashback = estimatedAmount * (merchant.base_commission_rate || 0.05); // Default 5% if missing

            await adminDb.collection('transactions').add({
                userId,
                amount: estimatedAmount,
                currency: 'AUD',
                description: `Purchase at ${merchant.name}`,
                category: 'Shopping', // Default
                type: 'expense',
                date: Timestamp.now(),
                createdAt: Timestamp.now(),
                merchantName: merchant.name,
                projectedCashback: projectedCashback,
                netCost: estimatedAmount - projectedCashback,
                emotionalTag: 'happy', // "Smart Spending"
                source: 'auto_log', // Tracking source
                isPending: true // Flag to indicate it might need confirmation
            });
        }


        // 307 Temporary Redirect (preserves method, though GET is idempotent)
        return NextResponse.redirect(trackingLink, { status: 307 });

    } catch (error) {
        console.error('Tracking Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
