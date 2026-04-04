---
title: "How to Scan a Supabase + Vercel Health App in CI"
date: "2026-04-21"
description: "Step-by-step guide to adding HIPAA scanning to a Supabase + Vercel + Next.js health app."
tags: ["supabase", "vercel", "hipaa", "ci"]
---

Supabase + Vercel + Next.js is the most popular stack for healthcare startups building fast. It's also the stack where we see the most HIPAA violations — not because the tools are insecure, but because developers skip the compliance layer.

Here's how to add vlayer scanning to this exact stack in 10 minutes.

## The common violations in this stack

Before we set up CI, here's what vlayer typically finds in a Supabase + Vercel app:

```bash
npx vlayer scan ./src
```

```
CRITICAL  CRED-003  NEXT_PUBLIC_SERVICE_ROLE_KEY exposed to client
  File: lib/supabase.ts:3

CRITICAL  phi-localstorage  PHI stored in localStorage
  File: components/PatientList.tsx:12

HIGH  encryption-weak-http  Unencrypted HTTP URL
  File: lib/api.ts:5

MEDIUM  audit-unlogged-delete  PHI delete without audit logging
  File: app/api/patients/route.ts:28

Compliance Score: 42/100 (F)
```

Let's fix the pipeline first, then the code.

## Step 1: Add vlayer to your Vercel build

Create `.github/workflows/hipaa-scan.yml`:

```yaml
name: HIPAA Compliance Scan

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  hipaa-scan:
    name: vlayer HIPAA Scanner
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run HIPAA scan
        run: npx verification-layer scan ./src -f json -o vlayer-report.json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: vlayer-hipaa-report
          path: vlayer-report.json
```

## Step 2: Fix the Supabase client pattern

The #1 violation in Supabase apps: using the service role key in client-side code.

```typescript
// WRONG: service role key in NEXT_PUBLIC_ variable
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
```

vlayer catches this:

```
CRITICAL  CRED-003
  Sensitive value exposed via NEXT_PUBLIC_ environment variable
  Pattern: NEXT_PUBLIC_.*SERVICE_ROLE
  File: lib/supabase.ts:3
```

**Fix:** Two clients — anon for the browser, service role for the server:

```typescript
// lib/supabase-browser.ts (client components)
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabase-server.ts (server components, API routes)
import { createServerClient } from '@supabase/ssr';

export function createServer(cookieStore) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // no NEXT_PUBLIC_ prefix
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}
```

## Step 3: Enable RLS and stop using SELECT *

Supabase Row Level Security is your access control layer. Without it, any authenticated user can read any row.

```typescript
// WRONG: no RLS, SELECT * returns all fields
const { data } = await supabase.from('patients').select('*');
```

vlayer output:

```
MEDIUM  select-star
  SELECT * on sensitive table retrieves more data than necessary
  File: app/api/patients/route.ts:5
```

**Fix:** Select only the fields you need:

```typescript
const { data } = await supabase
  .from('patients')
  .select('id, name, appointment_date');
```

And enable RLS in your Supabase migration:

```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patients"
  ON patients FOR SELECT
  USING (auth.uid() = provider_id);
```

## Step 4: Add audit logging

Supabase doesn't log PHI access by default. You need an audit table.

```sql
CREATE TABLE audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  created_at timestamptz DEFAULT now()
);
```

```typescript
async function auditLog(userId: string, action: string, resource: string, resourceId: string) {
  await supabase.from('audit_log').insert({ user_id: userId, action, resource, resource_id: resourceId });
}
```

## Step 5: Verify the fix

Run the scan again:

```bash
npx vlayer scan ./src
```

```
Compliance Score: 94/100 (A)
0 critical, 0 high, 2 medium findings
```

The CI pipeline will pass. Every future PR gets scanned automatically. Ship it.

```bash
npx vlayer scan ./src
```
