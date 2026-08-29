-- Fase 12: vínculo operacional opcional com o Belevy.
-- O Agenda continua sendo utilizável sozinho; esta tabela apenas registra
-- quando o link público oficial pode ser encaminhado para o Belevy.

create table if not exists public.belevy_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  belevy_slug text not null check (length(trim(belevy_slug)) between 1 and 160),
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked')),
  expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.belevy_connections enable row level security;
revoke all on table public.belevy_connections from public, anon, authenticated;
drop policy if exists belevy_connections_owner_read on public.belevy_connections;
create policy belevy_connections_owner_read on public.belevy_connections
  for select to authenticated using (user_id = auth.uid());

create or replace function public.save_belevy_connection(
  p_slug text,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_slug text := nullif(trim(coalesce(p_slug, '')), '');
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if v_slug is null or length(v_slug) > 160 or (p_expires_at is not null and p_expires_at <= now()) then
    raise exception using errcode = '22023', message = 'invalid_belevy_connection';
  end if;

  insert into public.belevy_connections(user_id, belevy_slug, status, expires_at, connected_at, last_synced_at, updated_at)
  values (v_user, v_slug, 'connected', p_expires_at, now(), now(), now())
  on conflict (user_id) do update set
    belevy_slug = excluded.belevy_slug,
    status = 'connected',
    expires_at = excluded.expires_at,
    last_synced_at = now(),
    updated_at = now();

  return jsonb_build_object('ok', true, 'status', 'connected', 'slug', v_slug, 'expires_at', p_expires_at);
end;
$$;

revoke all on function public.save_belevy_connection(text, timestamptz) from public, anon;
grant execute on function public.save_belevy_connection(text, timestamptz) to authenticated;

create or replace function public.get_belevy_connection()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_connection public.belevy_connections%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select * into v_connection
    from public.belevy_connections
   where user_id = auth.uid();

  if not found then
    return jsonb_build_object('status', 'not_connected');
  end if;

  if v_connection.status <> 'connected' or (v_connection.expires_at is not null and v_connection.expires_at <= now()) then
    return jsonb_build_object('status', 'expired', 'expires_at', v_connection.expires_at);
  end if;

  return jsonb_build_object(
    'status', 'connected',
    'slug', v_connection.belevy_slug,
    'expires_at', v_connection.expires_at,
    'last_synced_at', v_connection.last_synced_at
  );
end;
$$;

revoke all on function public.get_belevy_connection() from public, anon;
grant execute on function public.get_belevy_connection() to authenticated;

-- This is the only anonymous lookup needed for the public booking route.
-- It exposes a Belevy slug only when the owner has a live connection.
create or replace function public.get_belevy_booking_redirect(p_agenda_slug text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_connection public.belevy_connections%rowtype;
begin
  select bc.* into v_connection
    from public.workspaces w
    join public.belevy_connections bc on bc.user_id = w.owner_user_id
   where w.slug = lower(trim(coalesce(p_agenda_slug, '')))
     and w.active
     and bc.status = 'connected'
     and (bc.expires_at is null or bc.expires_at > now())
   limit 1;

  if not found then
    return jsonb_build_object('status', 'local');
  end if;

  return jsonb_build_object('status', 'connected', 'slug', v_connection.belevy_slug);
end;
$$;

revoke all on function public.get_belevy_booking_redirect(text) from public, authenticated;
grant execute on function public.get_belevy_booking_redirect(text) to anon, authenticated;
