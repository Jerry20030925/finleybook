# Stripe Configuration Guide

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:4000  # Change to your production URL
```

## Setup Steps

### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up for an account
3. Get your API keys from Dashboard → Developers → API keys

### 2. Create Products & Prices

#### Monthly Plan
1. Go to Products → Add Product
2. Name: "FinleyBook Pro - Monthly"
3. Price: $9.99/month
4. Recurring: Monthly
5. Copy the Price ID (starts with `price_...`)

#### Yearly Plan
1. Go to Products → Add Product
2. Name: "FinleyBook Pro - Yearly"
3. Price: $79.99/year
4. Recurring: Yearly
5. Copy the Price ID (starts with `price_...`)

### 3. Update Price IDs in Code

Edit `src/components/SubscriptionPage.tsx`:

```typescript
const priceIds = {
  monthly: 'price_YOUR_MONTHLY_PRICE_ID',
  yearly: 'price_YOUR_YEARLY_PRICE_ID'
}
```

### 4. Set up Webhook

1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the Webhook Secret (starts with `whsec_...`)

### 5. Test Mode

For development, use Stripe's test mode:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

## Deployment Checklist

- [ ] Add environment variables to Vercel
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Switch to live Stripe keys (not test keys)
- [ ] Update webhook endpoint to production URL
- [ ] Test subscription flow end-to-end
