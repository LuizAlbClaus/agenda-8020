-- Agenda 80/20 — Fase 2: Core Experience.
-- Conteúdo editorial é versionado; recomendações são snapshots históricos.

do $$ begin
  create type public.user_stage as enum ('starting', 'some_clients', 'irregular_schedule');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.bottleneck as enum ('first_clients', 'low_visibility', 'low_conversion', 'empty_slots', 'low_return');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.action_type as enum ('foundation', 'acquisition');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.action_version_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.recommendation_status as enum ('presented', 'opened', 'started', 'completed', 'swapped', 'expired', 'not_completed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.swap_reason as enum ('no_time', 'no_opportunity', 'recently_done', 'not_for_my_moment', 'did_not_understand', 'do_not_want');
exception when duplicate_object then null; end $$;

create table if not exists public.business_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profession text not null default 'nail_design',
  stage public.user_stage not null,
  current_bottleneck public.bottleneck not null,
  channels text[] not null default '{}',
  daily_available_minutes integer not null check (daily_available_minutes in (10, 20, 30, 45)),
  can_serve_next_7_days boolean not null,
  has_real_portfolio boolean not null,
  has_booking_path boolean not null,
  onboarding_completed_at timestamptz,
  next_checkin_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (channels <@ array['instagram','whatsapp','existing_clients','local_network','partnerships','none']::text[]),
  check (not ('none' = any(channels)) or cardinality(channels) = 1)
);

create table if not exists public.context_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage public.user_stage not null,
  bottleneck public.bottleneck not null,
  channels text[] not null default '{}',
  daily_available_minutes integer not null check (daily_available_minutes in (10, 20, 30, 45)),
  can_serve_next_7_days boolean not null,
  has_real_portfolio boolean not null,
  has_booking_path boolean not null,
  trigger text not null check (trigger in ('onboarding', 'fortnight', 'manual', 'engine')),
  created_at timestamptz not null default now(),
  check (channels <@ array['instagram','whatsapp','existing_clients','local_network','partnerships','none']::text[]),
  check (not ('none' = any(channels)) or cardinality(channels) = 1)
);

create table if not exists public.action_protocols (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  action_type public.action_type not null,
  category text not null,
  measurement_class text not null check (measurement_class in ('foundation','direct_outreach','broadcast','return','referral','partnership')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.action_versions (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.action_protocols (id) on delete restrict,
  version_number integer not null check (version_number > 0),
  status public.action_version_status not null default 'draft',
  title text not null,
  short_description text not null,
  why_now_template text not null,
  when_to_use text not null,
  when_not_to_use text not null,
  steps jsonb not null,
  eligible_professions text[] not null default '{nail_design}',
  eligible_stages public.user_stage[] not null default '{}',
  eligible_bottlenecks public.bottleneck[] not null default '{}',
  required_channels text[] not null default '{}',
  requirements jsonb not null default '{}'::jsonb,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 120),
  difficulty text not null default 'simple' check (difficulty in ('simple','moderate')),
  exposure_mode text not null default 'none' check (exposure_mode in ('none','direct','broadcast','return','referral','partnership')),
  max_exposure integer check (max_exposure is null or max_exposure > 0),
  cooldown_hours integer not null default 0 check (cooldown_hours >= 0),
  maturation_hours integer not null default 0 check (maturation_hours >= 0),
  finalization_hours integer not null default 0 check (finalization_hours >= maturation_hours),
  editorial_prior numeric(4,3) not null check (editorial_prior between 0 and 1),
  ethical_guardrail text not null,
  message_template text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (protocol_id, version_number),
  check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 3),
  check (required_channels <@ array['instagram','whatsapp','existing_clients','local_network','partnerships','none']::text[])
);

create table if not exists public.recommendation_policy_versions (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique check (version > 0),
  status text not null check (status in ('draft','active','retired')),
  params jsonb not null check (jsonb_typeof(params) = 'object'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_version_id uuid not null references public.action_versions (id) on delete restrict,
  context_checkin_id uuid not null references public.context_checkins (id) on delete restrict,
  policy_version_id uuid not null references public.recommendation_policy_versions (id) on delete restrict,
  recommendation_date date not null default current_date,
  sequence_number integer not null check (sequence_number > 0),
  status public.recommendation_status not null default 'presented',
  score numeric(8,3) not null,
  score_components jsonb not null default '{}'::jsonb,
  why_now_rendered text not null,
  exploration boolean not null default false,
  random_seed bigint,
  presented_at timestamptz not null default now(),
  opened_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists recommendations_one_current_per_user_idx
  on public.recommendations (user_id)
  where status in ('presented','opened','started');
create index if not exists recommendations_user_created_idx
  on public.recommendations (user_id, created_at desc);
create index if not exists recommendations_action_version_idx
  on public.recommendations (action_version_id, user_id, created_at desc);

create table if not exists public.action_swaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recommendation_id uuid not null references public.recommendations (id) on delete restrict,
  reason public.swap_reason not null,
  replacement_recommendation_id uuid references public.recommendations (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists action_swaps_user_created_idx on public.action_swaps (user_id, created_at desc);

create table if not exists public.user_action_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  protocol_id uuid not null references public.action_protocols (id) on delete cascade,
  block_until timestamptz,
  weight_adjustment numeric(6,2) not null default 0,
  last_reason public.swap_reason,
  recent_swap_count integer not null default 0 check (recent_swap_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, protocol_id)
);

create index if not exists action_versions_published_idx
  on public.action_versions (status, protocol_id);
create index if not exists context_checkins_user_created_idx
  on public.context_checkins (user_id, created_at desc);

create or replace function private.prevent_published_action_mutation()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if old.status = 'published' and new is distinct from old then
    raise exception using errcode = '42501', message = 'published_action_version_immutable';
  end if;
  return new;
end;
$$;
revoke all on function private.prevent_published_action_mutation() from public, anon, authenticated;
drop trigger if exists action_versions_immutable on public.action_versions;
create trigger action_versions_immutable before update on public.action_versions
for each row execute function private.prevent_published_action_mutation();

drop trigger if exists business_profiles_set_updated_at on public.business_profiles;
create trigger business_profiles_set_updated_at before update on public.business_profiles
for each row execute function private.set_updated_at();
drop trigger if exists user_action_preferences_set_updated_at on public.user_action_preferences;
create trigger user_action_preferences_set_updated_at before update on public.user_action_preferences
for each row execute function private.set_updated_at();

alter table public.business_profiles enable row level security;
alter table public.context_checkins enable row level security;
alter table public.action_protocols enable row level security;
alter table public.action_versions enable row level security;
alter table public.recommendation_policy_versions enable row level security;
alter table public.recommendations enable row level security;
alter table public.action_swaps enable row level security;
alter table public.user_action_preferences enable row level security;

revoke all on table public.business_profiles, public.context_checkins, public.action_protocols,
  public.action_versions, public.recommendation_policy_versions, public.recommendations,
  public.action_swaps, public.user_action_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.business_profiles to authenticated;
grant select on table public.context_checkins, public.recommendations, public.action_swaps, public.user_action_preferences to authenticated;
grant select on table public.action_protocols, public.action_versions to authenticated;

create policy business_profiles_owner on public.business_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy context_checkins_owner on public.context_checkins for select to authenticated
  using ((select auth.uid()) = user_id);
create policy action_protocols_published_read on public.action_protocols for select to authenticated
  using (active and exists (select 1 from public.action_versions av where av.protocol_id = id and av.status = 'published'));
create policy action_versions_published_read on public.action_versions for select to authenticated
  using (status = 'published');
create policy policy_versions_active_read on public.recommendation_policy_versions for select to authenticated
  using (status = 'active');
create policy recommendations_owner_read on public.recommendations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy action_swaps_owner_read on public.action_swaps for select to authenticated
  using ((select auth.uid()) = user_id);
create policy action_preferences_owner_read on public.user_action_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

-- The client can only use these controlled operations, never arbitrary writes.
revoke all on function private.prevent_published_action_mutation() from public, anon, authenticated;

create or replace function public.save_onboarding(
  p_name text, p_profession text, p_stage public.user_stage, p_bottleneck public.bottleneck,
  p_channels text[], p_daily_available_minutes integer, p_can_serve_next_7_days boolean,
  p_has_real_portfolio boolean, p_has_booking_path boolean
) returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid := auth.uid(); v_checkin public.context_checkins%rowtype;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  if p_profession is null or length(trim(p_profession)) = 0 or length(trim(p_profession)) > 64 then raise exception using errcode='22023', message='invalid_profession'; end if;
  if p_channels is null or cardinality(p_channels) = 0 or not (p_channels <@ array['instagram','whatsapp','existing_clients','local_network','partnerships','none']::text[]) then
    raise exception using errcode='22023', message='invalid_channels';
  end if;
  if 'none' = any(p_channels) and cardinality(p_channels) <> 1 then raise exception using errcode='22023', message='invalid_channels'; end if;
  update public.recommendations set status='expired', expired_at=now()
  where user_id=v_user and status in ('presented','opened','started');
  insert into public.profiles (user_id, name) values (v_user, nullif(left(trim(p_name),120), ''))
    on conflict (user_id) do update set name = coalesce(nullif(left(trim(p_name),120),''), public.profiles.name);
  insert into public.business_profiles (user_id, profession, stage, current_bottleneck, channels,
    daily_available_minutes, can_serve_next_7_days, has_real_portfolio, has_booking_path,
    onboarding_completed_at, next_checkin_at)
  values (v_user, p_profession, p_stage, p_bottleneck, p_channels, p_daily_available_minutes,
    p_can_serve_next_7_days, p_has_real_portfolio, p_has_booking_path, now(), now() + interval '14 days')
  on conflict (user_id) do update set profession=excluded.profession, stage=excluded.stage,
    current_bottleneck=excluded.current_bottleneck, channels=excluded.channels,
    daily_available_minutes=excluded.daily_available_minutes,
    can_serve_next_7_days=excluded.can_serve_next_7_days, has_real_portfolio=excluded.has_real_portfolio,
    has_booking_path=excluded.has_booking_path, onboarding_completed_at=now(),
    next_checkin_at=now() + interval '14 days', updated_at=now();
  insert into public.context_checkins (user_id, stage, bottleneck, channels, daily_available_minutes,
    can_serve_next_7_days, has_real_portfolio, has_booking_path, trigger)
  values (v_user, p_stage, p_bottleneck, p_channels, p_daily_available_minutes,
    p_can_serve_next_7_days, p_has_real_portfolio, p_has_booking_path, 'onboarding')
  returning * into v_checkin;
  return jsonb_build_object('ok', true, 'context_checkin_id', v_checkin.id);
end; $$;

create or replace function public.generate_next_recommendation()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid(); v_profile public.business_profiles%rowtype; v_context public.context_checkins%rowtype;
  v_policy public.recommendation_policy_versions%rowtype; v_current public.recommendations%rowtype;
  v_action public.action_versions%rowtype; v_protocol public.action_protocols%rowtype; v_rec public.recommendations%rowtype;
  v_score numeric; v_stage_fit numeric; v_channel_fit numeric; v_prior numeric; v_viability numeric;
  v_why text; v_sequence integer; v_is_foundation boolean; v_has_readiness_gap boolean;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then
    raise exception using errcode='42501', message='entitlement_required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 8020));
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('status','onboarding_required'); end if;
  select * into v_current from public.recommendations where user_id=v_user and status in ('presented','opened','started') order by created_at desc limit 1;
  if found then
    select av.* into v_action from public.action_versions av where av.id=v_current.action_version_id;
    return jsonb_build_object('status','existing','recommendation_id',v_current.id,'action_version_id',v_current.action_version_id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_current.why_now_rendered,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select action_type from public.action_protocols where id=v_action.protocol_id));
  end if;
  select * into v_context from public.context_checkins where user_id=v_user order by created_at desc limit 1;
  if not found then
    insert into public.context_checkins (user_id, stage, bottleneck, channels, daily_available_minutes,
      can_serve_next_7_days, has_real_portfolio, has_booking_path, trigger)
    values (v_user, v_profile.stage, v_profile.current_bottleneck, v_profile.channels, v_profile.daily_available_minutes,
      v_profile.can_serve_next_7_days, v_profile.has_real_portfolio, v_profile.has_booking_path, 'engine')
    returning * into v_context;
  end if;
  select * into v_policy from public.recommendation_policy_versions where status='active' order by version desc limit 1;
  if not found then raise exception using errcode='55000', message='recommendation_policy_missing'; end if;
  v_has_readiness_gap := not (v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path);
  v_is_foundation := v_has_readiness_gap;
  select av.* into v_action
  from public.action_versions av join public.action_protocols ap on ap.id=av.protocol_id
  where av.status='published' and ap.active and av.eligible_professions @> array[v_profile.profession]::text[]
    and (cardinality(av.eligible_stages)=0 or v_profile.stage=any(av.eligible_stages))
    and (cardinality(av.eligible_bottlenecks)=0 or v_profile.current_bottleneck=any(av.eligible_bottlenecks))
    and (cardinality(av.required_channels)=0 or (v_profile.channels && av.required_channels))
    and av.duration_minutes <= v_profile.daily_available_minutes
    and ((ap.action_type='foundation' and v_is_foundation) or (ap.action_type='acquisition' and not v_is_foundation))
    and (ap.action_type='foundation' or (v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path))
    and (coalesce((av.requirements->>'needs_can_serve_next_7_days')::boolean,false) = false or not v_profile.can_serve_next_7_days)
    and (coalesce((av.requirements->>'needs_has_real_portfolio')::boolean,false) = false or not v_profile.has_real_portfolio)
    and (coalesce((av.requirements->>'needs_has_booking_path')::boolean,false) = false or not v_profile.has_booking_path)
    -- Fase 2 does not collect opportunity signals; these actions remain seeded but hidden.
    and (coalesce((av.requirements->>'requires_context_signal')::boolean,false) = false)
    and not exists (select 1 from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id and uap.block_until>now())
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status <> 'expired' and rr.created_at > now() - make_interval(hours => av.cooldown_hours))
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status='swapped' and rr.created_at > now() - interval '1 day')
  order by
    (case when v_profile.stage=any(av.eligible_stages) then 20 else 0 end + case when v_profile.current_bottleneck=any(av.eligible_bottlenecks) then 15 else 0 end + case when ap.action_type='foundation' then 5 else 0 end + case when cardinality(av.required_channels)=0 or v_profile.channels && av.required_channels then 20 else 0 end + (av.editorial_prior*15) + 5 + coalesce((select uap.weight_adjustment from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id),0)) desc,
    av.id asc limit 1;
  if not found then return jsonb_build_object('status','no_eligible_action','message','Não conseguimos encontrar uma ação possível agora. Vamos ajustar seu plano.'); end if;
  v_stage_fit := case when v_profile.stage=any(v_action.eligible_stages) then 20 else 0 end + case when v_profile.current_bottleneck=any(v_action.eligible_bottlenecks) then 15 else 0 end;
  v_channel_fit := case when cardinality(v_action.required_channels)=0 or v_profile.channels && v_action.required_channels then 20 else 0 end;
  v_prior := v_action.editorial_prior*15; v_viability := 5; v_score := v_stage_fit+v_channel_fit+v_prior+v_viability;
  v_why := case when v_is_foundation then
    case when not v_profile.can_serve_next_7_days then 'Você ainda não confirmou disponibilidade para atender nos próximos 7 dias. Vamos preparar esse básico antes de buscar novas pessoas.'
      when not v_profile.has_real_portfolio then 'Você ainda não tem uma foto real pronta para mostrar. Vamos preparar essa prova antes de buscar novas pessoas.'
      when not v_profile.has_booking_path then 'Você ainda não deixou claro por onde alguém pode marcar. Vamos deixar esse caminho simples antes de buscar novas pessoas.'
      else 'Você contou como está hoje. Vamos preparar o básico para a próxima ação ficar possível.' end
    else case v_profile.current_bottleneck when 'first_clients' then 'Você está começando e precisa das primeiras clientes. Esta é uma ação simples para criar movimento.' when 'low_visibility' then 'Pouca gente conhece seu trabalho. Esta ação ajuda a colocar seu serviço diante de pessoas próximas.' when 'low_conversion' then 'Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale começar por uma conversa que já existe.' when 'empty_slots' then 'Você já atende, mas ainda ficam horários vazios. Esta ação ajuda a mostrar uma disponibilidade real.' when 'low_return' then 'Você quer fazer suas clientes voltarem mais. Esta ação retoma uma relação que já existe.' else 'Esta é a próxima ação mais simples para o seu momento.' end end;
  select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
  insert into public.recommendations (user_id, action_version_id, context_checkin_id, policy_version_id, sequence_number, score, score_components, why_now_rendered, exploration)
  values (v_user, v_action.id, v_context.id, v_policy.id, v_sequence, v_score, jsonb_build_object('fit',v_stage_fit,'channel',v_channel_fit,'prior',v_prior,'evidence',0,'viability',v_viability), v_why, false)
  returning * into v_rec;
  return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select action_type from public.action_protocols where id=v_action.protocol_id),'score',v_score);
end; $$;

create or replace function public.get_today_plan()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_plan jsonb;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('onboarding_required',true); end if;
  v_plan:=public.generate_next_recommendation();
  return jsonb_build_object('onboarding_required',false,'name',(select p.name from public.profiles p where p.user_id=v_user),'focus',case v_profile.current_bottleneck when 'first_clients' then 'Preparar o básico para conseguir suas primeiras clientes.' when 'low_visibility' then 'Fazer mais pessoas conhecerem seu trabalho.' when 'low_conversion' then 'Transformar mais conversas em horários.' when 'empty_slots' then 'Preencher horários que ainda estão vazios.' when 'low_return' then 'Fazer suas clientes voltarem mais.' end,'recommendation',v_plan);
end; $$;

create or replace function public.get_recommendation_detail(p_recommendation_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_rec public.recommendations%rowtype; v_action public.action_versions%rowtype;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_rec from public.recommendations where id=p_recommendation_id and user_id=v_user;
  if not found then return null; end if;
  if v_rec.status='presented' then update public.recommendations set status='opened', opened_at=coalesce(opened_at,now()) where id=v_rec.id; v_rec.status='opened'; end if;
  select * into v_action from public.action_versions where id=v_rec.action_version_id;
  return jsonb_build_object('id',v_rec.id,'status',v_rec.status,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_rec.why_now_rendered,'when_to_use',v_action.when_to_use,'when_not_to_use',v_action.when_not_to_use,'steps',v_action.steps,'duration_minutes',v_action.duration_minutes,'ethical_guardrail',v_action.ethical_guardrail,'message_template',v_action.message_template,'action_type',(select action_type from public.action_protocols where id=v_action.protocol_id));
end; $$;

create or replace function public.start_recommendation(p_recommendation_id uuid)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if auth.uid() is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=auth.uid() and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  update public.recommendations set status='started', started_at=coalesce(started_at,now()) where id=p_recommendation_id and user_id=auth.uid() and status in ('presented','opened');
  return found;
end; $$;

create or replace function public.swap_recommendation(p_recommendation_id uuid, p_reason public.swap_reason)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_rec public.recommendations%rowtype; v_protocol uuid; v_count integer; v_new jsonb; v_new_id uuid;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_rec from public.recommendations where id=p_recommendation_id and user_id=v_user and status in ('presented','opened','started') for update;
  if not found then raise exception using errcode='22023', message='recommendation_not_current'; end if;
  select protocol_id into v_protocol from public.action_versions where id=v_rec.action_version_id;
  update public.recommendations set status='swapped' where id=v_rec.id;
  insert into public.action_swaps (user_id,recommendation_id,reason) values (v_user,v_rec.id,p_reason);
  if p_reason='no_opportunity' then
    insert into public.user_action_preferences(user_id,protocol_id,block_until,last_reason,recent_swap_count) values(v_user,v_protocol,now()+interval '7 days',p_reason,0)
    on conflict(user_id,protocol_id) do update set block_until=excluded.block_until,last_reason=excluded.last_reason,recent_swap_count=0,updated_at=now();
  elsif p_reason='recently_done' then
    insert into public.user_action_preferences(user_id,protocol_id,block_until,last_reason,recent_swap_count) values(v_user,v_protocol,now()+interval '14 days',p_reason,0)
    on conflict(user_id,protocol_id) do update set block_until=excluded.block_until,last_reason=excluded.last_reason,recent_swap_count=0,updated_at=now();
  elsif p_reason='not_for_my_moment' then
    insert into public.user_action_preferences(user_id,protocol_id,block_until,weight_adjustment,last_reason,recent_swap_count) values(v_user,v_protocol,now()+interval '21 days',-20,p_reason,1)
    on conflict(user_id,protocol_id) do update set block_until=excluded.block_until,weight_adjustment=least(-20,user_action_preferences.weight_adjustment-20),last_reason=excluded.last_reason,recent_swap_count=user_action_preferences.recent_swap_count+1,updated_at=now();
  elsif p_reason='do_not_want' then
    insert into public.user_action_preferences(user_id,protocol_id,block_until,weight_adjustment,last_reason,recent_swap_count) values(v_user,v_protocol,now()+interval '180 days',-50,p_reason,0)
    on conflict(user_id,protocol_id) do update set block_until=excluded.block_until,weight_adjustment=least(-50,user_action_preferences.weight_adjustment-10),last_reason=excluded.last_reason,recent_swap_count=0,updated_at=now();
  elsif p_reason='did_not_understand' then
    insert into public.user_action_preferences(user_id,protocol_id,weight_adjustment,last_reason,recent_swap_count) values(v_user,v_protocol,-5,p_reason,0)
    on conflict(user_id,protocol_id) do update set weight_adjustment=user_action_preferences.weight_adjustment-5,last_reason=excluded.last_reason,recent_swap_count=0,updated_at=now();
  else
    insert into public.user_action_preferences(user_id,protocol_id,last_reason,recent_swap_count) values(v_user,v_protocol,p_reason,0)
    on conflict(user_id,protocol_id) do update set last_reason=excluded.last_reason,recent_swap_count=0,updated_at=now();
  end if;
  v_new:=public.generate_next_recommendation(); v_new_id:=nullif(v_new->>'recommendation_id','')::uuid;
  update public.action_swaps set replacement_recommendation_id=v_new_id where recommendation_id=v_rec.id;
  select count(*) into v_count
  from (select reason from public.action_swaps where user_id=v_user order by created_at desc limit 2) recent
  where recent.reason='not_for_my_moment';
  return jsonb_build_object('recommendation',v_new,'review_plan',v_count>=2);
end; $$;

-- Editorial seed: five foundation and thirteen acquisition protocols.
insert into public.action_protocols (slug,action_type,category,measurement_class) values
('FND_01_CONFIRM_AVAILABILITY','foundation','foundation','foundation'),('FND_02_BOOKING_PATH','foundation','foundation','foundation'),('FND_03_FIRST_MODEL','foundation','foundation','foundation'),('FND_04_REAL_PORTFOLIO','foundation','foundation','foundation'),('FND_05_CLEAR_SERVICE','foundation','foundation','foundation'),
('CONV_01_PRICE_REOPEN','acquisition','conversations','direct_outreach'),('CONV_02_PAUSED_CONVERSATION','acquisition','conversations','direct_outreach'),('CONV_03_TWO_REAL_SLOTS','acquisition','conversations','direct_outreach'),('CONV_04_OBJECTION','acquisition','conversations','direct_outreach'),('REACT_01_PREVIOUS_CLIENT','acquisition','return','return'),('RETURN_01_NEXT_VISIT','acquisition','return','return'),('REF_01_ASK_REFERRAL','acquisition','referral','referral'),('PROOF_01_REQUEST_REVIEW','acquisition','proof','referral'),('PROOF_02_SHARE_PROOF','acquisition','proof','broadcast'),('AVAIL_01_REAL_SLOT','acquisition','availability','broadcast'),('LOCAL_01_EXISTING_DEMAND','acquisition','local','direct_outreach'),('LOCAL_02_WARM_NETWORK','acquisition','local','direct_outreach'),('PARTNER_01_COMPLEMENTARY_BUSINESS','acquisition','partnership','partnership')
on conflict (slug) do update set active=true;

insert into public.recommendation_policy_versions (version,status,params,activated_at) values (1,'active',jsonb_build_object('score_weights',jsonb_build_object('fit',35,'channel',20,'prior',15,'evidence',15,'exploration',10,'viability',5),'prior_weight',8,'recency_half_life_days',60,'daily_limits',jsonb_build_object('10',1,'20',2,'30',3,'45',3),'exploration_rate',0),now()) on conflict(version) do update set status='active',params=excluded.params,activated_at=excluded.activated_at;

-- Seeds intentionally use compact, editable editorial records. Every version has <= 3 steps.
with seed(slug,title,short_desc,why,use_when,not_when,steps,stages,bottlenecks,channels,req,duration,cooldown,prior,guardrail,message,action_type) as (values
('FND_01_CONFIRM_AVAILABILITY','Defina quando consegue atender','Escolha uma disponibilidade real para os próximos dias.','Antes de buscar pessoas, precisamos saber quando você consegue atender.','Quando ainda não consegue atender nos próximos 7 dias.','Quando sua disponibilidade já está definida.','["Escolha dois ou três horários reais.","Anote-os em um lugar fácil de consultar.","Use esses horários quando alguém perguntar."]','{}','{}','{}','{"needs_can_serve_next_7_days":true}',5,24,0.95,'Só ofereça horários que você realmente consegue cumprir.',null,'foundation'),
('FND_02_BOOKING_PATH','Deixe claro por onde marcar','Defina um caminho simples para alguém falar com você.','Antes de convidar alguém, vale deixar claro por onde ela pode marcar.','Quando você ainda não tem um caminho de marcação definido.','Quando as pessoas já sabem como falar com você.','["Escolha um canal que você acompanha.","Defina uma frase simples para orientar a marcação.","Deixe esse canal fácil de encontrar."]','{}','{}','{}','{"needs_has_booking_path":true}',5,24,0.94,'Não prometa resposta imediata se você não puder acompanhar o canal.',null,'foundation'),
('FND_03_FIRST_MODEL','Consiga uma primeira oportunidade','Encontre uma oportunidade legítima para praticar e criar prova real.','Uma primeira experiência real ajuda você a ganhar segurança e material autorizado.','Quando você está começando e ainda não tem uma oportunidade.','Quando você já tem prática e prova real suficientes.','["Pense em uma pessoa próxima que possa ter interesse.","Explique o que você está oferecendo com honestidade.","Combine tudo antes de atender."]','{starting}','{first_clients}','{existing_clients,local_network}','{}',15,72,0.86,'Convide sem pressão e combine expectativas com clareza.',null,'foundation'),
('FND_04_REAL_PORTFOLIO','Separe três fotos reais','Escolha pelo menos três fotos reais que possa mostrar.','Pessoas precisam conseguir ver seu trabalho antes de decidir conversar.','Quando você ainda não tem fotos reais apresentáveis.','Quando já tem fotos autorizadas para mostrar.','["Escolha até três fotos reais.","Confirme que tem autorização para usar cada uma.","Separe-as para mostrar quando fizer sentido."]','{}','{}','{}','{"needs_has_real_portfolio":true}',10,24,0.93,'Use somente fotos que você tem autorização para utilizar.',null,'foundation'),
('FND_05_CLEAR_SERVICE','Deixe seu serviço claro','Explique com simplicidade qual serviço você oferece.','Uma oferta clara reduz dúvidas e facilita o próximo passo.','Quando ainda é difícil explicar o que você faz.','Quando seu serviço já está claro para quem pergunta.','["Escreva o nome do serviço.","Explique em uma frase o que está incluído.","Use a mesma explicação quando alguém perguntar."]','{}','{}','{}','{}',5,24,0.88,'Seja clara sobre o que está e não está incluído.',null,'foundation'),
('CONV_01_PRICE_REOPEN','Retome quem perguntou o preço','Volte a conversar com alguém que perguntou sobre Soft Gel.','Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale aproveitar uma conversa que já começou.','Quando alguém perguntou o preço e a conversa parou.','Quando a pessoa pediu para não ser contatada novamente.','["Encontre uma conversa recente.","Envie uma mensagem curta e gentil.","Deixe a pessoa à vontade para responder."]','{}','{low_conversion}','{whatsapp,existing_clients}','{"requires_context_signal":true}',5,72,0.92,'Se não houver resposta, não insista novamente.','Oi! Lembrei da nossa conversa sobre Soft Gel. Se ainda fizer sentido para você, posso te explicar os próximos horários.','acquisition'),
('CONV_02_PAUSED_CONVERSATION','Retome uma conversa legítima','Volte a uma conversa que parou, sem pressionar.','Uma conversa que já existiu pode ser um próximo passo mais simples do que começar do zero.','Quando a conversa foi legítima e recente.','Quando a pessoa não demonstrou interesse ou pediu espaço.','["Escolha uma conversa que parou naturalmente.","Retome o assunto com uma frase humana.","Aceite qualquer resposta com respeito."]','{}','{low_conversion,first_clients}','{whatsapp,existing_clients}','{"requires_context_signal":true}',5,72,0.9,'Se não houver resposta, não insista novamente.','Oi! Passando para saber se ainda faz sentido conversarmos sobre suas unhas. Fique à vontade para me dizer.','acquisition'),
('CONV_03_TWO_REAL_SLOTS','Ofereça duas opções reais','Mostre duas opções de horário que você realmente tem.','Quando alguém demonstra interesse, facilitar a escolha pode ajudar a conversa a avançar.','Quando alguém já demonstrou interesse e você tem disponibilidade real.','Quando você não consegue atender nos próximos 7 dias.','["Confira sua disponibilidade real.","Envie duas opções de horário.","Peça que a pessoa escolha uma delas."]','{some_clients,irregular_schedule}','{low_conversion,empty_slots}','{whatsapp,existing_clients}','{"requires_context_signal":true}',5,48,0.9,'Ofereça somente horários que você consegue cumprir.',null,'acquisition'),
('CONV_04_OBJECTION','Responda uma dúvida concreta','Responda com clareza uma dúvida que travou a conversa.','Uma dúvida específica merece uma resposta simples antes de qualquer convite.','Quando alguém trouxe uma objeção concreta.','Quando não há uma pergunta real para responder.','["Identifique a dúvida exata.","Responda apenas o que foi perguntado.","Convide a pessoa a perguntar mais se quiser."]','{}','{low_conversion}','{whatsapp,existing_clients}','{"requires_context_signal":true}',5,72,0.88,'Não esconda informações importantes nem crie urgência falsa.',null,'acquisition'),
('REACT_01_PREVIOUS_CLIENT','Convide uma cliente anterior','Convide uma cliente anterior no momento adequado.','Uma relação que já existe pode ser retomada com cuidado e contexto.','Quando você já atendeu alguém e faz sentido convidá-la.','Quando a pessoa pediu para não receber convites.','["Escolha uma cliente com quem teve boa experiência.","Pergunte como ela está.","Faça um convite simples, sem pressão."]','{some_clients,irregular_schedule}','{low_return}','{existing_clients,whatsapp}','{"requires_context_signal":true}',5,168,0.86,'Convide com respeito; não insista se não houver resposta.',null,'acquisition'),
('RETURN_01_NEXT_VISIT','Encaminhe o próximo atendimento','Convide uma cliente a combinar o próximo atendimento.','Quando a experiência foi positiva, deixar o próximo passo claro ajuda a manter o vínculo.','Depois de um atendimento satisfatório.','Quando a cliente não demonstrou interesse em voltar.','["Pergunte como foi a experiência.","Sugira um período possível para voltar.","Deixe a decisão com a cliente."]','{some_clients,irregular_schedule}','{low_return}','{existing_clients,whatsapp}','{"requires_context_signal":true}',5,168,0.84,'Não trate uma sugestão como compromisso obrigatório.',null,'acquisition'),
('REF_01_ASK_REFERRAL','Peça uma indicação','Peça uma indicação depois de uma experiência positiva.','Uma cliente satisfeita pode lembrar de alguém que gostaria do seu trabalho.','Depois de uma experiência positiva e autorização para pedir.','Antes de entregar uma boa experiência.','["Agradeça pela confiança.","Pergunte se ela conhece alguém que gostaria do serviço.","Aceite um não sem insistir."]','{some_clients,irregular_schedule}','{low_visibility,first_clients}','{existing_clients,whatsapp}','{"requires_context_signal":true}',5,168,0.8,'Peça uma indicação, nunca dados ou contatos de terceiros sem consentimento.',null,'acquisition'),
('PROOF_01_REQUEST_REVIEW','Peça uma avaliação','Convide uma cliente satisfeita a deixar uma avaliação.','Uma experiência real contada pela cliente ajuda outras pessoas a conhecerem seu trabalho.','Depois de uma experiência positiva.','Quando você não tem autorização ou a experiência não foi positiva.','["Pergunte se a experiência foi boa.","Explique onde a avaliação será usada.","Aceite se a pessoa preferir não escrever."]','{some_clients,irregular_schedule}','{low_visibility}','{existing_clients,whatsapp}','{"requires_context_signal":true}',5,168,0.78,'Use somente avaliações autorizadas; não invente depoimentos.',null,'acquisition'),
('PROOF_02_SHARE_PROOF','Mostre uma prova autorizada','Compartilhe uma foto ou avaliação que você pode usar.','Uma prova real e autorizada ajuda pessoas próximas a entenderem seu trabalho.','Quando você tem uma prova real com autorização.','Quando não há autorização para compartilhar.','["Escolha uma prova autorizada.","Contextualize sem exagerar o resultado.","Deixe um caminho simples para falar com você."]','{}','{low_visibility}','{instagram,whatsapp,local_network}','{}',10,72,0.8,'Use somente fotos/depoimentos que você tem autorização para utilizar.',null,'acquisition'),
('AVAIL_01_REAL_SLOT','Divulgue um horário real','Mostre uma disponibilidade verdadeira para os próximos dias.','Você contou que ainda ficam horários vazios. Um horário real dá um próximo passo claro.','Quando há um horário que você realmente pode atender.','Quando não existe disponibilidade real.','["Confirme um horário disponível.","Comunique o dia e período com clareza.","Responda quem demonstrar interesse."]','{some_clients,irregular_schedule}','{empty_slots,low_visibility}','{instagram,whatsapp,local_network}','{}',10,48,0.86,'Não anuncie escassez falsa nem horário que você não possa cumprir.',null,'acquisition'),
('LOCAL_01_EXISTING_DEMAND','Responda uma demanda local real','Responda a alguém que já pediu indicação ou serviço na sua região.','Uma demanda que já existe é mais respeitosa do que abordar pessoas indiscriminadamente.','Quando houver uma procura real em ambiente permitido.','Quando não há uma demanda real.','["Encontre uma demanda pública e legítima.","Responda apenas se seu serviço fizer sentido.","Explique como a pessoa pode falar com você."]','{}','{first_clients,low_visibility,empty_slots}','{local_network}','{"requires_context_signal":true}',10,72,0.82,'Não faça abordagem indiscriminada nem entre em grupos sem permissão.',null,'acquisition'),
('LOCAL_02_WARM_NETWORK','Converse com alguém próximo','Fale de forma contextual com uma pessoa que pode indicar seu trabalho.','Pessoas próximas podem conhecer alguém que precisa do seu serviço, sem disparos ou pressão.','Quando existe um contexto real para a conversa.','Quando você não tem contexto ou a pessoa não quer receber mensagens.','["Escolha alguém com contexto real.","Conte brevemente o que você oferece.","Pergunte se conhece alguém e aceite a resposta."]','{}','{first_clients,low_visibility}','{existing_clients,local_network}','{"requires_context_signal":true}',5,72,0.8,'Nada de disparo em massa ou insistência.',null,'acquisition'),
('PARTNER_01_COMPLEMENTARY_BUSINESS','Converse com um negócio complementar','Inicie uma conversa respeitosa com um negócio que atende pessoas parecidas.','Uma parceria começa com contexto e troca clara, não com abordagem indiscriminada.','Quando há um negócio complementar e uma proposta legítima.','Quando não há contexto ou consentimento para contato.','["Escolha um negócio complementar.","Explique por que a conversa pode fazer sentido.","Proponha apenas uma conversa, sem compromisso."]','{}','{low_visibility,first_clients}','{partnerships}','{"requires_context_signal":true}',15,336,0.76,'Não prometa resultados nem insista se não houver interesse.',null,'acquisition')
), inserted as (
  insert into public.action_versions (protocol_id,version_number,status,title,short_description,why_now_template,when_to_use,when_not_to_use,steps,eligible_stages,eligible_bottlenecks,required_channels,requirements,duration_minutes,cooldown_hours,editorial_prior,ethical_guardrail,message_template,published_at)
  select ap.id,1,'published',s.title,s.short_desc,s.why,s.use_when,s.not_when,s.steps::jsonb,
    case when s.stages='{}' then '{}'::public.user_stage[] else s.stages::public.user_stage[] end,
    case when s.bottlenecks='{}' then '{}'::public.bottleneck[] else s.bottlenecks::public.bottleneck[] end,
    case when s.channels='{}' then '{}'::text[] else s.channels::text[] end,s.req::jsonb,s.duration,s.cooldown,s.prior,s.guardrail,s.message,now()
  from seed s join public.action_protocols ap on ap.slug=s.slug
  on conflict (protocol_id,version_number) do nothing
  returning id
) select count(*) from inserted;

revoke all on function public.save_onboarding(text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean) from public, anon;
grant execute on function public.save_onboarding(text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean) to authenticated;
revoke all on function public.generate_next_recommendation() from public, anon;
grant execute on function public.generate_next_recommendation() to authenticated;
revoke all on function public.get_today_plan() from public, anon;
grant execute on function public.get_today_plan() to authenticated;
revoke all on function public.get_recommendation_detail(uuid) from public, anon;
grant execute on function public.get_recommendation_detail(uuid) to authenticated;
revoke all on function public.start_recommendation(uuid) from public, anon;
grant execute on function public.start_recommendation(uuid) to authenticated;
revoke all on function public.swap_recommendation(uuid,public.swap_reason) from public, anon;
grant execute on function public.swap_recommendation(uuid,public.swap_reason) to authenticated;
