# Compliance workspace implementation runbook

1. Add token-hash authenticated ingest and workspace persistence. Verify by reviewing `app/api/ingest/route.ts`: plaintext tokens are accepted only over the request, SHA-256 digests are compared in constant time, revoked tokens are rejected, and service-role access is isolated to `lib/supabase/admin.ts`.
2. Add project, scan, finding, evidence, graph, and exception tables with owner RLS. Verify by applying the migration to the configured Supabase project and checking `get_advisors` plus authenticated owner isolation queries.
3. Replace placeholder project and scan views with persisted records and details. Verify with `npm run lint`, `npm run typecheck`, and `npm run build`.
4. Validate the CI contract with `npm ci`, `npm audit --audit-level=high`, and the compliance workspace workflow.
