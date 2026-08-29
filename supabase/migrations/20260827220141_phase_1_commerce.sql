-- Agenda 80/20 — Fase 1: commerce, webhook idempotente e concessão de acesso.
-- O payload bruto da Cakto não é persistido. Esta migration mantém apenas os
-- campos mínimos necessários para conciliação, auditoria e acesso.

create table if not exists public.commerce_products (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'cakto'),
  provider_product_id text not null,
  provider_offer_id text not null,
  internal_product_code text not null,
  access_days integer not null check (access_days between 1 and 3650),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_product_id, provider_offer_id),
  unique (provider, internal_product_code)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'cakto'),
  provider_order_id text not null unique,
  provider_ref_id text,
  product_id text not null,
  offer_id text not null,
  commerce_product_id uuid not null references public.commerce_products (id),
  user_id uuid not null references auth.users (id) on delete restrict,
  buyer_email text not null,
  buyer_name text,
  status text not null check (status in ('paid', 'refunded', 'chargedback', 'ignored')),
  amount numeric(12, 2) check (amount is null or amount >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'cakto'),
  event_key text not null unique,
  event_type text not null check (event_type in ('purchase_approved', 'refund', 'chargeback')),
  provider_order_id text not null,
  provider_ref_id text,
  product_id text,
  offer_id text,
  payload_hash text not null,
  processing_status text not null check (processing_status in ('processed', 'ignored', 'failed')),
  error_code text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists payment_webhook_events_order_idx
  on public.payment_webhook_events (provider, provider_order_id, event_type);

create table if not exists public.entitlement_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_code text not null,
  purchase_id uuid not null unique references public.purchases (id) on delete restrict,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  status public.entitlement_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > starts_at)
);

create index if not exists entitlement_grants_access_lookup_idx
  on public.entitlement_grants (user_id, product_code, status, expires_at);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  template_key text not null check (template_key in ('access_granted')),
  recipient_email text not null,
  recipient_name text,
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_outbox_pending_idx
  on public.email_outbox (available_at, created_at)
  where status in ('pending', 'failed');

insert into public.commerce_products (
  provider,
  provider_product_id,
  provider_offer_id,
  internal_product_code,
  access_days,
  active
)
values (
  'cakto',
  'e412eb02-ccf5-47e9-9fe1-ce846a074140',
  'ydbnyd6',
  'agenda_8020',
  365,
  true
)
on conflict (provider, provider_product_id, provider_offer_id) do update
set internal_product_code = excluded.internal_product_code,
    access_days = excluded.access_days,
    active = excluded.active,
    updated_at = now();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists commerce_products_set_updated_at on public.commerce_products;
create trigger commerce_products_set_updated_at
before update on public.commerce_products
for each row execute function private.set_updated_at();

drop trigger if exists purchases_set_updated_at on public.purchases;
create trigger purchases_set_updated_at
before update on public.purchases
for each row execute function private.set_updated_at();

drop trigger if exists entitlement_grants_set_updated_at on public.entitlement_grants;
create trigger entitlement_grants_set_updated_at
before update on public.entitlement_grants
for each row execute function private.set_updated_at();

drop trigger if exists email_outbox_set_updated_at on public.email_outbox;
create trigger email_outbox_set_updated_at
before update on public.email_outbox
for each row execute function private.set_updated_at();

alter table public.commerce_products enable row level security;
alter table public.purchases enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.entitlement_grants enable row level security;
alter table public.email_outbox enable row level security;

revoke all on table public.commerce_products from public, anon, authenticated;
revoke all on table public.purchases from public, anon, authenticated;
revoke all on table public.payment_webhook_events from public, anon, authenticated;
revoke all on table public.entitlement_grants from public, anon, authenticated;
revoke all on table public.email_outbox from public, anon, authenticated;

-- Serviço interno da Edge Function: não concede execução a clientes anônimos
-- ou autenticados; o service_role usa o RPC com RLS bypass.
create or replace function public.lookup_cakto_user_id(p_email text)
returns uuid
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;
$$;
revoke all on function public.lookup_cakto_user_id(text) from public, anon, authenticated;
grant execute on function public.lookup_cakto_user_id(text) to service_role;

create or replace function public.process_cakto_webhook_event(
  p_event_key text,
  p_event_type text,
  p_provider_order_id text,
  p_provider_ref_id text,
  p_product_id text,
  p_offer_id text,
  p_payload_hash text,
  p_customer_email text default null,
  p_customer_name text default null,
  p_user_id uuid default null,
  p_paid_at timestamptz default null,
  p_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_event_id uuid;
  v_mapping public.commerce_products%rowtype;
  v_purchase public.purchases%rowtype;
  v_grant public.entitlement_grants%rowtype;
  v_current public.entitlements%rowtype;
  v_base timestamptz;
  v_expires timestamptz;
  v_status text;
  v_valid_grants integer;
  v_max_expires timestamptz;
  v_min_starts timestamptz;
  v_order_found boolean := false;
begin
  if p_event_type not in ('purchase_approved', 'refund', 'chargeback') then
    raise exception using errcode = '22023', message = 'invalid_event_type';
  end if;

  -- A unique event key makes retries safe before any business mutation.
  insert into public.payment_webhook_events (
    provider, event_key, event_type, provider_order_id, provider_ref_id,
    product_id, offer_id, payload_hash, processing_status
  ) values (
    'cakto', p_event_key, p_event_type, p_provider_order_id, p_provider_ref_id,
    p_product_id, p_offer_id, p_payload_hash, 'processed'
  ) on conflict (event_key) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select * into v_mapping
  from public.commerce_products
  where provider = 'cakto'
    and provider_product_id = p_product_id
    and provider_offer_id = p_offer_id
    and active;

  if not found then
    update public.payment_webhook_events
    set processing_status = 'ignored', error_code = 'unknown_product', processed_at = now()
    where id = v_event_id;
    return jsonb_build_object('status', 'ignored', 'reason', 'unknown_product');
  end if;

  if p_event_type = 'purchase_approved' then
    -- A terminal signal wins even when it arrived before the approval.
    if exists (
      select 1 from public.payment_webhook_events
      where provider = 'cakto'
        and provider_order_id = p_provider_order_id
        and event_type in ('refund', 'chargeback')
    ) then
      update public.payment_webhook_events
      set processing_status = 'ignored', error_code = 'terminal_order', processed_at = now()
      where id = v_event_id;
      return jsonb_build_object('status', 'ignored', 'reason', 'terminal_order');
    end if;

    if p_user_id is null or p_customer_email is null or p_paid_at is null then
      raise exception using errcode = '22023', message = 'missing_purchase_identity';
    end if;

    select * into v_purchase
    from public.purchases
    where provider = 'cakto' and provider_order_id = p_provider_order_id
    for update;

    if found then
      update public.payment_webhook_events
      set processing_status = 'ignored', error_code = 'order_already_recorded', processed_at = now()
      where id = v_event_id;
      return jsonb_build_object('status', 'ignored', 'reason', 'order_already_recorded');
    end if;

    insert into public.purchases (
      provider, provider_order_id, provider_ref_id, product_id, offer_id,
      commerce_product_id, user_id, buyer_email, buyer_name, status, amount, paid_at
    ) values (
      'cakto', p_provider_order_id, p_provider_ref_id, p_product_id, p_offer_id,
      v_mapping.id, p_user_id, lower(trim(p_customer_email)), nullif(trim(p_customer_name), ''),
      'paid', p_amount, p_paid_at
    ) returning * into v_purchase;

    -- Serialize extensions for the same user/product. Without this lock,
    -- concurrent purchases could both read the same expiration and lose a
    -- 365-day extension.
    perform pg_advisory_xact_lock(
      hashtextextended(v_mapping.internal_product_code || ':' || p_user_id::text, 0)
    );

    select * into v_current
    from public.entitlements
    where user_id = p_user_id
      and product_code = v_mapping.internal_product_code
      and status = 'active'
    for update;

    v_base := greatest(coalesce(v_current.expires_at, p_paid_at), p_paid_at);
    v_expires := v_base + make_interval(days => v_mapping.access_days);

    insert into public.entitlement_grants (
      user_id, product_code, purchase_id, starts_at, expires_at, status
    ) values (
      p_user_id, v_mapping.internal_product_code, v_purchase.id, p_paid_at, v_expires, 'active'
    ) returning * into v_grant;

    insert into public.entitlements (user_id, product_code, status, starts_at, expires_at)
    values (p_user_id, v_mapping.internal_product_code, 'active', p_paid_at, v_expires)
    on conflict (user_id, product_code) do update
    set status = 'active',
        starts_at = least(public.entitlements.starts_at, excluded.starts_at),
        expires_at = greatest(public.entitlements.expires_at, excluded.expires_at),
        updated_at = now();

    update public.profiles
    set name = coalesce(nullif(trim(p_customer_name), ''), name)
    where user_id = p_user_id and (name is null or name = '');

    insert into public.email_outbox (
      idempotency_key, template_key, recipient_email, recipient_name, user_id, payload
    ) values (
      'access_granted:' || v_purchase.id::text,
      'access_granted',
      lower(trim(p_customer_email)),
      nullif(trim(p_customer_name), ''),
      p_user_id,
      jsonb_build_object(
        'product_code', v_mapping.internal_product_code,
        'expires_at', v_expires,
        'access_days', v_mapping.access_days
      )
    ) on conflict (idempotency_key) do nothing;

    update public.payment_webhook_events
    set processed_at = now()
    where id = v_event_id;
    return jsonb_build_object('status', 'processed', 'purchase_id', v_purchase.id, 'grant_id', v_grant.id);
  end if;

  -- Refund/chargeback is terminal for the provider order, and only its grant
  -- is revoked; other valid purchases remain effective.
  v_status := case when p_event_type = 'refund' then 'refunded' else 'chargedback' end;
  update public.purchases
  set status = v_status
  where provider = 'cakto'
    and provider_order_id = p_provider_order_id
  returning * into v_purchase;

  if found then
    v_order_found := true;
    update public.entitlement_grants
    set status = 'revoked'
    where purchase_id = v_purchase.id and status = 'active';

    select count(*), max(expires_at), min(starts_at)
    into v_valid_grants, v_max_expires, v_min_starts
    from public.entitlement_grants
    where user_id = v_purchase.user_id
      and product_code = v_mapping.internal_product_code
      and status = 'active'
      and expires_at > now();

    if v_valid_grants > 0 then
      update public.entitlements
      set status = 'active', starts_at = v_min_starts, expires_at = v_max_expires, updated_at = now()
      where user_id = v_purchase.user_id and product_code = v_mapping.internal_product_code;
    else
      update public.entitlements
      set status = 'revoked', updated_at = now()
      where user_id = v_purchase.user_id and product_code = v_mapping.internal_product_code;
    end if;
  end if;

  update public.payment_webhook_events
  set processed_at = now(),
      processing_status = case when v_order_found then 'processed' else 'ignored' end,
      error_code = case when v_order_found then null else 'order_not_found' end
  where id = v_event_id;
  return jsonb_build_object('status', case when v_order_found then 'processed' else 'ignored' end);
end;
$$;
revoke all on function public.process_cakto_webhook_event(
  text, text, text, text, text, text, text, text, text, uuid, timestamptz, numeric
) from public, anon, authenticated;
grant execute on function public.process_cakto_webhook_event(
  text, text, text, text, text, text, text, text, text, uuid, timestamptz, numeric
) to service_role;

comment on table public.commerce_products is 'Fase 1: mapping de ofertas externas para produtos internos.';
comment on table public.purchases is 'Fase 1: compra Cakto sanitizada, sem payload bruto.';
comment on table public.payment_webhook_events is 'Fase 1: auditoria/idempotência de eventos Cakto.';
comment on table public.entitlement_grants is 'Fase 1: concessões por compra; entitlements é a projeção atual.';
comment on table public.email_outbox is 'Fase 1: outbox transacional para email access_granted.';
