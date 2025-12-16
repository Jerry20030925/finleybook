import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!adminAuth) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the return URL
        const { returnUrl } = await req.json();

        // Ideally, you store the stripeCustomerId in your user database.
        // For this example, we'll need to retrieve it.
        // Assuming you have a way to get the customer ID.
        // If not, you might need to search for the customer by email.

        // Simplification: We will search for customer by email
        const email = decodedToken.email;
        if (!email) {
            return NextResponse.json({ error: 'User has no email' }, { status: 400 });
        }

        if (!stripe) {
            return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 });
        }

        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
        }

        const customerId = customers.data[0].id;

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/settings`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
