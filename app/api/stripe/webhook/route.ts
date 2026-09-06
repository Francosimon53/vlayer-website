import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { auditLogger, errorMetadata } from '@/lib/audit-logger';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    auditLogger.warn(
      { event: 'billing.webhook.signature_failed', ...errorMetadata(err) },
      'Stripe webhook signature verification failed',
    );
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;

      if (userId) {
        const { error } = await supabaseAdmin.from('profiles').update({
          plan: 'pro',
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', userId);

        if (error) {
          auditLogger.error(
            { event: 'billing.profile_update.failed', action: event.type, userId, stripeEventId: event.id, ...errorMetadata(error) },
            'Billing profile update failed',
          );
          return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
        }

        auditLogger.info(
          { event: 'billing.profile_update.succeeded', action: event.type, userId, stripeEventId: event.id },
          'Billing profile updated',
        );
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        const isActive = ['active', 'trialing'].includes(subscription.status);
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
        const { error } = await supabaseAdmin.from('profiles').update({
          plan: isActive ? 'pro' : 'free',
          subscription_status: subscription.status,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
        }).eq('id', userId);

        if (error) {
          auditLogger.error(
            { event: 'billing.profile_update.failed', action: event.type, userId, stripeEventId: event.id, ...errorMetadata(error) },
            'Billing profile update failed',
          );
          return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
        }

        auditLogger.info(
          { event: 'billing.profile_update.succeeded', action: event.type, userId, stripeEventId: event.id },
          'Billing profile updated',
        );
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        const { error } = await supabaseAdmin.from('profiles').update({
          plan: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', userId);

        if (error) {
          auditLogger.error(
            { event: 'billing.profile_update.failed', action: event.type, userId, stripeEventId: event.id, ...errorMetadata(error) },
            'Billing profile update failed',
          );
          return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
        }

        auditLogger.info(
          { event: 'billing.profile_update.succeeded', action: event.type, userId, stripeEventId: event.id },
          'Billing profile updated',
        );
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const { data: profile, error: lookupError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (lookupError) {
        auditLogger.error(
          { event: 'billing.profile_lookup.failed', action: event.type, stripeEventId: event.id, ...errorMetadata(lookupError) },
          'Billing profile lookup failed',
        );
        return NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 });
      }

      if (profile) {
        const { error } = await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('id', profile.id);

        if (error) {
          auditLogger.error(
            { event: 'billing.profile_update.failed', action: event.type, userId: profile.id, stripeEventId: event.id, ...errorMetadata(error) },
            'Billing profile update failed',
          );
          return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
        }

        auditLogger.info(
          { event: 'billing.profile_update.succeeded', action: event.type, userId: profile.id, stripeEventId: event.id },
          'Billing profile updated',
        );
        // TODO: Send email notification about failed payment
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
