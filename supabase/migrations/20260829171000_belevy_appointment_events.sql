-- Fase 12: eventos mínimos do Belevy consumidos pelo Agenda.
-- Não armazena nome, telefone, e-mail, cliente, tenant ou valores.

create table if not exists public.belevy_appointment_events (
  event_id text primary key check (length(trim(event_id)) between 1 and 160),
  event_type text not null check (event_type in ('created', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled')),
  appointment_id text not null check (length(trim(appointment_id)) between 1 and 160),
  service_name text not null check (length(trim(service_name)) between 1 and 160),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null check (length(trim(status)) between 1 and 48),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists belevy_appointment_events_appointment_idx
  on public.belevy_appointment_events(appointment_id, occurred_at desc);

alter table public.belevy_appointment_events enable row level security;
revoke all on table public.belevy_appointment_events from public, anon, authenticated;

create or replace function public.record_belevy_appointment_event(
  p_event_id text,
  p_event_type text,
  p_appointment_id text,
  p_service_name text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_status text,
  p_occurred_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_rows integer;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'service_role_required';
  end if;
  if p_event_id is null or length(trim(p_event_id)) = 0 or length(trim(p_event_id)) > 160
     or p_event_type not in ('created', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled')
     or p_appointment_id is null or length(trim(p_appointment_id)) = 0 or length(trim(p_appointment_id)) > 160
     or p_service_name is null or length(trim(p_service_name)) = 0 or length(trim(p_service_name)) > 160
     or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at
     or p_status is null or length(trim(p_status)) = 0 or length(trim(p_status)) > 48 then
    raise exception using errcode = '22023', message = 'invalid_belevy_event';
  end if;

  insert into public.belevy_appointment_events(event_id, event_type, appointment_id, service_name, starts_at, ends_at, status, occurred_at)
  values (trim(p_event_id), p_event_type, trim(p_appointment_id), trim(p_service_name), p_starts_at, p_ends_at, trim(p_status), coalesce(p_occurred_at, now()))
  on conflict (event_id) do nothing;
  get diagnostics v_rows = row_count;

  return jsonb_build_object('ok', true, 'duplicate', v_rows = 0);
end;
$$;

revoke all on function public.record_belevy_appointment_event(text, text, text, text, timestamptz, timestamptz, text, timestamptz) from public, anon, authenticated;
grant execute on function public.record_belevy_appointment_event(text, text, text, text, timestamptz, timestamptz, text, timestamptz) to service_role;
