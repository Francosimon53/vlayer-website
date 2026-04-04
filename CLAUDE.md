# Project Rules

## Stack
- Next.js 14+ (App Router)
- Supabase (auth, database, RLS)
- TypeScript strict mode
- Tailwind CSS
- Deploy: Vercel

## Conventions
- Server Components by default
- "use client" ONLY when needed (hooks, events, browser APIs)
- Supabase: use `@supabase/ssr` — NEVER `@supabase/auth-helpers` (deprecated)
- Server-side: `createServerClient` from `@supabase/ssr`
- Client-side: `createBrowserClient` from `@supabase/ssr`
- All database mutations through Server Actions or Route Handlers
- No `any` — all API responses typed

## Before Starting Any Task
1. Read `gotchas.md`
2. Read `/references` for current schema and types
3. Enter plan mode if task has 3+ steps
4. Run `scripts/verify.sh` after completing work
