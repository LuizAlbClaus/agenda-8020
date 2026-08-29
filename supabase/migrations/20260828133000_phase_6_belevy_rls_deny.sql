-- Fase 6: explicita a negação RLS para clientes autenticados.
-- A tabela continua sem grants para anon/authenticated; service_role bypassa RLS.

alter table public.benefit_entitlements enable row level security;
drop policy if exists benefit_entitlements_deny_authenticated on public.benefit_entitlements;
create policy benefit_entitlements_deny_authenticated
  on public.benefit_entitlements
  for all
  to authenticated
  using (false)
  with check (false);

