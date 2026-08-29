-- Agenda 80/20 — Fase 1: claim atômico para o worker de email.
-- O worker nunca recebe acesso ao banco diretamente; estas funções só são
-- executáveis pelo service_role usado nas Edge Functions.

alter table public.email_outbox
  add column if not exists processing_token uuid;

create or replace function public.claim_email_outbox(p_limit integer default 10)
returns table (
  id uuid,
  idempotency_key text,
  template_key text,
  recipient_email text,
  recipient_name text,
  user_id uuid,
  payload jsonb,
  attempts integer,
  processing_token uuid
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  with candidates as (
    select eo.id
    from public.email_outbox eo
    where (
      eo.status in ('pending', 'failed')
      and eo.available_at <= pg_catalog.now()
    )
    or (
      eo.status = 'processing'
      and eo.updated_at < pg_catalog.now() - pg_catalog.make_interval(mins => 15)
    )
    order by eo.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  ), claimed as (
    update public.email_outbox eo
    set status = 'processing',
        attempts = eo.attempts + 1,
        processing_token = gen_random_uuid(),
        updated_at = pg_catalog.now()
    from candidates c
    where eo.id = c.id
    returning eo.*
  )
  select c.id, c.idempotency_key, c.template_key, c.recipient_email,
         c.recipient_name, c.user_id, c.payload, c.attempts,
         c.processing_token
  from claimed c;
$$;

create or replace function public.mark_email_outbox_sent(
  p_id uuid,
  p_processing_token uuid
)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
as $$
  with updated as (
    update public.email_outbox
    set status = 'sent', sent_at = pg_catalog.now(), last_error = null,
        processing_token = null, updated_at = pg_catalog.now()
    where id = p_id and status = 'processing'
      and processing_token = p_processing_token
    returning 1
  )
  select exists(select 1 from updated);
$$;

create or replace function public.mark_email_outbox_failed(
  p_id uuid,
  p_processing_token uuid,
  p_error_code text,
  p_retryable boolean default true
)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
as $$
  with updated as (
    update public.email_outbox
    set status = 'failed',
        last_error = left(coalesce(nullif(p_error_code, ''), 'email_delivery_failed'), 200),
        available_at = pg_catalog.now() + case
          when p_retryable then pg_catalog.make_interval(secs => least(3600, 30 * (2 ^ least(attempts - 1, 7))))
          else pg_catalog.make_interval(days => 7)
        end,
        processing_token = null,
        updated_at = pg_catalog.now()
    where id = p_id and status = 'processing'
      and processing_token = p_processing_token
    returning 1
  )
  select exists(select 1 from updated);
$$;

revoke all on function public.claim_email_outbox(integer) from public, anon, authenticated;
revoke all on function public.mark_email_outbox_sent(uuid, uuid) from public, anon, authenticated;
revoke all on function public.mark_email_outbox_failed(uuid, uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.claim_email_outbox(integer) to service_role;
grant execute on function public.mark_email_outbox_sent(uuid, uuid) to service_role;
grant execute on function public.mark_email_outbox_failed(uuid, uuid, text, boolean) to service_role;

comment on function public.claim_email_outbox(integer) is 'Claim atômico FOR UPDATE SKIP LOCKED para o worker transacional.';
