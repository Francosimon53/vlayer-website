---
title: "How to Fail a Pull Request on PHI Exposure"
date: "2026-04-09"
description: "Add HIPAA compliance checks to your CI pipeline. PRs that expose PHI automatically fail."
tags: ["github", "ci", "hipaa", "devops"]
---

Code review catches logic bugs. It does not reliably catch HIPAA violations. A reviewer might miss a `console.log(patient.ssn)` buried in a 400-line diff.

vlayer catches it in seconds. Here's how to wire it into your CI pipeline so PHI-exposing PRs fail automatically.

## Step 1: Add the GitHub Action

Create `.github/workflows/hipaa-scan.yml`:

```yaml
name: HIPAA Compliance Scan

on:
  pull_request:
    branches: [main, develop]

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

That's it. If vlayer finds critical or high-severity violations, the scan exits with a non-zero code, and the PR fails.

## What triggers a failure

vlayer exits with code 1 when it detects findings at **critical** or **high** severity. Here's what that looks like in practice.

A developer pushes this code:

```typescript
// app/api/patients/[id]/route.ts
export async function GET(req: Request, { params }) {
  const patient = await db.patients.findUnique({ where: { id: params.id } });
  console.log(`Patient lookup: ${patient.name}, SSN: ${patient.ssn}`);
  return Response.json(patient);
}
```

vlayer output in the CI log:

```
CRITICAL  phi-console-log
  PHI detected in console.log statement
  File: app/api/patients/[id]/route.ts:4

HIGH  encryption-weak-http
  Unencrypted HTTP URL may expose PHI during transmission
  File: lib/api-client.ts:12

Compliance Score: 34/100 (F)
2 critical, 1 high, 3 medium findings

Exit code: 1
```

The PR shows a red X. The developer fixes the log, pushes again, and the scan passes.

## Step 2: Block merge on failure

In your GitHub repo settings:

1. Go to **Settings > Branches > Branch protection rules**
2. Add rule for `main`
3. Enable **Require status checks to pass before merging**
4. Search for `vlayer HIPAA Scanner` and add it

Now no one can merge a PR that exposes PHI — not even admins (if you check "Include administrators").

## Step 3: Only fail on critical

If you want to allow high/medium findings through and only block on critical:

```yaml
- name: Run HIPAA scan
  run: |
    npx verification-layer scan ./src -f json -o vlayer-report.json || true
    CRITICAL=$(node -e "const r=require('./vlayer-report.json'); console.log(r.findings.filter(f=>f.severity==='critical').length)")
    if [ "$CRITICAL" -gt "0" ]; then
      echo "Found $CRITICAL critical HIPAA violations"
      exit 1
    fi
```

## Step 4: Scan only changed files

For large repos, you can scope the scan to changed files in the PR:

```yaml
- name: Get changed files
  id: changed
  run: |
    FILES=$(gh pr diff ${{ github.event.pull_request.number }} --name-only | grep -E '\.(ts|tsx|js|jsx)$' | tr '\n' ' ')
    echo "files=$FILES" >> $GITHUB_OUTPUT

- name: Run HIPAA scan on changed files
  if: steps.changed.outputs.files != ''
  run: npx verification-layer scan ${{ steps.changed.outputs.files }}
```

## What this catches that code review misses

In our data across thousands of scans, these are the top violations that make it past human review:

| Violation | Why reviewers miss it |
|-----------|----------------------|
| `console.log` with PHI | Looks like debug code, reviewer assumes it'll be removed |
| PHI in error messages | Buried in catch blocks reviewers skim |
| `localStorage.setItem` with patient data | Looks like caching, not a security issue |
| MD5/SHA1 for hashing | Reviewer doesn't know which algorithms are HIPAA-compliant |
| Missing audit logging on DELETE | Reviewer checks logic, not compliance requirements |

Machines don't get tired. Machines don't skim. Add the scan and stop relying on humans for pattern matching.

```bash
npx vlayer scan ./src
```
