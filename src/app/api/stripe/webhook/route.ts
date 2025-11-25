import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

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

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any
        console.log('Checkout session completed:', session.id)

        if (session.metadata?.userId) {
          try {
            const userRef = doc(db, 'users', session.metadata.userId)
            await updateDoc(userRef, {
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

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as any
        console.log('Subscription updated:', updatedSubscription.id)

        if (updatedSubscription.metadata?.userId) {
          try {
            const userRef = doc(db, 'users', updatedSubscription.metadata.userId)
            await updateDoc(userRef, {
              'subscription.status': updatedSubscription.status,
              'subscription.currentPeriodStart': new Date(updatedSubscription.current_period_start * 1000),
              'subscription.currentPeriodEnd': new Date(updatedSubscription.current_period_end * 1000),
              'subscription.updatedAt': new Date(),
            })
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
            const userRef = doc(db, 'users', deletedSubscription.metadata.userId)
            await updateDoc(userRef, {
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