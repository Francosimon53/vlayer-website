---
title: "HIPAA Security Rule 2026: What Engineers Must Automate Now"
date: "2026-04-16"
description: "What the HIPAA Security Rule changes mean for your CI/CD pipeline."
tags: ["hipaa", "compliance", "regulation", "engineering"]
---

The HIPAA Security Rule NPRM (2026) adds 15 new cybersecurity requirements. Most compliance articles explain them in legal language. This one explains them in code.

vlayer already covers all 15. Here's what each one means for your CI/CD pipeline.

## The 9 requirements you can automate today

### 1. Multi-Factor Authentication (HIPAA-MFA-001)

**Rule:** All access to ePHI must enforce MFA. No exceptions.

**What vlayer checks:** Login and auth endpoints that don't verify an MFA token or claim.

```typescript
// Fails: login without MFA verification
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await authenticate(email, password);
  const token = jwt.sign({ userId: user.id }, SECRET);
  return Response.json({ token });
}
```

```
CRITICAL  HIPAA-MFA-001
  Authentication endpoint does not enforce multi-factor authentication
  File: app/api/auth/login/route.ts:2
  HIPAA: 45 CFR §164.312(a)(2)(i)
```

### 2. Encryption at Rest (HIPAA-ENC-REST-001)

**Rule:** All ePHI must be encrypted with AES-256 or stronger at rest.

**What vlayer checks:** Database connections without encryption, PHI in localStorage/cookies, unencrypted backups.

```typescript
// Fails: database without encryption config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // ePHI stored without encryption at rest
});
```

```
CRITICAL  HIPAA-ENC-REST-001
  Database connection has SSL disabled — ePHI may be unencrypted at rest
  HIPAA: 45 CFR §164.312(a)(2)(iv)
```

### 3. Session Timeout (HIPAA-SESSION-001)

**Rule:** Sessions must auto-expire within 15 minutes of inactivity.

```typescript
// Fails: session maxAge set to 24 hours
const session = {
  maxAge: 86400000, // 24h — exceeds HIPAA 15-min requirement
  secure: true,
};
```

```
HIGH  HIPAA-SESSION-001
  Session timeout exceeds HIPAA 15-minute idle requirement
  HIPAA: 45 CFR §164.312(a)(2)(iii)
```

### 4. Immediate Access Revocation (HIPAA-REVOKE-001)

**Rule:** When a user is deactivated, all their active sessions and tokens must be invalidated immediately.

**What vlayer checks:** User deactivation/deletion code that doesn't include token revocation logic.

### 5. Breach Notification (HIPAA-BREACH-001)

**Rule:** Automated breach detection with 24-hour notification capability.

**What vlayer checks:** Security error handlers without breach notification integration.

### 6. Network Segmentation (HIPAA-SEGMENT-001)

**Rule:** PHI services must be network-segmented from non-PHI services.

**What vlayer checks:** CORS `origin: *` on PHI endpoints, missing VPC/subnet configuration.

### 7. Technology Asset Inventory (HIPAA-ASSET-001)

**Rule:** Maintain an inventory of all systems that process or store ePHI.

**What vlayer checks:** Scans for database connections, storage services, and third-party integrations to auto-generate an asset inventory.

### 8. ePHI Flow Mapping (HIPAA-FLOW-001)

**Rule:** Document how ePHI flows through your system — input, processing, storage, output.

**What vlayer checks:** Traces PHI data paths through your codebase and generates a flow map.

### 9. Vulnerability Scanning (HIPAA-PENTEST-001)

**Rule:** Automated vulnerability scanning must be integrated into CI/CD.

**What vlayer checks:** Presence of scanning tools (Dependabot, Snyk, Trivy) in your CI configuration.

```
HIGH  HIPAA-PENTEST-001
  No automated vulnerability scanning detected in CI/CD configuration
  HIPAA: 45 CFR §164.308(a)(8)
```

## How to check all 15 in one command

```bash
npx vlayer scan ./src
```

vlayer checks all 9 automatable HIPAA 2026 requirements on every scan. The remaining 6 (physical safeguards, workforce training, BAA management, contingency planning, security officer designation, risk analysis) are organizational — vlayer provides templates for those.

```bash
npx vlayer templates list
```

The enforcement date is coming. Automate what you can now and document the rest.
