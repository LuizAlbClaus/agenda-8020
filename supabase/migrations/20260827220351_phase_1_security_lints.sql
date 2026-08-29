-- Agenda 80/20 — Fase 1: fechar lints de RLS e índices de FK.
-- As tabelas permanecem internal-only: a policy explícita nega qualquer
-- operação a authenticated, enquanto os grants públicos continuam revogados.

drop policy if exists commerce_products_deny_authenticated on public.commerce_products;
create policy commerce_products_deny_authenticated on public.commerce_products
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists purchases_deny_authenticated on public.purchases;
create policy purchases_deny_authenticated on public.purchases
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists payment_webhook_events_deny_authenticated on public.payment_webhook_events;
create policy payment_webhook_events_deny_authenticated on public.payment_webhook_events
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists entitlement_grants_deny_authenticated on public.entitlement_grants;
create policy entitlement_grants_deny_authenticated on public.entitlement_grants
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists email_outbox_deny_authenticated on public.email_outbox;
create policy email_outbox_deny_authenticated on public.email_outbox
  for all to authenticated
  using (false)
  with check (false);

create index if not exists purchases_commerce_product_id_idx
  on public.purchases (commerce_product_id);

create index if not exists purchases_user_id_idx
  on public.purchases (user_id);

create index if not exists email_outbox_user_id_idx
  on public.email_outbox (user_id);
