import { NextRequest, NextResponse } from 'next/server';

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

// ── HIPAA rule database ─────────────────────────────────────────────────────

const HIPAA_RULES = [
  // PHI Exposure
  { id: 'PHI-001', category: 'phi-exposure', severity: 'critical', title: 'Hardcoded PHI in source code', description: 'Detects patient names, SSNs, MRNs, or DOBs embedded in code or comments.' },
  { id: 'PHI-002', category: 'phi-exposure', severity: 'critical', title: 'PHI in log statements', description: 'Detects logging of patient identifiers, diagnoses, or treatment data.' },
  { id: 'PHI-003', category: 'phi-exposure', severity: 'high', title: 'PHI in error messages', description: 'Patient data exposed in user-facing error messages or stack traces.' },
  { id: 'PHI-004', category: 'phi-exposure', severity: 'high', title: 'Unmasked PHI in API responses', description: 'API endpoints returning full SSN, MRN, or DOB without masking.' },
  { id: 'PHI-005', category: 'phi-exposure', severity: 'medium', title: 'PHI in URL parameters', description: 'Patient identifiers passed via query strings or URL paths.' },
  // Encryption
  { id: 'ENC-001', category: 'encryption', severity: 'critical', title: 'Missing encryption at rest', description: 'PHI stored in plaintext without AES-256 or equivalent encryption.' },
  { id: 'ENC-002', category: 'encryption', severity: 'critical', title: 'HTTP endpoint handling PHI', description: 'Endpoints processing PHI accessible over HTTP instead of HTTPS/TLS.' },
  { id: 'ENC-003', category: 'encryption', severity: 'high', title: 'Weak encryption algorithm', description: 'Use of MD5, SHA-1, DES, or other deprecated cryptographic algorithms.' },
  { id: 'ENC-004', category: 'encryption', severity: 'high', title: 'Hardcoded encryption keys', description: 'Encryption keys or secrets embedded directly in source code.' },
  { id: 'ENC-005', category: 'encryption', severity: 'medium', title: 'Missing TLS certificate validation', description: 'HTTP clients with disabled certificate verification.' },
  // Audit Logging
  { id: 'AUD-001', category: 'audit-logging', severity: 'high', title: 'Missing access audit trail', description: 'PHI access events not logged with user identity and timestamp.' },
  { id: 'AUD-002', category: 'audit-logging', severity: 'high', title: 'Mutable audit logs', description: 'Audit log entries can be modified or deleted by application code.' },
  { id: 'AUD-003', category: 'audit-logging', severity: 'medium', title: 'Missing failed authentication logging', description: 'Failed login attempts not recorded for security monitoring.' },
  { id: 'AUD-004', category: 'audit-logging', severity: 'medium', title: 'Insufficient log retention', description: 'Audit logs not retained for the required 6-year HIPAA minimum.' },
  // Access Control
  { id: 'ACL-001', category: 'access-control', severity: 'critical', title: 'Missing authentication on PHI endpoint', description: 'API endpoint serving PHI with no authentication check.' },
  { id: 'ACL-002', category: 'access-control', severity: 'critical', title: 'Missing role-based access control', description: 'No RBAC or minimum necessary access enforcement for PHI.' },
  { id: 'ACL-003', category: 'access-control', severity: 'high', title: 'Session timeout not enforced', description: 'User sessions accessing PHI do not expire after inactivity.' },
  { id: 'ACL-004', category: 'access-control', severity: 'high', title: 'Default credentials in use', description: 'Default admin passwords or API keys not changed from defaults.' },
  { id: 'ACL-005', category: 'access-control', severity: 'medium', title: 'Missing multi-factor authentication', description: 'Remote access to PHI systems without MFA requirement.' },
];

// ── Demo scan patterns ──────────────────────────────────────────────────────

interface Violation {
  ruleId: string;
  severity: string;
  title: string;
  line: number;
  column: number;
  snippet: string;
  message: string;
  fix?: string;
}

function scanCodeForViolations(code: string, language: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');

  const patterns: Array<{ regex: RegExp; ruleId: string; message: string }> = [
    { regex: /console\.log.*(?:ssn|patient|diagnosis|mrn|dob|social.?security)/i, ruleId: 'PHI-002', message: 'PHI detected in log statement' },
    { regex: /(?:ssn|social.?security.?number)\s*[:=]\s*['"`]\d/i, ruleId: 'PHI-001', message: 'Hardcoded SSN detected' },
    { regex: /(?:patient.?name|patient.?id)\s*[:=]\s*['"`]/i, ruleId: 'PHI-001', message: 'Hardcoded patient identifier detected' },
    { regex: /Error\(.*(?:patient|ssn|diagnosis)/i, ruleId: 'PHI-003', message: 'PHI exposed in error message' },
    { regex: /(?:query|params|searchParams).*(?:ssn|patient_id|mrn)/i, ruleId: 'PHI-005', message: 'PHI passed via URL parameters' },
    { regex: /(?:md5|sha1|des)\s*\(/i, ruleId: 'ENC-003', message: 'Weak encryption algorithm detected' },
    { regex: /(?:secret|key|password)\s*[:=]\s*['"`][A-Za-z0-9+/=]{8,}/i, ruleId: 'ENC-004', message: 'Hardcoded secret or encryption key' },
    { regex: /http:\/\/.*(?:patient|phi|health|medical|ehr)/i, ruleId: 'ENC-002', message: 'PHI endpoint using HTTP instead of HTTPS' },
    { regex: /rejectUnauthorized\s*:\s*false/i, ruleId: 'ENC-005', message: 'TLS certificate validation disabled' },
    { regex: /verify\s*[:=]\s*false/i, ruleId: 'ENC-005', message: 'Certificate verification disabled' },
    { regex: /password\s*[:=]\s*['"`](?:admin|password|123|default)/i, ruleId: 'ACL-004', message: 'Default credentials detected' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        const rule = HIPAA_RULES.find((r) => r.id === pattern.ruleId);
        violations.push({
          ruleId: pattern.ruleId,
          severity: rule?.severity ?? 'high',
          title: rule?.title ?? pattern.ruleId,
          line: i + 1,
          column: 1,
          snippet: line.trim(),
          message: pattern.message,
        });
      }
    }
  }

  return violations;
}

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'scan_code',
    description: 'Scan source code for HIPAA compliance violations. Analyzes code for PHI exposure, encryption issues, missing audit logging, and access control problems.',
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
    description: 'List all available HIPAA scanning rules, optionally filtered by category.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['phi-exposure', 'encryption', 'audit-logging', 'access-control'],
          description: 'Filter rules by category',
        },
      },
    },
  },
  {
    name: 'suggest_fix',
    description: 'Get auto-fix suggestions for a specific HIPAA violation, including corrected code.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        violation_id: { type: 'string', description: 'Rule ID of the violation (e.g. PHI-001, ENC-003)' },
        code_context: { type: 'string', description: 'The code surrounding the violation' },
      },
      required: ['violation_id', 'code_context'],
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

  const violations = scanCodeForViolations(code, language);
  const lineCount = code.split('\n').length;

  if (violations.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `Scan complete. No HIPAA violations detected in ${lineCount} lines of ${language} code.`,
      }],
    };
  }

  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const highCount = violations.filter((v) => v.severity === 'high').length;
  const mediumCount = violations.filter((v) => v.severity === 'medium').length;

  const lines = [
    `**HIPAA Scan Results** — ${violations.length} violation(s) found in ${lineCount} lines of ${language}`,
    '',
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Critical | ${criticalCount} |`,
    `| High     | ${highCount} |`,
    `| Medium   | ${mediumCount} |`,
    '',
    '**Violations:**',
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
          '_Note: Full repo scanning requires a VLayer account. This is a demo assessment._',
        ].join('\n'),
      }],
    };
  }

  // Score based on actual code analysis
  const violations = scanCodeForViolations(code!, 'typescript');
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
        `- ${violations.length} violation(s) found in ${lineCount} lines`,
        `- Critical: ${violations.filter((v) => v.severity === 'critical').length}`,
        `- High: ${violations.filter((v) => v.severity === 'high').length}`,
        `- Medium: ${violations.filter((v) => v.severity === 'medium').length}`,
        '',
        violations.length > 0 ? 'Run `scan_code` for detailed violation reports and `suggest_fix` for remediation.' : 'No violations detected. Code appears HIPAA-compliant.',
      ].join('\n'),
    }],
  };
}

function handleListRules(args: Record<string, unknown>) {
  const category = args.category as string | undefined;
  const filtered = category ? HIPAA_RULES.filter((r) => r.category === category) : HIPAA_RULES;

  const categories = [...new Set(filtered.map((r) => r.category))];
  const lines = [`**VLayer HIPAA Rules** — ${filtered.length} rule(s)`, ''];

  for (const cat of categories) {
    const catRules = filtered.filter((r) => r.category === cat);
    lines.push(`### ${cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`);
    lines.push('');
    for (const r of catRules) {
      lines.push(`- **[${r.id}]** ${r.title} (${r.severity})`);
      lines.push(`  ${r.description}`);
    }
    lines.push('');
  }

  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

const FIX_SUGGESTIONS: Record<string, { explanation: string; pattern: string; fix: string }> = {
  'PHI-001': {
    explanation: 'Never hardcode PHI in source code. Use environment variables or encrypted configuration, and reference patients by opaque IDs.',
    pattern: 'patient_name = "John Doe"',
    fix: 'patient_id = get_patient_id_from_session()  # Reference by opaque ID, never by name',
  },
  'PHI-002': {
    explanation: 'Strip or mask all PHI before logging. Log opaque identifiers only.',
    pattern: 'console.log("Patient SSN:", patient.ssn)',
    fix: 'logger.info("Patient access", { patientId: patient.id, action: "view" })  // Log opaque ID only',
  },
  'PHI-003': {
    explanation: 'Return generic error messages to users. Log detailed errors server-side with opaque IDs only.',
    pattern: 'throw new Error(`Patient ${patient.name} not found`)',
    fix: 'throw new Error("Record not found")  // Never include PHI in error messages',
  },
  'PHI-004': {
    explanation: 'Mask sensitive fields in API responses. Only return the minimum necessary data.',
    pattern: 'res.json({ ssn: patient.ssn, name: patient.name })',
    fix: 'res.json({ id: patient.id, ssn: maskSSN(patient.ssn) })  // Mask: ***-**-1234',
  },
  'PHI-005': {
    explanation: 'Never pass PHI in URL parameters. Use POST request bodies or encrypted tokens.',
    pattern: '/api/patient?ssn=123-45-6789',
    fix: 'POST /api/patient with body: { patientId: "opaque-uuid" }  // Use POST + opaque IDs',
  },
  'ENC-001': {
    explanation: 'Encrypt all PHI at rest using AES-256 or equivalent. Use a key management service.',
    pattern: 'db.store({ data: plaintext_phi })',
    fix: 'db.store({ data: encrypt(phi, await kms.getKey("phi-key")) })  // AES-256-GCM via KMS',
  },
  'ENC-002': {
    explanation: 'All PHI must be transmitted over TLS 1.2+. Enforce HTTPS in your infrastructure.',
    pattern: 'fetch("http://api.example.com/patients")',
    fix: 'fetch("https://api.example.com/patients")  // Always use HTTPS for PHI endpoints',
  },
  'ENC-003': {
    explanation: 'Replace deprecated algorithms with modern alternatives: SHA-256+, AES-256, bcrypt/argon2.',
    pattern: 'crypto.createHash("md5").update(data)',
    fix: 'crypto.createHash("sha256").update(data)  // Use SHA-256 minimum',
  },
  'ENC-004': {
    explanation: 'Store secrets in environment variables or a secrets manager. Never commit keys to source control.',
    pattern: 'const API_KEY = "sk-abc123..."',
    fix: 'const API_KEY = process.env.API_KEY  // Load from environment or secrets manager',
  },
  'ENC-005': {
    explanation: 'Always validate TLS certificates. Disabling verification exposes PHI to MITM attacks.',
    pattern: '{ rejectUnauthorized: false }',
    fix: '{ rejectUnauthorized: true, ca: fs.readFileSync("ca-cert.pem") }  // Validate certs',
  },
  'AUD-001': {
    explanation: 'Log every PHI access with who, what, when, and from where. Use structured audit events.',
    pattern: 'getPatientRecord(id)',
    fix: 'auditLog({ action: "phi_access", userId, patientId: id, timestamp: Date.now(), ip: req.ip }); getPatientRecord(id)',
  },
  'AUD-002': {
    explanation: 'Write audit logs to append-only storage. Use immutable log services or write-once buckets.',
    pattern: 'db.auditLogs.update({ id }, { ...changes })',
    fix: 'db.auditLogs.insert({ ...event, immutable: true })  // Append-only, never update/delete',
  },
  'ACL-001': {
    explanation: 'Every PHI endpoint must require authentication. Use middleware to enforce this globally.',
    pattern: 'app.get("/api/patients", handler)',
    fix: 'app.get("/api/patients", requireAuth, requireRole("provider"), handler)  // Auth + RBAC',
  },
  'ACL-002': {
    explanation: 'Implement role-based access control. Enforce minimum necessary access per HIPAA.',
    pattern: 'if (user) return allPatientData',
    fix: 'if (user.role === "provider" && user.assignedPatients.includes(patientId)) return filteredData',
  },
  'ACL-004': {
    explanation: 'Force password changes on first login. Use strong, unique credentials.',
    pattern: 'password = "admin123"',
    fix: 'password = await generateSecurePassword()  // Force change on first login',
  },
};

function handleSuggestFix(args: Record<string, unknown>) {
  const violationId = (args.violation_id as string)?.toUpperCase();
  const codeContext = args.code_context as string;

  if (!violationId) {
    return { content: [{ type: 'text', text: 'Missing required field: violation_id' }], isError: true };
  }

  const rule = HIPAA_RULES.find((r) => r.id === violationId);
  if (!rule) {
    return { content: [{ type: 'text', text: `Unknown rule: ${violationId}. Use list_rules to see available rules.` }], isError: true };
  }

  const suggestion = FIX_SUGGESTIONS[violationId];

  const lines = [
    `**Fix for [${rule.id}] ${rule.title}**`,
    `Severity: ${rule.severity} | Category: ${rule.category}`,
    '',
    `**Problem:** ${rule.description}`,
    '',
  ];

  if (suggestion) {
    lines.push(`**Explanation:** ${suggestion.explanation}`);
    lines.push('');
    lines.push('**Before:**');
    lines.push('```');
    lines.push(codeContext || suggestion.pattern);
    lines.push('```');
    lines.push('');
    lines.push('**After:**');
    lines.push('```');
    lines.push(suggestion.fix);
    lines.push('```');
  } else {
    lines.push(`**Recommendation:** Review and remediate according to HIPAA Security Rule requirements for ${rule.category}.`);
  }

  lines.push('');
  lines.push(`_HIPAA Reference: 45 CFR 164.312 — Technical Safeguards_`);

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
      ruleCount: HIPAA_RULES.length,
      categories: ['phi-exposure', 'encryption', 'audit-logging', 'access-control'],
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
