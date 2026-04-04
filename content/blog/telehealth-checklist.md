---
title: "Building Compliant Telehealth in 2026: An Engineer's Checklist"
date: "2026-04-30"
description: "Complete HIPAA compliance checklist for telehealth apps, written for engineers."
tags: ["telehealth", "hipaa", "healthcare", "checklist"]
---

Telehealth apps handle the most sensitive PHI: video consultations, prescriptions, diagnosis codes, and insurance data flowing through a single application. HIPAA violations here carry the highest risk.

This is the engineering checklist. Not legal language. Code patterns, configuration checks, and automated scans you can run today.

## Authentication and Access Control

### MFA on all user types

Patients, providers, and admins must all use MFA. The HIPAA 2026 NPRM makes this mandatory — no exceptions.

```typescript
// vlayer checks for this:
// HIPAA-MFA-001: Authentication endpoint does not enforce MFA
```

**What to implement:**
- TOTP or SMS verification on login
- MFA claim in JWT tokens
- Re-authentication for sensitive actions (prescriptions, record exports)

### Session timeout at 15 minutes

HIPAA recommends 15-minute idle timeout. Most frameworks default to 24 hours.

```typescript
// Fails vlayer scan:
const session = { maxAge: 86400000 }; // 24 hours

// Passes:
const session = { maxAge: 900000 }; // 15 minutes
```

### Role-based access control

Providers see their patients. Nurses see assigned patients. Billing sees insurance data only. No one gets `SELECT *`.

```typescript
// Fails:
const patients = await db.query('SELECT * FROM patients');

// Passes:
const patients = await db.query(
  'SELECT id, name, appointment_date FROM patients WHERE provider_id = $1',
  [session.providerId]
);
```

## Data in Transit

### HTTPS everywhere

No HTTP endpoints. Not even internal ones.

```typescript
// vlayer flags this:
const apiUrl = 'http://internal-api.healthapp.com/patients';

// Fix:
const apiUrl = 'https://internal-api.healthapp.com/patients';
```

### WebSocket encryption for video

Telehealth video must use WSS (WebSocket Secure), never WS.

### SSL on database connections

```typescript
// Fails:
const pool = new Pool({ ssl: false });

// Passes:
const pool = new Pool({ ssl: { rejectUnauthorized: true } });
```

## Data at Rest

### Encrypt all PHI storage

Database encryption, encrypted backups, no PHI in localStorage or cookies.

```typescript
// vlayer catches:
localStorage.setItem('patient-diagnosis', diagnosis);
document.cookie = `patient_ssn=${ssn}`;
```

### Backup encryption

```typescript
// Fails:
const backupConfig = { encrypt: false };

// Passes:
const backupConfig = { encrypt: true, algorithm: 'aes-256-gcm' };
```

## PHI Handling

### No PHI in logs

The #1 violation in telehealth apps. Video session logs, API request logs, and error handlers all leak PHI.

```typescript
// Fails:
console.log(`Video session started for patient ${patient.name}, SSN: ${patient.ssn}`);

// Passes:
logger.info('Video session started', { sessionId, patientId: patient.id });
```

### No PHI in URLs

```typescript
// Fails:
router.get('/patients/:ssn/records');
fetch(`/api/appointments?patient_ssn=${ssn}`);

// Passes:
router.get('/patients/:id/records');
fetch(`/api/appointments?patient_id=${id}`);
```

### No PHI in error responses

```typescript
// Fails:
res.status(404).json({ error: `Patient ${name} (SSN: ${ssn}) not found` });

// Passes:
res.status(404).json({ error: 'Patient not found' });
```

## Audit Logging

### Log every PHI access

Every read, write, update, and delete on PHI needs a log entry with who, what, when.

```typescript
await auditLog.create({
  userId: session.user.id,
  action: 'VIEW_PATIENT_RECORD',
  resourceType: 'patient',
  resourceId: patient.id,
  ipAddress: req.ip,
  timestamp: new Date(),
});
```

### Log authentication events

Login, logout, MFA verification, password reset, failed attempts.

### Immutable logs

Audit logs must not be editable or deletable. Use append-only storage.

## Data Retention

### 6-year minimum retention

HIPAA requires retaining PHI records for at least 6 years. Your `deleteAfter` config must reflect this.

```typescript
// Fails vlayer:
const retentionPolicy = { deleteAfter: 365 }; // 1 year

// Passes:
const retentionPolicy = { deleteAfter: 2190 }; // 6 years
```

### Soft-delete, never hard-delete

```typescript
// Fails:
await db.patients.delete({ where: { id } });

// Passes:
await db.patients.update({ where: { id }, data: { deletedAt: new Date() } });
```

## Automated Verification

Run this after every change:

```bash
# Full scan
npx vlayer scan ./src

# Compliance score
npx vlayer score ./src

# HTML report for compliance team
npx vlayer scan ./src -f html -o hipaa-report.html
```

Add to CI so every PR gets checked:

```yaml
- name: HIPAA scan
  run: npx verification-layer scan ./src
```

## The checklist summary

| Area | Key Requirement | vlayer Rule |
|------|----------------|-------------|
| Auth | MFA on all users | HIPAA-MFA-001 |
| Auth | 15-min session timeout | HIPAA-SESSION-001 |
| Auth | RBAC on all endpoints | ACL-001, ACL-002 |
| Transit | HTTPS only | ENC-002 |
| Transit | SSL on DB connections | ENC-001 |
| Rest | No PHI in localStorage | PHI-localstorage |
| Rest | Encrypted backups | ENC-backup |
| PHI | No PHI in logs | PHI-002 |
| PHI | No PHI in URLs | PHI-005 |
| PHI | No PHI in errors | PHI-003 |
| Audit | Log all PHI access | AUD-001 |
| Retention | 6-year minimum | RET-001 |
| Retention | Soft-delete only | RET-bulk-delete |

Every item on this list is something vlayer checks automatically. Stop relying on memory. Automate it.

```bash
npx vlayer scan ./src
```
