-- Harden the existing workspace schema. Tokens are represented by key_hash;
-- plaintext keys are never stored. Existing scans carry evidence_json/graph_json.
alter table public.projects enable row level security;
alter table public.project_tokens enable row level security;
alter table public.scans enable row level security;
alter table public.findings enable row level security;
alter table public.compliance_exceptions enable row level security;

drop policy if exists projects_owner_all on public.projects;
create policy projects_owner_all on public.projects for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists project_tokens_owner_all on public.project_tokens;
create policy project_tokens_owner_all on public.project_tokens for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists scans_owner_select on public.scans;
create policy scans_owner_select on public.scans for select to authenticated using (exists(select 1 from public.projects p where p.id=project_id and p.user_id=(select auth.uid())));
drop policy if exists findings_owner_select on public.findings;
create policy findings_owner_select on public.findings for select to authenticated using (exists(select 1 from public.projects p where p.id=project_id and p.user_id=(select auth.uid())));
drop policy if exists exceptions_owner_all on public.compliance_exceptions;
create policy exceptions_owner_all on public.compliance_exceptions for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

grant select, insert, update, delete on public.projects, public.project_tokens, public.compliance_exceptions to authenticated;
grant select on public.scans, public.findings to authenticated;
revoke all on public.projects, public.project_tokens, public.scans, public.findings, public.compliance_exceptions from anon;

alter view public.monthly_usage set (security_invoker = true);
revoke all on function public.handle_new_user() from anon, authenticated;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.handle_updated_at() set search_path = public, pg_temp;
create index if not exists compliance_exceptions_user_id_idx on public.compliance_exceptions(user_id);
create index if not exists project_tokens_project_id_idx on public.project_tokens(project_id);
create index if not exists project_tokens_user_id_idx on public.project_tokens(user_id);
