import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

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

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;

      if (userId) {
        await supabaseAdmin.from('profiles').update({
          plan: 'pro',
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        const isActive = ['active', 'trialing'].includes(subscription.status);
        await supabaseAdmin.from('profiles').update({
          plan: isActive ? 'pro' : 'free',
          subscription_status: subscription.status,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        await supabaseAdmin.from('profiles').update({
          plan: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('id', profile.id);
        // TODO: Send email notification about failed payment
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
