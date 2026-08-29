-- Agenda 80/20 — Fase 0 (spec sections 78–80, 99–100, 108–110).
-- This migration is local-only and intentionally excludes commerce/purchases/grants.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

do $$
begin
  create type public.app_role as enum ('user', 'content_editor', 'support', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.entitlement_status as enum ('active', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.entitlements (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_code text not null,
  status public.entitlement_status not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, product_code)
);

comment on table public.profiles is 'Fase 0 / spec 79: perfil mínimo associado a auth.users.';
comment on table public.user_roles is 'Fase 0 / spec 80: papéis administrativos/editoriais; sem acesso direto do cliente.';
comment on table public.entitlements is 'Fase 0 / spec 100: fonte de verdade do acesso atual; commerce/grants entram na Fase 1.';

create index if not exists entitlements_access_lookup_idx
  on public.entitlements (user_id, product_code, expires_at)
  where status = 'active';
create index if not exists user_roles_role_lookup_idx
  on public.user_roles (role, user_id);

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

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at
before update on public.entitlements
for each row execute function private.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.entitlements enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.user_roles from public, anon, authenticated;
revoke all on table public.entitlements from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.entitlements to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own on public.entitlements
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Spec 110: only the currently authenticated user can ask about their own access.
create or replace function public.can_access_agenda(user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    user_id = auth.uid()
    and auth.uid() is not null
    and exists (
      select 1
      from public.entitlements e
      where e.user_id = auth.uid()
        and e.product_code = 'agenda_8020'
        and e.status = 'active'
        and e.expires_at > now()
    );
$$;
revoke all on function public.can_access_agenda(uuid) from public, anon;
grant execute on function public.can_access_agenda(uuid) to authenticated;
