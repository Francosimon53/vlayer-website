# Stripe Integration Setup Guide

This document provides step-by-step instructions for setting up Stripe payments in vlayer.

## Prerequisites

- Stripe account (https://stripe.com)
- Supabase project with profiles table
- Vercel project for deployment

## Step 1: Database Migration

Run this SQL in Supabase SQL Editor to add Stripe columns to the profiles table:

```sql
-- Add Stripe columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- RLS policy: users can read their own plan info
CREATE POLICY IF NOT EXISTS "Users can view own plan" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## Step 2: Create Stripe Products

### In Stripe Dashboard (Test Mode):

1. Go to **Products** → **Add Product**

2. **Create Pro Monthly Product:**
   - Name: "vlayer Pro (Monthly)"
   - Description: "HIPAA compliance scanner with dashboard, templates, and team features"
   - Pricing:
     - Model: Recurring
     - Price: $49 USD
     - Billing period: Monthly
   - **Copy the Price ID** (starts with `price_`) → This is your `STRIPE_PRO_MONTHLY_PRICE_ID`

3. **Create Pro Annual Product:**
   - Name: "vlayer Pro (Annual)"
   - Description: "vlayer Pro billed annually (save 2 months)"
   - Pricing:
     - Model: Recurring
     - Price: $490 USD
     - Billing period: Yearly
   - **Copy the Price ID** → This is your `STRIPE_PRO_ANNUAL_PRICE_ID`

## Step 3: Get Stripe API Keys

1. Go to **Developers** → **API keys**
2. Copy your:
   - **Publishable key** (starts with `pk_test_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`

## Step 4: Configure Environment Variables

Add these to your `.env.local` (development) and Vercel (production):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx

# Stripe Webhook Secret (get this after setting up webhook in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Change to https://app.vlayer.app in production

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxx # Service role for webhook
```

## Step 5: Setup Stripe Webhook (After Deployment)

### For Development (using Stripe CLI):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhook events to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (whsec_...) to your .env.local
```

### For Production:

1. Deploy your app to Vercel first
2. Go to Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
3. Endpoint URL: `https://app.vlayer.app/api/stripe/webhook`
4. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. **Copy the Signing Secret** (starts with `whsec_`) → Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## Step 6: Test the Integration

### Test in Development:

1. Start your dev server: `npm run dev`
2. Start Stripe webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Visit `/pricing` and click "Start 14-Day Free Trial"
4. Use Stripe test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. Complete checkout → Should redirect to `/dashboard?upgrade=success`
6. Check Supabase profiles table → User should have `plan: 'pro'`

### Test Cards:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Authentication required:** 4000 0025 0000 3155

## Step 7: Enable Customer Portal

1. Go to Stripe Dashboard → **Settings** → **Customer portal**
2. Enable portal
3. Configure:
   - Allow customers to cancel subscriptions: ✓
   - Allow customers to update payment methods: ✓
   - Allow customers to switch plans: ✓ (optional)
4. Save changes

## Usage

### For Users to Upgrade:

1. User clicks "Upgrade to Pro" on dashboard or pricing page
2. Redirects to Stripe Checkout (hosted by Stripe)
3. 14-day trial starts (no credit card charge)
4. After trial ends, Stripe charges $49/month (or $490/year)
5. Webhook updates user's plan in Supabase

### For Users to Manage Subscription:

1. User clicks "Manage Subscription" in dashboard
2. Redirects to Stripe Customer Portal (hosted by Stripe)
3. User can:
   - Cancel subscription
   - Update payment method
   - View invoices
   - Download receipts

## Plan Access Control

Use the `requirePro()` helper to protect Pro-only routes:

```typescript
import { requirePro } from '@/lib/plan-guard';

export default async function ProFeaturePage() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !(await requirePro(user.id))) {
    redirect('/pricing');
  }

  // Render Pro feature...
}
```

## Troubleshooting

### Webhook not receiving events:

- Check webhook endpoint URL is correct
- Verify webhook secret is correct in env vars
- Check Stripe Dashboard → Webhooks → Recent deliveries for errors
- Make sure your API route is not behind auth middleware

### User plan not updating:

- Check webhook logs in Stripe Dashboard
- Check Supabase logs for errors
- Verify `metadata.supabase_user_id` is being passed in checkout session

### Trial not starting:

- Verify `trial_period_days: 14` is set in checkout session
- Check if trial was already used (Stripe allows 1 trial per customer)

## Production Checklist

Before going live:

- [ ] Switch to Stripe Live Mode keys
- [ ] Create live products (Pro Monthly & Annual)
- [ ] Update environment variables in Vercel
- [ ] Setup production webhook endpoint
- [ ] Test full payment flow with real card
- [ ] Enable Customer Portal in live mode
- [ ] Setup email notifications (Stripe can send receipts)
- [ ] Add Business Associate Agreement (BAA) if handling PHI

## Support

For questions about this integration:
- Email: dev@vlayer.app
- GitHub: https://github.com/Francosimon53/verification-layer/issues
