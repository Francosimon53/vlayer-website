-- Migration: Add Stripe subscription columns to profiles table
-- Description: Adds necessary columns for Stripe payment integration
-- Date: 2026-02-07
-- Author: vlayer team

-- Add Stripe-related columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Add comment to plan column for documentation
COMMENT ON COLUMN profiles.plan IS 'User subscription plan: free (default), pro ($49/mo), or enterprise (custom)';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID (cus_xxx)';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID (sub_xxx)';
COMMENT ON COLUMN profiles.subscription_status IS 'Stripe subscription status: none, active, trialing, past_due, cancelled, etc.';
COMMENT ON COLUMN profiles.trial_ends_at IS 'End date of 14-day free trial';
COMMENT ON COLUMN profiles.current_period_end IS 'End date of current billing period';

-- RLS Policies: Users can read their own plan information
CREATE POLICY IF NOT EXISTS "Users can view own plan"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view own stripe info"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Grant necessary permissions
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (plan, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, trial_ends_at)
  ON profiles TO service_role;

-- Create view for subscription analytics (optional)
CREATE OR REPLACE VIEW subscription_stats AS
SELECT
  plan,
  subscription_status,
  COUNT(*) as user_count,
  COUNT(CASE WHEN trial_ends_at > NOW() THEN 1 END) as active_trials,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN subscription_status = 'past_due' THEN 1 END) as past_due_subscriptions
FROM profiles
GROUP BY plan, subscription_status;

COMMENT ON VIEW subscription_stats IS 'Analytics view for subscription metrics';

-- Grant select on view
GRANT SELECT ON subscription_stats TO authenticated;

-- Insert default free plan for existing users (if any)
UPDATE profiles
SET plan = 'free'
WHERE plan IS NULL;

-- Verification query (run after migration to check)
-- SELECT plan, COUNT(*) as count FROM profiles GROUP BY plan;
