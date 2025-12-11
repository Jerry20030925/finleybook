import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  if (!stripe) {
    console.error('Stripe is not initialized')
    return NextResponse.json(
      { error: 'Stripe configuration missing' },
      { status: 500 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (!adminDb) {
    console.error('Firebase Admin not initialized');
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any
        console.log('Checkout session completed:', session.id)

        if (session.metadata?.userId) {
          try {
            await adminDb.collection('users').doc(session.metadata.userId).update({
              subscription: {
                status: 'active',
                planKey: session.metadata.planKey,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                updatedAt: new Date(),
              }
            })
          } catch (error) {
            console.error('Error updating user subscription:', error)
          }
        }
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any
        console.log(`Subscription ${event.type}:`, subscription.id)

        if (subscription.metadata?.userId) {
          try {
            await adminDb.collection('users').doc(subscription.metadata.userId).update({
              'subscription.status': subscription.status,
              'subscription.planKey': 'PRO_MONTHLY', // Default to monthly for now, or derive from price ID
              'subscription.stripeCustomerId': subscription.customer,
              'subscription.stripeSubscriptionId': subscription.id,
              'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
              'subscription.updatedAt': new Date(),
            })
            console.log(`Updated subscription for user ${subscription.metadata.userId}`)
          } catch (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as any
        console.log('Subscription deleted:', deletedSubscription.id)

        if (deletedSubscription.metadata?.userId) {
          try {
            await adminDb.collection('users').doc(deletedSubscription.metadata.userId).update({
              subscription: {
                status: 'canceled',
                planKey: 'FREE',
                canceledAt: new Date(),
                updatedAt: new Date(),
              }
            })
          } catch (error) {
            console.error('Error canceling subscription:', error)
          }
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any
        console.log('Payment succeeded for invoice:', invoice.id)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any
        console.log('Payment failed for invoice:', failedInvoice.id)
        break

      default:
        console.log('Unhandled event type:', event.type)
        break

      case 'account.updated':
        const account = event.data.object as any
        console.log('Account updated:', account.id)

        // Find user by stripeAccountId
        try {
          if (!adminDb) {
            console.error('Admin DB not initialized');
            break;
          }
          const usersRef = adminDb.collection('users')
          const snapshot = await usersRef.where('stripeAccountId', '==', account.id).limit(1).get()

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0]
            await userDoc.ref.update({
              stripeAccountStatus: {
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                requirements: account.requirements,
                updatedAt: new Date()
              }
            })
            console.log(`Updated Stripe status for user ${userDoc.id}`)
          } else {
            console.log(`No user found for Stripe Account ID: ${account.id}`)
          }
        } catch (error) {
          console.error('Error handling account.updated:', error)
        }
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}