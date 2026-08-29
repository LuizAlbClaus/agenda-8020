-- Agenda 80/20 — Fase 10: catálogo, disponibilidade e agendamentos.
-- Additive-first: o Growth Coach legado continua funcionando em paralelo.

create extension if not exists btree_gist;

do $$ begin
  create type public.appointment_status as enum ('held','confirmed','cancelled','completed','no_show');
exception when duplicate_object then null; end $$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','manager','provider')),
  created_at timestamptz not null default now(),
  primary key(workspace_id,user_id)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  niche_code text not null default 'beauty',
  name text not null,
  description text,
  duration_minutes integer not null default 60 check(duration_minutes between 5 and 480),
  buffer_minutes integer not null default 0 check(buffer_minutes between 0 and 120),
  price_minor integer check(price_minor is null or price_minor >= 0),
  currency text not null default 'BRL',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_providers (
  service_id uuid not null references public.services(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  primary key(service_id,provider_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  display_name text not null,
  contact text,
  consent_status text not null default 'provided' check(consent_status in ('provided','withdrawn','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  weekday smallint not null check(weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  effective_from date,
  effective_until date,
  active boolean not null default true,
  check(ends_at > starts_at),
  check(effective_until is null or effective_from is null or effective_until >= effective_from)
);

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  kind text not null check(kind in ('blocked','extra')),
  reason text,
  check(ends_at > starts_at)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  provider_id uuid not null references public.providers(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  source text not null default 'public_booking' check(source in ('public_booking','manual','imported')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(ends_at > starts_at)
);

create table if not exists public.appointment_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  event_type text not null check(event_type in ('created','held','confirmed','cancelled','completed','no_show','rescheduled')),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists workspaces_owner_unique on public.workspaces(owner_user_id);
create unique index if not exists providers_workspace_user_unique on public.providers(workspace_id,user_id) where user_id is not null;
create unique index if not exists services_workspace_name_unique on public.services(workspace_id,name);
create index if not exists appointments_workspace_start_idx on public.appointments(workspace_id,starts_at);
create index if not exists appointments_provider_start_idx on public.appointments(provider_id,starts_at);
create index if not exists services_workspace_active_idx on public.services(workspace_id,active);
create index if not exists availability_rules_provider_weekday_idx on public.availability_rules(provider_id,weekday,active);
create index if not exists appointment_events_appointment_idx on public.appointment_events(appointment_id,created_at);

alter table public.appointments drop constraint if exists appointments_provider_no_overlap;
alter table public.appointments add constraint appointments_provider_no_overlap exclude using gist (
  provider_id with =, tstzrange(starts_at,ends_at,'[)') with &&
) where (status in ('held','confirmed'));

create or replace function private.workspace_access(p_workspace_id uuid,p_user_id uuid default auth.uid()) returns boolean
language sql stable security definer set search_path=pg_catalog,public as $$
  select exists(select 1 from public.workspace_members wm where wm.workspace_id=p_workspace_id and wm.user_id=p_user_id)
$$;
revoke all on function private.workspace_access(uuid,uuid) from public,anon,authenticated;

create or replace function private.ensure_workspace_for_profile() returns trigger
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_workspace uuid; v_provider uuid; v_service uuid; v_slug text; v_service_name text;
begin
  v_slug:='agenda-'||replace(new.user_id::text,'-','');
  v_service_name:=coalesce(nullif(trim(new.service_name),''),'Meu serviço');
  insert into public.workspaces(owner_user_id,name,slug,locale,timezone) values(new.user_id,'Agenda de '||v_service_name,v_slug,'pt-BR','America/Sao_Paulo')
    on conflict(owner_user_id) do update set name=excluded.name,updated_at=now() returning id into v_workspace;
  insert into public.workspace_members(workspace_id,user_id,role) values(v_workspace,new.user_id,'owner') on conflict do nothing;
  insert into public.providers(workspace_id,user_id,display_name) values(v_workspace,new.user_id,coalesce((select p.name from public.profiles p where p.user_id=new.user_id),'Profissional'))
    on conflict do nothing;
  select id into v_provider from public.providers where workspace_id=v_workspace and user_id=new.user_id order by created_at limit 1;
  select id into v_service from public.services where workspace_id=v_workspace order by created_at limit 1;
  if not found then
    insert into public.services(workspace_id,niche_code,name) values(v_workspace,new.service_niche,v_service_name) returning id into v_service;
  else
    update public.services set niche_code=new.service_niche,name=v_service_name,updated_at=now() where id=v_service;
  end if;
  insert into public.service_providers(service_id,provider_id) values(v_service,v_provider) on conflict do nothing;
  insert into public.availability_rules(provider_id,weekday,starts_at,ends_at) select v_provider,x,'09:00','18:00' from generate_series(1,6) x where not exists(select 1 from public.availability_rules ar where ar.provider_id=v_provider);
  return new;
end; $$;
revoke all on function private.ensure_workspace_for_profile() from public,anon,authenticated;
drop trigger if exists business_profile_workspace on public.business_profiles;
create trigger business_profile_workspace after insert or update of service_niche,service_name on public.business_profiles for each row execute function private.ensure_workspace_for_profile();
update public.business_profiles set service_niche=service_niche;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.providers enable row level security;
alter table public.services enable row level security;
alter table public.service_providers enable row level security;
alter table public.customers enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_events enable row level security;
revoke all on all tables in schema public from anon;
grant select on public.workspaces,public.services,public.service_providers to anon;

create policy workspaces_member_read on public.workspaces for select to authenticated using(private.workspace_access(id));
create policy workspace_members_member_read on public.workspace_members for select to authenticated using(private.workspace_access(workspace_id));
create policy providers_member_all on public.providers for all to authenticated using(private.workspace_access(workspace_id)) with check(private.workspace_access(workspace_id));
create policy services_member_all on public.services for all to authenticated using(private.workspace_access(workspace_id)) with check(private.workspace_access(workspace_id));
create policy service_providers_member_all on public.service_providers for all to authenticated using(exists(select 1 from public.services s where s.id=service_id and private.workspace_access(s.workspace_id))) with check(exists(select 1 from public.services s where s.id=service_id and private.workspace_access(s.workspace_id)));
create policy customers_member_all on public.customers for all to authenticated using(private.workspace_access(workspace_id)) with check(private.workspace_access(workspace_id));
create policy availability_rules_member_all on public.availability_rules for all to authenticated using(exists(select 1 from public.providers p where p.id=provider_id and private.workspace_access(p.workspace_id))) with check(exists(select 1 from public.providers p where p.id=provider_id and private.workspace_access(p.workspace_id)));
create policy availability_exceptions_member_all on public.availability_exceptions for all to authenticated using(exists(select 1 from public.providers p where p.id=provider_id and private.workspace_access(p.workspace_id))) with check(exists(select 1 from public.providers p where p.id=provider_id and private.workspace_access(p.workspace_id)));
create policy appointments_member_all on public.appointments for all to authenticated using(private.workspace_access(workspace_id)) with check(private.workspace_access(workspace_id));
create policy appointment_events_member_read on public.appointment_events for select to authenticated using(exists(select 1 from public.appointments a where a.id=appointment_id and private.workspace_access(a.workspace_id)));

create or replace function public.get_agenda_snapshot()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_workspace public.workspaces%rowtype; v_provider public.providers%rowtype;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  select w.* into v_workspace from public.workspaces w join public.workspace_members wm on wm.workspace_id=w.id where wm.user_id=v_user and w.active order by w.created_at limit 1;
  if not found then return jsonb_build_object('onboarding_required',true); end if;
  select p.* into v_provider from public.providers p where p.workspace_id=v_workspace.id and p.user_id=v_user and p.active order by p.created_at limit 1;
  return jsonb_build_object('onboarding_required',false,'workspace',jsonb_build_object('id',v_workspace.id,'name',v_workspace.name,'slug',v_workspace.slug,'timezone',v_workspace.timezone),'services',(select coalesce(jsonb_agg(to_jsonb(s)-'workspace_id' order by s.created_at),'[]') from public.services s where s.workspace_id=v_workspace.id and s.active),'appointments',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'service_name',s.name,'customer_name',c.display_name,'starts_at',a.starts_at,'ends_at',a.ends_at,'status',a.status) order by a.starts_at),'[]') from public.appointments a join public.services s on s.id=a.service_id join public.customers c on c.id=a.customer_id where a.workspace_id=v_workspace.id and a.starts_at>=now()-interval '1 day' and a.starts_at<now()+interval '30 days' and a.status not in ('cancelled','no_show')),'public_booking_url','/book/'||v_workspace.slug);
end; $$;
revoke all on function public.get_agenda_snapshot() from public,anon; grant execute on function public.get_agenda_snapshot() to authenticated;

create or replace function public.get_public_booking_context(p_slug text,p_from date default current_date,p_to date default current_date+14)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_workspace public.workspaces%rowtype;
begin
  select * into v_workspace from public.workspaces where slug=lower(trim(p_slug)) and active;
  if not found or p_to<p_from or p_to>p_from+31 then return jsonb_build_object('error','booking_unavailable'); end if;
  return jsonb_build_object('workspace',jsonb_build_object('name',v_workspace.name,'timezone',v_workspace.timezone,'slug',v_workspace.slug),'services',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'duration_minutes',s.duration_minutes,'description',s.description) order by s.created_at),'[]') from public.services s where s.workspace_id=v_workspace.id and s.active),'days',(select coalesce(jsonb_agg(jsonb_build_object('date',d::date,'slots',(select coalesce(jsonb_agg(jsonb_build_object('starts_at',slot_start,'ends_at',slot_start+(s.duration_minutes+s.buffer_minutes)*interval '1 minute') order by slot_start),'[]') from (select ((d::date+ar.starts_at)::timestamp at time zone v_workspace.timezone) + (n*interval '30 minutes') slot_start from public.availability_rules ar cross join lateral generate_series(0,40) n where ar.provider_id=p.id and ar.weekday=extract(dow from d)::int and ar.active and ((d::date+ar.starts_at)::timestamp at time zone v_workspace.timezone)+n*interval '30 minutes'+(s.duration_minutes+s.buffer_minutes)*interval '1 minute' <= ((d::date+ar.ends_at)::timestamp at time zone v_workspace.timezone) and not exists(select 1 from public.appointments a where a.provider_id=p.id and a.status in ('held','confirmed') and tstzrange(a.starts_at,a.ends_at,'[)') && tstzrange(((d::date+ar.starts_at)::timestamp at time zone v_workspace.timezone)+n*interval '30 minutes',((d::date+ar.starts_at)::timestamp at time zone v_workspace.timezone)+n*interval '30 minutes'+(s.duration_minutes+s.buffer_minutes)*interval '1 minute','[)')) slot_candidates where slot_start>now()) from generate_series(p_from,p_to,'1 day') d where exists(select 1 from public.availability_rules ar where ar.provider_id=p.id and ar.weekday=extract(dow from d)::int and ar.active) order by d),'[]') from public.providers p join public.services s on s.workspace_id=p.workspace_id where p.workspace_id=v_workspace.id and p.active order by p.created_at limit 1));
end; $$;
revoke all on function public.get_public_booking_context(text,date,date) from public; grant execute on function public.get_public_booking_context(text,date,date) to anon,authenticated;

create or replace function public.create_public_booking(p_slug text,p_service_id uuid,p_starts_at timestamptz,p_customer_name text,p_customer_contact text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_workspace public.workspaces%rowtype; v_service public.services%rowtype; v_provider public.providers%rowtype; v_customer public.customers%rowtype; v_appointment public.appointments%rowtype; v_ends timestamptz;
begin
  select * into v_workspace from public.workspaces where slug=lower(trim(p_slug)) and active;
  select * into v_service from public.services where id=p_service_id and workspace_id=v_workspace.id and active;
  if not found or p_customer_name is null or length(trim(p_customer_name))<2 or length(trim(p_customer_name))>120 then raise exception using errcode='22023',message='invalid_booking'; end if;
  select p.* into v_provider from public.providers p join public.service_providers sp on sp.provider_id=p.id where sp.service_id=v_service.id and p.active order by p.created_at limit 1;
  v_ends:=p_starts_at+(v_service.duration_minutes+v_service.buffer_minutes)*interval '1 minute';
  if not exists(select 1 from public.availability_rules ar where ar.provider_id=v_provider.id and ar.weekday=extract(dow from p_starts_at at time zone v_workspace.timezone)::int and ar.active and (p_starts_at at time zone v_workspace.timezone)::time>=ar.starts_at and (v_ends at time zone v_workspace.timezone)::time<=ar.ends_at) then raise exception using errcode='22023',message='slot_unavailable'; end if;
  insert into public.customers(workspace_id,display_name,contact) values(v_workspace.id,trim(p_customer_name),nullif(trim(p_customer_contact),'')) returning * into v_customer;
  insert into public.appointments(workspace_id,service_id,provider_id,customer_id,starts_at,ends_at,status,source) values(v_workspace.id,v_service.id,v_provider.id,v_customer.id,p_starts_at,v_ends,'confirmed','public_booking') returning * into v_appointment;
  insert into public.appointment_events(appointment_id,event_type,payload) values(v_appointment.id,'created',jsonb_build_object('source','public_booking'));
  return jsonb_build_object('ok',true,'appointment_id',v_appointment.id,'service_name',v_service.name,'starts_at',v_appointment.starts_at,'ends_at',v_appointment.ends_at);
exception when exclusion_violation then raise exception using errcode='23P01',message='slot_unavailable';
end; $$;
revoke all on function public.create_public_booking(text,uuid,timestamptz,text,text) from public; grant execute on function public.create_public_booking(text,uuid,timestamptz,text,text) to anon,authenticated;
