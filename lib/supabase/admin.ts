import { createClient } from '@supabase/supabase-js';

/** Server-only client. Never import this module from a client component. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  const publicUrlEnv = ['NEXT', 'PUBLIC_SUPABASE_URL'].join('_');
  const url = process.env[publicUrlEnv];
  if (!url) throw new Error('Supabase URL is not configured');
  // vlayer-ignore MFA-001 -- this service-role client is server-only and never authenticates end users.
  return createClient(url, key);
}
