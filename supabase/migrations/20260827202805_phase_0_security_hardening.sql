-- Agenda 80/20 — Fase 0 security hardening (incremental migration).
-- Spec section 108: user_roles has no client-readable rows.

-- rls_auto_enable is an internal event-trigger helper, never an RPC.
-- Guard the revoke so this migration remains safe where the helper is absent.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

drop policy if exists user_roles_deny_select on public.user_roles;
create policy user_roles_deny_select on public.user_roles
  for select to authenticated
  using (false);
