# vlayer.app

Marketing site for [vlayer](https://github.com/Francosimon53/verification-layer) — an open-source HIPAA compliance scanner for healthcare developers.

[![vlayer audit](https://github.com/Francosimon53/vlayer-website/actions/workflows/audit.yml/badge.svg)](https://github.com/Francosimon53/vlayer-website/actions/workflows/audit.yml)

Live at **[vlayer.app](https://vlayer.app)**.

## About vlayer

vlayer scans source code for HIPAA compliance violations across 141 rules in 5 categories (encryption, access control, audit logging, data integrity, incident response). It runs as a CLI, an MCP server for AI assistants, a GitHub Action, and a VS Code extension. The scanner is open-source under [its own LICENSE](https://github.com/Francosimon53/verification-layer/blob/main/LICENSE).

This repository contains only the marketing site at [vlayer.app](https://vlayer.app).

## Security

This site is scanned nightly by vlayer itself — we run our own product on our own marketing site. The audit runs at 08:00 UTC every day and on every push to `main`.

If new critical or high severity findings appear, the workflow opens or updates a tracking GitHub issue automatically (label: `vlayer-audit`).

Documented acknowledgments for known false positives are in [`vlayer.config.json`](./vlayer.config.json) — each entry includes the reason, expiration date, and a link to an upstream tracking issue. The scan workflow is at [`.github/workflows/audit.yml`](./.github/workflows/audit.yml).

Open upstream issues from dogfooding the scanner on this site:

- [verification-layer#32](https://github.com/Francosimon53/verification-layer/issues/32) — MFA-001 false positive on import patterns
- [verification-layer#33](https://github.com/Francosimon53/verification-layer/issues/33) — HIPAA-SESSION-001 false positive on Supabase managed sessions
- [verification-layer#34](https://github.com/Francosimon53/verification-layer/issues/34) — `security-dangerous-innerhtml-react` should detect DOMPurify as valid mitigation
- [verification-layer#35](https://github.com/Francosimon53/verification-layer/issues/35) — Baseline hash should not include line number
- [verification-layer#36](https://github.com/Francosimon53/verification-layer/issues/36) — Baseline stores absolute file paths (CI portability blocker)

## Tech stack

- [Next.js 16](https://nextjs.org/) with App Router
- TypeScript
- [Supabase](https://supabase.com) for authentication
- [Stripe](https://stripe.com) for billing
- [DOMPurify](https://github.com/cure53/DOMPurify) for content sanitization
- Deployed on [Vercel](https://vercel.com)

## Local development

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`.

Available scripts:

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm start` — run the production build locally
- `npm run lint` — run ESLint

## Running the security scan locally

```bash
npx --yes verification-layer@latest scan . --config vlayer.config.json --no-ai
```

Use `--no-ai` to skip the LLM triage layer. With the layer enabled, set the `ANTHROPIC_API_KEY` environment variable.

## Contributing

Issues and pull requests are welcome at [github.com/Francosimon53/vlayer-website](https://github.com/Francosimon53/vlayer-website).

For issues with the scanner itself (rules, false positives, baseline behavior), please open an issue at [Francosimon53/verification-layer](https://github.com/Francosimon53/verification-layer).

## License

[MIT](./LICENSE)
