-- Fase 4 incremental hardening: FK coverage and explicit deny policies.
-- RPCs SECURITY DEFINER continuam sendo a única superfície administrativa.

create index if not exists admin_audit_logs_admin_user_id_idx
  on public.admin_audit_logs (admin_user_id);

create index if not exists message_versions_template_id_idx
  on public.message_versions (template_id);

drop policy if exists message_templates_deny_client on public.message_templates;
create policy message_templates_deny_client on public.message_templates
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists message_versions_deny_client on public.message_versions;
create policy message_versions_deny_client on public.message_versions
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists feature_flags_deny_client on public.feature_flags;
create policy feature_flags_deny_client on public.feature_flags
  for all to anon, authenticated
  using (false)
  with check (false);

drop policy if exists admin_audit_logs_deny_client on public.admin_audit_logs;
create policy admin_audit_logs_deny_client on public.admin_audit_logs
  for all to anon, authenticated
  using (false)
  with check (false);
