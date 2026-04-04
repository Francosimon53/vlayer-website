---
title: "AI Coding in Healthcare: What Must Be Checked Before Every Merge"
date: "2026-04-23"
description: "5 patterns AI coding tools generate that violate HIPAA, and how to catch them automatically."
tags: ["ai", "cursor", "copilot", "hipaa"]
---

AI coding tools write correct code. They do not write compliant code.

Copilot, Cursor, and Claude generate working functions that pass tests — and violate HIPAA in ways that are hard to spot. They've been trained on millions of repos, most of which don't handle PHI.

Here are 5 patterns we see AI tools generate that vlayer catches.

## 1. Logging patient objects for debugging

You prompt: "Add error handling to this patient lookup function."

AI generates:

```typescript
async function getPatient(id: string) {
  try {
    const patient = await db.patients.findUnique({ where: { id } });
    if (!patient) throw new Error(`Patient not found: ${id}`);
    return patient;
  } catch (err) {
    console.error('Patient lookup failed:', err, { patientId: id });
    throw err;
  }
}
```

Looks clean. But in production, `err` might contain the full database row with SSN, DOB, and diagnosis in the stack trace.

vlayer output:

```
CRITICAL  phi-console-log
  PHI detected in console.error statement
  File: lib/patients.ts:7
```

## 2. Hardcoding credentials in config files

You prompt: "Set up a PostgreSQL connection pool."

AI generates:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'db.healthapp.com',
  database: 'patients',
  user: 'admin',
  password: 'healthcare_prod_2024',
  ssl: false,
});
```

vlayer output:

```
CRITICAL  hardcoded-password
  Hardcoded password detected
  File: lib/db.ts:7

CRITICAL  encryption-ssl-disabled
  SSL disabled may expose PHI during transmission
  File: lib/db.ts:8
```

AI tools don't know about your `.env` file. They generate working defaults.

## 3. SQL string concatenation

You prompt: "Write a search function for patients by name."

AI generates:

```typescript
async function searchPatients(name: string) {
  const query = `SELECT * FROM patients WHERE name LIKE '%${name}%'`;
  const result = await pool.query(query);
  return result.rows;
}
```

vlayer output:

```
CRITICAL  sql-template-literal
  SQL with template literal interpolation — vulnerable to injection
  File: lib/search.ts:2

MEDIUM  select-star
  SELECT * on sensitive table retrieves more data than necessary
  File: lib/search.ts:2
```

**Fix the AI wrote:**

```typescript
async function searchPatients(name: string) {
  const result = await pool.query(
    'SELECT id, name, appointment_date FROM patients WHERE name LIKE $1',
    [`%${name}%`]
  );
  return result.rows;
}
```

## 4. Storing PHI in client-side state

You prompt: "Cache the patient list so we don't refetch on every page navigation."

AI generates:

```typescript
'use client';

useEffect(() => {
  fetch('/api/patients')
    .then(r => r.json())
    .then(data => {
      setPatients(data);
      localStorage.setItem('patientCache', JSON.stringify(data));
    });
}, []);
```

vlayer output:

```
CRITICAL  phi-localstorage
  PHI stored in localStorage without encryption
  File: components/Dashboard.tsx:8
```

AI tools default to localStorage for caching. For PHI, you need server-side caching or in-memory only.

## 5. Missing authentication on API routes

You prompt: "Create a REST API for patient CRUD operations."

AI generates four clean route handlers — GET, POST, PUT, DELETE — none of which check authentication.

```typescript
export async function GET() {
  const patients = await db.patients.findMany();
  return Response.json(patients);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await db.patients.delete({ where: { id } });
  return Response.json({ deleted: true });
}
```

vlayer output:

```
HIGH  no-auth-middleware
  PHI endpoint has no authentication check
  File: app/api/patients/route.ts:1

MEDIUM  audit-unlogged-delete
  PHI delete operation may lack audit logging
  File: app/api/patients/route.ts:7
```

AI generates correct CRUD. It doesn't add auth, audit logging, or RBAC — because you didn't ask for it, and most training data doesn't include it.

## The solution

Don't stop using AI tools. They're fast and mostly right. But add a compliance check between "AI wrote it" and "it's merged":

```bash
npx vlayer scan ./src
```

Every PR. Every time. 140+ rules that catch what AI tools miss.

The workflow:

1. AI writes the code
2. You review the logic
3. vlayer checks the compliance
4. Merge with confidence
