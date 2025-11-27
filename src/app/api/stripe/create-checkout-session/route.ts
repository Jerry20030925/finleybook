import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'
import { auth } from '@/lib/firebase'

export async function POST(req: NextRequest) {
  try {
    const { planKey, successUrl, cancelUrl, userId, email, referralCode } = await req.json()

    // Enhanced logging for debugging
    console.log('Checkout session request:', {
      planKey,
      userId: userId ? `${userId.substring(0, 8)}...` : 'missing',
      email: email ? `${email.substring(0, 3)}***` : 'missing'
    })

    if (!stripe) {
      console.error('Stripe is not initialized - check STRIPE_SECRET_KEY')
      return NextResponse.json(
        {
          error: 'Payment system configuration error',
          details: 'Stripe not properly configured'
        },
        { status: 500 }
      )
    }

    // Validate plan
    if (!planKey || !(planKey in SUBSCRIPTION_PLANS)) {
      console.error('Invalid plan key:', planKey)
      return NextResponse.json(
        {
          error: 'Invalid subscription plan',
          details: `Plan '${planKey}' not found`
        },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planKey as SubscriptionPlan]

    // Skip checkout for free plan
    if (planKey === 'FREE') {
      return NextResponse.json(
        {
          error: 'Free plan does not require checkout',
          details: 'Use direct upgrade for free plan'
        },
        { status: 400 }
      )
    }

    if (!userId || !email) {
      console.error('Missing required fields:', { userId: !!userId, email: !!email })
      return NextResponse.json(
        {
          error: 'User authentication required',
          details: 'User ID and email are required'
        },
        { status: 400 }
      )
    }

    // Validate Price ID is configured
    const stripePriceId = (plan as any).stripePriceId
    if (!stripePriceId || stripePriceId.startsWith('price_1OTest')) {
      console.error('Price ID not configured for plan:', planKey, stripePriceId)
      return NextResponse.json(
        {
          error: 'Subscription plan not configured',
          details: 'Price ID missing for selected plan'
        },
        { status: 500 }
      )
    }

    // Create or retrieve customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
        console.log('Found existing customer:', customer.id)
      } else {
        customer = await stripe.customers.create({
          email: email,
          metadata: {
            userId: userId,
            source: 'finleybook',
          },
        })
        console.log('Created new customer:', customer.id)
      }
    } catch (error: any) {
      console.error('Customer creation/retrieval error:', error)
      return NextResponse.json(
        {
          error: 'Customer setup failed',
          details: error.message || 'Unable to create or find customer account'
        },
        { status: 500 }
      )
    }

    // Create checkout session
    try {
      console.log('Creating checkout session with price ID:', stripePriceId)

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        discounts: referralCode ? [{
          coupon: 'REF_FRIEND_1MO', // Ensure this coupon exists in Stripe Dashboard
        }] : undefined,
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          planKey,
          userId: userId,
          referralCode: referralCode || '',
        },
        subscription_data: {
          metadata: {
            planKey,
            userId: userId,
            referralCode: referralCode || '',
          },
        },
        automatic_tax: {
          enabled: false, // Disable to avoid tax calculation errors
        },
        allow_promotion_codes: true,
      })

      console.log('Checkout session created successfully:', session.id)

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    } catch (stripeError: any) {
      console.error('Stripe checkout session error:', stripeError)

      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message.includes('price')) {
          return NextResponse.json(
            {
              error: 'Invalid price configuration',
              details: `Price ID '${stripePriceId}' not found in Stripe`
            },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        {
          error: 'Payment system error',
          details: stripeError.message || 'Unknown Stripe error'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}