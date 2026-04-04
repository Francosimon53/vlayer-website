---
title: "7 HIPAA Issues We Keep Finding in Next.js Health Apps"
date: "2026-04-07"
description: "The 7 most common HIPAA violations in Next.js health apps, with code examples and fixes."
tags: ["hipaa", "nextjs", "healthcare", "security"]
---

We scan hundreds of healthcare codebases every month. Next.js is the most popular framework in our user base, and the same 7 violations show up again and again.

Here they are, with real code, real vlayer output, and real fixes.

## 1. PHI in console.log

The most common violation. Developers log patient data during debugging and forget to remove it.

```typescript
// app/api/patients/route.ts
export async function GET(req: Request) {
  const patient = await db.patients.findUnique({ where: { id } });
  console.log(`Fetched patient: ${patient.name}, SSN: ${patient.ssn}`);
  return Response.json(patient);
}
```

vlayer output:

```
CRITICAL  phi-console-log
  PHI detected in console.log statement
  File: app/api/patients/route.ts:4
  HIPAA: §164.312(a)(1) — Access Control
```

**Fix:** Remove the log, or use a structured logger with PHI redaction:

```typescript
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  const patient = await db.patients.findUnique({ where: { id } });
  logger.info('Patient fetched', { patientId: patient.id });
  return Response.json(patient);
}
```

## 2. PHI in localStorage

Client components caching patient data in the browser. localStorage has no encryption, no expiry, and persists across sessions.

```typescript
// components/PatientSearch.tsx
'use client';

useEffect(() => {
  const data = await fetch('/api/patients');
  const patients = await data.json();
  localStorage.setItem('patient-medical-records', JSON.stringify(patients));
}, []);
```

vlayer output:

```
CRITICAL  phi-localstorage
  PHI stored in localStorage without encryption
  File: components/PatientSearch.tsx:6
  HIPAA: §164.312(a)(2)(iv) — Encryption
```

**Fix:** Use server-side session storage or encrypted in-memory state. Never persist PHI client-side.

```typescript
const [patients, setPatients] = useState([]);

useEffect(() => {
  fetch('/api/patients').then(r => r.json()).then(setPatients);
}, []);
```

## 3. NEXT_PUBLIC_ secrets

Next.js inlines `NEXT_PUBLIC_*` variables into the client bundle. Developers put sensitive keys there without realizing they're public.

```typescript
// lib/supabase.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY! // exposed to every browser
);
```

vlayer output:

```
CRITICAL  CRED-003
  Sensitive value exposed via NEXT_PUBLIC_ environment variable
  File: lib/supabase.ts:3
  HIPAA: §164.312(a)(2)(i) — Access Control
```

**Fix:** Use the anon key client-side. Service role key goes in server-only code:

```typescript
// lib/supabase-client.ts (client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabase-server.ts (server only)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## 4. No auth on API routes

Next.js API routes are public by default. No middleware, no token check, nothing.

```typescript
// app/api/patients/route.ts
export async function GET() {
  const patients = await db.patients.findMany();
  return Response.json(patients); // anyone can call this
}
```

vlayer output:

```
HIGH  no-auth-middleware
  PHI endpoint has no authentication check
  File: app/api/patients/route.ts:2
  HIPAA: §164.312(d) — Person or Entity Authentication
```

**Fix:** Check auth in every route handler that touches PHI:

```typescript
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const patients = await db.patients.findMany();
  return Response.json(patients);
}
```

## 5. MD5 password hashing

`crypto.createHash('md5')` in a signup or login route. MD5 is broken. HIPAA requires strong cryptographic controls.

```typescript
import crypto from 'crypto';

const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
```

vlayer output:

```
HIGH  encryption-weak-md5
  MD5 hash function is not suitable for protecting PHI
  File: app/api/auth/signup/route.ts:5
  HIPAA: §164.312(a)(2)(iv) — Encryption and Decryption
```

**Fix:** Use bcrypt or argon2:

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12);
```

## 6. PHI in URL query parameters

Passing SSN, MRN, or DOB as query params. These get logged in browser history, server access logs, and CDN caches.

```typescript
// Client component
const res = await fetch(`/api/patients?ssn=${patient.ssn}&dob=${patient.dob}`);
```

vlayer output:

```
CRITICAL  phi-query-param
  PHI in URL query parameter
  File: components/PatientLookup.tsx:8
  HIPAA: §164.312(e)(2)(ii) — Transmission Security
```

**Fix:** Use POST with a request body, or lookup by non-PHI identifier:

```typescript
const res = await fetch('/api/patients', {
  method: 'POST',
  body: JSON.stringify({ patientId: patient.id }),
});
```

## 7. Unlogged PHI deletion

DELETE endpoints with no audit trail. HIPAA requires logging of who accessed, modified, or deleted PHI and when.

```typescript
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await db.patients.delete({ where: { id } });
  return Response.json({ deleted: true });
}
```

vlayer output:

```
MEDIUM  audit-unlogged-delete
  PHI delete operation may lack audit logging
  File: app/api/patients/route.ts:3
  HIPAA: §164.312(b) — Audit Controls
```

**Fix:** Log every PHI operation with who, what, and when:

```typescript
export async function DELETE(req: Request) {
  const session = await auth();
  const { id } = await req.json();

  await db.patients.delete({ where: { id } });
  await auditLog.create({
    action: 'DELETE',
    resource: 'patient',
    resourceId: id,
    userId: session.user.id,
    timestamp: new Date(),
  });

  return Response.json({ deleted: true });
}
```

## Scan your project now

Every one of these issues takes under 5 minutes to fix. Finding them is the hard part — and that's what vlayer does.

```bash
npx vlayer scan ./src
```

140+ rules. 5 HIPAA categories. Zero configuration.
