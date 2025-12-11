import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId } = await req.json()

        if (!priceId || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Determine base URL
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                // Fallback to request origin if available
                const origin = req.headers.get('origin');
                if (origin) {
                    baseUrl = origin;
                } else {
                    baseUrl = 'https://finleybook.com'; // Hard fallback
                }
            }
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/subscribe`,
            client_reference_id: userId,
            metadata: {
                userId,
            },
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
