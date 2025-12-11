import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        // 1. Authenticate User
        const authHeader = request.headers.get('authorization');
        let userId: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            try {
                if (adminAuth) {
                    const decodedToken = await adminAuth.verifyIdToken(token);
                    userId = decodedToken.uid;
                } else {
                    console.error('Firebase Admin Auth not initialized');
                    return NextResponse.json({ error: 'Server Error: Admin Auth not initialized' }, { status: 500 });
                }
            } catch (e: any) {
                console.error('Token verification failed:', e);
                // Return the specific error message from Firebase
                return NextResponse.json({ error: `Auth Failed: ${e.message}` }, { status: 401 });
            }
        }

        // Fallback for demo/dev if no token provided (remove in production)
        if (!userId) {
            // Try to get from header if token fails (only for dev)
            userId = request.headers.get('x-user-id') || undefined;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization Header' }, { status: 401 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('Stripe Secret Key missing');
            return NextResponse.json({ error: 'Stripe not configured. Please contact support.' }, { status: 500 });
        }

        if (!adminDb) {
            console.error('Firebase Admin Database not initialized');
            return NextResponse.json({ error: 'Database not initialized. Please contact support.' }, { status: 500 });
        }

        const db = adminDb;

        // 2. Check if user already has a Stripe Account ID
        const userDocRef = db.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.error(`User document not found for userId: ${userId}`);
            return NextResponse.json({ error: 'User not found. Please ensure you are logged in.' }, { status: 404 });
        }

        const userData = userDoc.data();
        let accountId = userData?.stripeAccountId;

        console.log(`Processing Stripe Connect for user ${userId}, existing accountId: ${accountId ? 'exists' : 'none'}`);

        if (!accountId) {
            console.log(`Creating new Stripe Express account for user ${userId}`);
            // Create Express Account
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'AU', // Default to AU for this project
                email: userData?.email,
                business_type: 'individual',
                business_profile: {
                    mcc: '8999', // Other professional services (Most generic & easiest to pass)
                    product_description: 'Cashback rewards and payouts',
                    support_url: 'https://finleybook.com',
                },
                capabilities: {
                    transfers: { requested: true },
                },
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'manual', // Allow manual payouts
                        },
                    },
                },
            });
            accountId = account.id;
            console.log(`Created Stripe account: ${accountId}`);

            // Save to Firestore
            await userDocRef.update({
                stripeAccountId: accountId,
                stripeAccountCreated: new Date().toISOString()
            });
            console.log(`Saved Stripe account ID to user document`);
        } else {
            // Account exists, fetch latest status
            try {
                const account = await stripe.accounts.retrieve(accountId);
                await userDocRef.update({
                    stripeAccountStatus: {
                        chargesEnabled: account.charges_enabled,
                        payoutsEnabled: account.payouts_enabled,
                        detailsSubmitted: account.details_submitted,
                        requirements: account.requirements,
                        updatedAt: new Date()
                    }
                });
                console.log(`Updated existing Stripe account status for ${userId}`);
            } catch (e) {
                console.error('Error fetching/updating Stripe account:', e);
            }
        }

        // 3. Create Account Link
        // Use a single, explicit base URL
        const rawBaseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_BASE_URL ||
            'https://finleybook.com';

        // Validate to avoid sending garbage to Stripe
        if (!/^https?:\/\//.test(rawBaseUrl.trim())) {
            console.error('Invalid base URL env:', rawBaseUrl);
            return NextResponse.json(
                { error: `Server misconfigured: invalid base URL (${rawBaseUrl})` },
                { status: 500 }
            );
        }

        const baseUrl = rawBaseUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes

        // Use URL constructor to avoid double slashes or spaces
        const refreshUrl = new URL('/wallet?stripe=refresh', baseUrl).toString();
        const returnUrl = new URL('/wallet?stripe=return', baseUrl).toString();

        console.log('Using URLs for Stripe account link:', {
            baseUrl,
            refreshUrl,
            returnUrl,
            accountId,
        });

        const accountLink = await stripe.accountLinks.create({
            account: accountId!,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });

        console.log(`Successfully created account link: ${accountLink.url}`);

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) {
        console.error('Stripe Connect error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
