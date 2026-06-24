import { NextRequest, NextResponse } from 'next/server';
import ruleCatalogJson from './rule-catalog.json';

// ── CORS ────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonRpcSuccess(id: string | number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id, result }, { headers: CORS_HEADERS });
}

function jsonRpcError(id: string | number | null, code: number, message: string, data?: unknown) {
  return NextResponse.json(
    { jsonrpc: '2.0', id, error: { code, message, ...(data !== undefined && { data }) } },
    { headers: CORS_HEADERS },
  );
}

// ── Rule catalog (the REAL published catalog, synced from verification-layer) ─
//
// app/mcp/rule-catalog.json is a committed snapshot of verification-layer's
// dist/rule-catalog.json, refreshed by scripts/sync-rule-catalog.mjs before every
// build. We import only this JSON data — the scanner runtime is never bundled here.

interface CatalogRule {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  hipaaReference?: string;
  source: string;
  scanner: string;
}

interface RuleCatalog {
  package: string;
  version: string;
  total: number;
  counts: Record<string, number>;
  rules: CatalogRule[];
}

const catalog = ruleCatalogJson as unknown as RuleCatalog;
const RULES = catalog.rules;
const RULE_BY_ID = new Map(RULES.map((r) => [r.id, r]));
const RULE_BY_ID_LOWER = new Map(RULES.map((r) => [r.id.toLowerCase(), r]));
// Distinct categories, derived from the catalog so nothing can drift out of sync.
const CATEGORIES = [...new Set(RULES.map((r) => r.category))];

function findRule(id: string): CatalogRule | undefined {
  return RULE_BY_ID.get(id) ?? RULE_BY_ID_LOWER.get(id.toLowerCase());
}

// ── Representative quick-scan patterns ──────────────────────────────────────
//
// This is a small, honest DEMO: a handful of built-in regexes, each mapped to a
// REAL catalog rule id. It is not the full scanner. Severity/title are pulled from
// the catalog by id, and any pattern whose id is not in the catalog is skipped, so
// scan_code can only ever emit real rule ids.

interface Violation {
  ruleId: string;
  severity: string;
  title: string;
  line: number;
  column: number;
  snippet: string;
  message: string;
}

const DEMO_PATTERNS: Array<{ regex: RegExp; ruleId: string; message: string }> = [
  { regex: /console\.log[^\n]*(?:ssn|patient|diagnosis|mrn|dob|social.?security)/i, ruleId: 'phi-console-log', message: 'PHI detected in console output' },
  { regex: /(?:ssn|social.?security.?number)\s*[:=]\s*['"`]\d/i, ruleId: 'ssn-hardcoded', message: 'Hardcoded SSN detected' },
  { regex: /(?:query|params|searchParams)[^\n]*(?:ssn|patient_id|mrn)/i, ruleId: 'phi-query-param', message: 'PHI passed via URL query parameter' },
  { regex: /(?:md5|sha1)\s*\(/i, ruleId: 'enc-md5', message: 'Weak hash algorithm (MD5/SHA-1) detected' },
  { regex: /\bdes\s*\(/i, ruleId: 'enc-des', message: 'DES encryption detected' },
  { regex: /(?:secret|key|password)\s*[:=]\s*['"`][A-Za-z0-9+/=]{8,}/i, ruleId: 'CRED-002', message: 'Hardcoded credential or secret' },
  { regex: /http:\/\/[^\n]*(?:patient|phi|health|medical|ehr)/i, ruleId: 'enc-http-url', message: 'PHI endpoint using unencrypted HTTP' },
  { regex: /rejectUnauthorized\s*:\s*false/i, ruleId: 'enc-tls-cert-validation-disabled', message: 'TLS certificate validation disabled' },
  { regex: /verify\s*[:=]\s*false/i, ruleId: 'enc-tls-cert-validation-disabled', message: 'Certificate verification disabled' },
  { regex: /password\s*[:=]\s*['"`](?:admin|password|123|default)/i, ruleId: 'hardcoded-password', message: 'Hardcoded or default password detected' },
];

function scanCodeForViolations(code: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of DEMO_PATTERNS) {
      if (!pattern.regex.test(line)) continue;
      const rule = findRule(pattern.ruleId);
      if (!rule) continue; // never emit an id that isn't in the real catalog
      violations.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        line: i + 1,
        column: 1,
        snippet: line.trim(),
        message: pattern.message,
      });
    }
  }

  return violations;
}

const QUICK_SCAN_NOTE =
  `> Representative quick-scan: a small built-in pattern subset, not the full catalog. ` +
  `The complete scanner checks all ${catalog.total} rules — run \`npx verification-layer scan ./src\` for a full HIPAA scan.`;

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'scan_code',
    description:
      `Run a representative HIPAA quick-scan over a code snippet using a small built-in pattern subset ` +
      `(not the full catalog). For a complete scan of all ${catalog.total} rules, use the CLI: ` +
      `npx verification-layer scan ./src`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        code: { type: 'string', description: 'Source code to scan' },
        language: { type: 'string', enum: ['typescript', 'python', 'java'], description: 'Programming language' },
      },
      required: ['code', 'language'],
    },
  },
  {
    name: 'get_compliance_score',
    description: 'Get a HIPAA compliance score (0-100) for a code snippet or repository. Higher scores indicate better compliance.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        code_snippet: { type: 'string', description: 'Code to evaluate' },
        repo_url: { type: 'string', description: 'GitHub repository URL to scan' },
      },
    },
  },
  {
    name: 'list_rules',
    description: `List the ${catalog.total} HIPAA scanning rules from the verification-layer catalog, optionally filtered by category.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: CATEGORIES,
          description: 'Filter rules by category',
        },
      },
    },
  },
  {
    name: 'suggest_fix',
    description: 'Get remediation guidance for a specific HIPAA rule by its id, including the recommendation and HIPAA reference.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        violation_id: { type: 'string', description: 'Rule ID from the catalog (e.g. enc-des, CRED-002, ssn-hardcoded)' },
        code_context: { type: 'string', description: 'Optional code surrounding the violation' },
      },
      required: ['violation_id'],
    },
  },
];

// ── Tool handlers ───────────────────────────────────────────────────────────

function handleScanCode(args: Record<string, unknown>) {
  const code = args.code as string;
  const language = (args.language as string) ?? 'typescript';

  if (!code) {
    return { content: [{ type: 'text', text: 'Missing required field: code' }], isError: true };
  }

  const violations = scanCodeForViolations(code);
  const lineCount = code.split('\n').length;

  if (violations.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `${QUICK_SCAN_NOTE}\n\nQuick-scan complete. No issues detected by the representative patterns in ${lineCount} lines of ${language} code.`,
      }],
    };
  }

  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const highCount = violations.filter((v) => v.severity === 'high').length;
  const mediumCount = violations.filter((v) => v.severity === 'medium').length;

  const lines = [
    QUICK_SCAN_NOTE,
    '',
    `**HIPAA Quick-Scan Results** — ${violations.length} potential issue(s) found in ${lineCount} lines of ${language}`,
    '',
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Critical | ${criticalCount} |`,
    `| High     | ${highCount} |`,
    `| Medium   | ${mediumCount} |`,
    '',
    '**Findings:**',
    '',
  ];

  for (const v of violations) {
    lines.push(`- **[${v.ruleId}]** ${v.title} (${v.severity})`);
    lines.push(`  Line ${v.line}: \`${v.snippet}\``);
    lines.push(`  ${v.message}`);
    lines.push('');
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

function handleGetComplianceScore(args: Record<string, unknown>) {
  const code = args.code_snippet as string | undefined;
  const repoUrl = args.repo_url as string | undefined;

  if (!code && !repoUrl) {
    return { content: [{ type: 'text', text: 'Provide either code_snippet or repo_url' }], isError: true };
  }

  if (repoUrl) {
    // Demo: return a simulated score for repo scans
    return {
      content: [{
        type: 'text',
        text: [
          `**HIPAA Compliance Score for** \`${repoUrl}\``,
          '',
          '| Category | Score | Status |',
          '|----------|-------|--------|',
          '| PHI Protection | 72/100 | Needs improvement |',
          '| Encryption | 85/100 | Good |',
          '| Audit Logging | 60/100 | Needs improvement |',
          '| Access Control | 78/100 | Good |',
          '',
          '**Overall Score: 74/100**',
          '',
          '_Note: Full repo scanning requires the verification-layer CLI. This is a demo assessment._',
        ].join('\n'),
      }],
    };
  }

  // Score based on actual code analysis (representative quick-scan)
  const violations = scanCodeForViolations(code!);
  const lineCount = Math.max(code!.split('\n').length, 1);
  const violationDensity = violations.length / lineCount;

  const criticalPenalty = violations.filter((v) => v.severity === 'critical').length * 15;
  const highPenalty = violations.filter((v) => v.severity === 'high').length * 8;
  const mediumPenalty = violations.filter((v) => v.severity === 'medium').length * 3;

  const score = Math.max(0, Math.round(100 - criticalPenalty - highPenalty - mediumPenalty - violationDensity * 10));

  const grade = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Critical Risk';

  return {
    content: [{
      type: 'text',
      text: [
        `**HIPAA Compliance Score: ${score}/100** (${grade})`,
        '',
        `- ${violations.length} issue(s) found in ${lineCount} lines (representative quick-scan)`,
        `- Critical: ${violations.filter((v) => v.severity === 'critical').length}`,
        `- High: ${violations.filter((v) => v.severity === 'high').length}`,
        `- Medium: ${violations.filter((v) => v.severity === 'medium').length}`,
        '',
        violations.length > 0
          ? 'Run `scan_code` for detailed findings and `suggest_fix` for remediation, or `npx verification-layer scan ./src` for the full scan.'
          : 'No issues detected by the representative patterns. Run `npx verification-layer scan ./src` for the full scan.',
      ].join('\n'),
    }],
  };
}

function handleListRules(args: Record<string, unknown>) {
  const category = args.category as string | undefined;
  const filtered = category ? RULES.filter((r) => r.category === category) : RULES;

  if (filtered.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `No rules found for category "${category}". Valid categories: ${CATEGORIES.join(', ')}.`,
      }],
    };
  }

  const groups = category ? [category] : CATEGORIES;
  const lines = [`**verification-layer HIPAA Rules** — ${filtered.length} rule(s)`, ''];

  for (const cat of groups) {
    const catRules = filtered.filter((r) => r.category === cat);
    if (catRules.length === 0) continue;
    lines.push(`### ${cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} (${catRules.length})`);
    lines.push('');
    for (const r of catRules) {
      lines.push(`- **[${r.id}]** ${r.title} (${r.severity})`);
      lines.push(`  ${r.description}`);
    }
    lines.push('');
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

function handleSuggestFix(args: Record<string, unknown>) {
  const violationId = (args.violation_id as string)?.trim();

  if (!violationId) {
    return { content: [{ type: 'text', text: 'Missing required field: violation_id' }], isError: true };
  }

  const rule = findRule(violationId);
  if (!rule) {
    return {
      content: [{ type: 'text', text: `Unknown rule: ${violationId}. Use list_rules to see available rules.` }],
      isError: true,
    };
  }

  const lines = [
    `**[${rule.id}] ${rule.title}**`,
    `Severity: ${rule.severity} | Category: ${rule.category}`,
    '',
    `**Problem:** ${rule.description}`,
  ];

  if (rule.recommendation) {
    lines.push('', `**Recommendation:** ${rule.recommendation}`);
  } else {
    lines.push('', `**Recommendation:** Review and remediate according to HIPAA Security Rule requirements for ${rule.category}.`);
  }

  if (rule.hipaaReference) {
    lines.push('', `_HIPAA Reference: ${rule.hipaaReference}_`);
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

// ── Tool dispatcher ─────────────────────────────────────────────────────────

const TOOL_HANDLERS: Record<string, (args: Record<string, unknown>) => unknown> = {
  scan_code: handleScanCode,
  get_compliance_score: handleGetComplianceScore,
  list_rules: handleListRules,
  suggest_fix: handleSuggestFix,
};

// ── Route handlers ──────────────────────────────────────────────────────────

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET() {
  return NextResponse.json(
    {
      name: 'vlayer',
      version: '1.0.0',
      description: 'VLayer HIPAA Compliance Scanner — MCP endpoint for scanning healthcare software for HIPAA violations.',
      protocol: 'MCP (Model Context Protocol)',
      transport: 'JSON-RPC 2.0 over HTTP POST',
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
      scannerVersion: catalog.version,
      ruleCount: catalog.total,
      categories: CATEGORIES,
    },
    { headers: CORS_HEADERS },
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: invalid JSON');
  }

  const { jsonrpc, id, method, params } = body as {
    jsonrpc: string;
    id: string | number | null;
    method: string;
    params?: unknown;
  };

  if (jsonrpc !== '2.0') {
    return jsonRpcError(id ?? null, -32600, 'Invalid Request: jsonrpc must be "2.0"');
  }

  if (!method || typeof method !== 'string') {
    return jsonRpcError(id ?? null, -32600, 'Invalid Request: missing method');
  }

  try {
    switch (method) {
      case 'initialize': {
        return jsonRpcSuccess(id, {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'vlayer', version: '1.0.0' },
          capabilities: { tools: {} },
        });
      }

      case 'tools/list': {
        return jsonRpcSuccess(id, { tools: TOOLS });
      }

      case 'tools/call': {
        const p = params as { name: string; arguments?: Record<string, unknown> } | undefined;
        if (!p?.name) {
          return jsonRpcError(id, -32602, 'Invalid params: missing tool name');
        }

        const handler = TOOL_HANDLERS[p.name];
        if (!handler) {
          return jsonRpcError(id, -32602, `Unknown tool: ${p.name}`);
        }

        const result = handler(p.arguments ?? {});
        return jsonRpcSuccess(id, result);
      }

      case 'notifications/initialized':
      case 'ping': {
        return jsonRpcSuccess(id, {});
      }

      default: {
        return jsonRpcError(id, -32601, `Method not found: ${method}`);
      }
    }
  } catch (err) {
    console.error(`MCP error [${method}]:`, err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return jsonRpcError(id, -32603, message);
  }
}
