---
title: "PHI in Logs: 5 Patterns Your Code Review Misses"
date: "2026-04-14"
description: "5 ways PHI leaks into production logs without anyone noticing during code review."
tags: ["security", "logging", "hipaa", "healthcare"]
---

Production logs are the most common place PHI leaks in healthcare apps. Developers add logging during development. Reviewers approve it. The PHI sits in CloudWatch or Datadog for months before anyone notices.

Here are 5 patterns vlayer detects that human reviewers consistently miss.

## 1. Direct console.log with patient data

The classic. A developer logs a patient object during debugging and forgets to remove it.

```typescript
async function getPatient(id: string) {
  const patient = await db.patients.findUnique({ where: { id } });
  console.log('Patient data:', patient.name, 'SSN:', patient.ssn);
  return patient;
}
```

vlayer output:

```
CRITICAL  phi-console-log
  PHI detected in console.log statement (ssn, patient)
  File: lib/patients.ts:3
  HIPAA: §164.312(a)(1)
```

**Fix:** Delete the log. If you need observability, log the patient ID only:

```typescript
logger.info('Patient fetched', { patientId: id });
```

## 2. JSON.stringify on patient objects

This one is sneaky. The developer doesn't log individual fields — they stringify the whole object. Reviewers see `JSON.stringify` and think "serialization," not "PHI leak."

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  console.log('Incoming request:', JSON.stringify(body));
  // body contains { name, ssn, dob, diagnosis }
  await createPatient(body);
}
```

vlayer output:

```
CRITICAL  phi-json-stringify-log
  PHI object serialized to console.log
  File: app/api/patients/route.ts:3
```

**Fix:** Log only non-PHI metadata:

```typescript
logger.info('Patient create request', {
  requestId: crypto.randomUUID(),
  fieldCount: Object.keys(body).length,
});
```

## 3. Template literal logs

Harder to spot in review because the PHI is interpolated, not passed as an argument.

```typescript
console.log(`Processing appointment for patient ${patient.name}, diagnosis: ${patient.diagnosis}`);
```

vlayer output:

```
CRITICAL  phi-template-log
  PHI detected in template literal log (patient, diagnosis)
  File: lib/appointments.ts:15
```

**Fix:** Same pattern — log IDs, not PHI:

```typescript
logger.info('Processing appointment', { appointmentId, patientId: patient.id });
```

## 4. Error handlers that leak PHI

Catch blocks often log the full error context, which includes the request body or database row that caused the error.

```typescript
try {
  await updatePatient(patientId, data);
} catch (err) {
  console.error('Failed to update patient:', err.message, data);
  // data = { ssn: '123-45-6789', diagnosis: 'J45.20', ... }
}
```

vlayer output:

```
CRITICAL  phi-console-log
  PHI detected in console.error statement
  File: lib/patients.ts:5

CRITICAL  ssn-hardcoded
  Potential SSN detected in error context
  File: lib/patients.ts:5
```

**Fix:** Log the error without the data payload:

```typescript
try {
  await updatePatient(patientId, data);
} catch (err) {
  logger.error('Patient update failed', {
    patientId,
    errorMessage: err.message,
  });
  throw err;
}
```

## 5. Logger without redaction

Even when teams switch to a proper logger, they often log full objects without a redaction layer.

```typescript
import { logger } from './logger';

logger.info('Patient record accessed', patient);
// Logs: { name: 'Jane Doe', ssn: '123-45-6789', dob: '1985-03-15', ... }
```

vlayer output:

```
HIGH  phi-logger-unredacted
  Logger called with patient object without redaction
  File: routes/patients.ts:3
  HIPAA: §164.312(b) — Audit Controls
```

**Fix:** Create a redaction middleware in your logger:

```typescript
const redactedFields = ['ssn', 'dob', 'diagnosis', 'medications'];

function redact(obj: Record<string, any>) {
  const clean = { ...obj };
  for (const field of redactedFields) {
    if (field in clean) clean[field] = '[REDACTED]';
  }
  return clean;
}

logger.info('Patient record accessed', redact(patient));
// Logs: { name: 'Jane Doe', ssn: '[REDACTED]', dob: '[REDACTED]', ... }
```

## The pattern

All 5 share the same root cause: logging code gets less scrutiny in code review than business logic. Reviewers check "does the feature work?" not "does the log contain PHI?"

vlayer checks every line, every time, in under 10 seconds:

```bash
npx vlayer scan ./src
```

140+ rules. Zero PHI in your logs.
