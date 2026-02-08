import { createClient } from '@/lib/supabase/server';

export async function requirePro(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at, current_period_end')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  if (profile.plan === 'pro' || profile.plan === 'enterprise') {
    // Check if subscription is still active
    if (['active', 'trialing'].includes(profile.subscription_status)) return true;
    // Check if trial hasn't expired
    if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return true;
    // Check if current period hasn't ended
    if (profile.current_period_end && new Date(profile.current_period_end) > new Date()) return true;
  }

  return false;
}

export async function getUserPlan(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at, current_period_end')
    .eq('id', userId)
    .single();

  return profile;
}
