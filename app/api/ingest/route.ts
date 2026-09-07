/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function digest(token: string) { return createHash('sha256').update(token, 'utf8').digest('hex'); }

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || token.length > 512) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.projectId !== 'string' || !body.report || typeof body.report !== 'object') return NextResponse.json({ error: 'projectId and report are required' }, { status: 400 });
  const admin = createAdminClient();
  const { data: candidates } = await admin.from('project_tokens').select('id,project_id,key_hash').eq('project_id', body.projectId).is('revoked_at', null);
  const hash = digest(token);
  const match = candidates?.find((row) => row.key_hash.length === hash.length && timingSafeEqual(Buffer.from(row.key_hash), Buffer.from(hash)));
  if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const report = body.report as Record<string, unknown>;
  const findings = Array.isArray(report.findings) ? report.findings : [];
  const stats = report.stats && typeof report.stats === 'object' ? report.stats : {};
  const decision = report.decision && typeof report.decision === 'object' ? report.decision : {};
  const { data: scan, error } = await admin.from('scans').insert({ project_id: match.project_id, head_sha: typeof body.commitSha === 'string' ? body.commitSha : null, source_branch: typeof body.branch === 'string' ? body.branch : null, total_findings: findings.length, critical_count: Number((stats as any).critical ?? 0), high_count: Number((stats as any).high ?? 0), medium_count: Number((stats as any).medium ?? 0), report_json: report, decision: JSON.stringify(decision), policy_decision: decision }).select('id').single();
  if (error || !scan) return NextResponse.json({ error: 'Unable to persist scan' }, { status: 500 });
  if (findings.length) {
    const rows = findings.filter((f): f is Record<string, unknown> => !!f && typeof f === 'object').map((f) => ({ project_id: match.project_id, scan_id: scan.id, finding_id: String(f.id ?? f.ruleId ?? 'unknown'), rule_id: String(f.id ?? f.ruleId ?? 'unknown'), severity: String(f.severity ?? 'info'), file_path: typeof f.file === 'string' ? f.file : null, line_number: typeof f.line === 'number' ? f.line : null, title: typeof f.title === 'string' ? f.title : 'Finding', description: JSON.stringify(f) }));
    if (rows.length) await admin.from('findings').insert(rows);
  }
  const evidence = body.evidence && typeof body.evidence === 'object' ? body.evidence : report;
  const sha256 = createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
  await admin.from('scans').update({ evidence_hash: sha256, evidence_json: evidence, graph_json: body.graph ?? report.graph ?? null }).eq('id', scan.id);
  return NextResponse.json({ ok: true, projectId: match.project_id, scanId: scan.id });
}
