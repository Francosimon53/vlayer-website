---
title: "Open-Source HIPAA Scanning: vlayer vs. Manual Checklists"
date: "2026-04-28"
description: "Why automated scanning catches what quarterly compliance reviews miss."
tags: ["opensource", "hipaa", "security", "healthcare"]
---

Most healthcare startups handle HIPAA compliance with a spreadsheet. A quarterly review. A checklist someone fills out from memory.

It doesn't work. Here's why, and what to do instead.

## How manual checklists fail

A typical HIPAA compliance checklist asks:

- "Is all PHI encrypted at rest?" **Yes** (checked the box)
- "Are access controls in place?" **Yes** (we have auth)
- "Is PHI logged for audit purposes?" **Yes** (we use CloudWatch)

All three answers are technically true and practically useless. Because last week, a developer pushed this:

```typescript
console.log(`Patient ${patient.name} diagnosed with ${patient.diagnosis}`);
```

And this:

```typescript
localStorage.setItem('patient-ssn', patient.ssn);
```

And this:

```typescript
const hash = crypto.createHash('md5').update(patient.ssn).digest('hex');
```

The checklist says "compliant." The code says otherwise. No one notices until an auditor does — or worse, until there's a breach.

## What automated scanning catches

vlayer scans your actual codebase. Not a questionnaire. Not someone's memory of what the code does. The code itself.

```bash
npx vlayer scan ./src
```

```
CRITICAL  phi-console-log
  PHI detected in console.log statement
  File: lib/patients.ts:14

CRITICAL  phi-localstorage
  PHI stored in localStorage without encryption
  File: components/Dashboard.tsx:8

HIGH  encryption-weak-md5
  MD5 hash function is not suitable for protecting PHI
  File: lib/auth.ts:22

MEDIUM  audit-unlogged-delete
  PHI delete operation may lack audit logging
  File: app/api/patients/route.ts:31

Compliance Score: 38/100 (F)
```

## Side-by-side comparison

| | Manual Checklist | vlayer |
|---|---|---|
| **Frequency** | Quarterly | Every PR |
| **Coverage** | Whatever someone remembers | 140+ rules, every file |
| **False confidence** | High — "we checked the box" | Low — shows exact file and line |
| **Time to detect** | Weeks to months | Seconds |
| **Drift detection** | None — snapshot in time | Continuous — catches regressions |
| **Cost** | Consultant fees + team time | Free (open source) |
| **Evidence for auditors** | A spreadsheet | JSON/HTML report with findings, scores, HIPAA references |

## The compliance drift problem

Checklists are point-in-time snapshots. You're compliant on January 15 when you fill it out. By January 20, three PRs have landed with new violations. You don't know until the next quarterly review.

vlayer runs on every PR. If someone introduces a HIPAA violation on Tuesday, the scan fails on Tuesday. Not three months later.

## What auditors actually want

When an auditor asks "How do you ensure PHI is not exposed in logs?", which answer is stronger?

**Option A:** "We have a policy document that says developers should not log PHI."

**Option B:** "We run automated HIPAA scanning on every pull request. Here's the scan report from our last 50 PRs showing zero PHI-in-logs violations. Here's the CI configuration that blocks merging if violations are found."

Option B. Every time.

## Getting started

Replace your quarterly checklist with a CI scan that runs on every PR:

```bash
# Scan locally
npx vlayer scan ./src

# Generate a compliance report for auditors
npx vlayer scan ./src -f html -o hipaa-report.html

# Get your compliance score
npx vlayer score ./src
```

vlayer is open source, free, and scans 140+ HIPAA rules across 5 compliance categories.

The checklist had its time. Automate it.

```bash
npx vlayer scan ./src
```
