-- Agenda 80/20 — Fase 3: evidência, resultados e check-ins.
-- Esta migration é incremental e não altera versões publicadas existentes.

do $$ begin
  create type public.outcome_status as enum ('pending', 'none', 'interest', 'booking');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.confidence_level as enum ('learning', 'signal', 'strong_signal');
exception when duplicate_object then null; end $$;

create table if not exists public.action_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recommendation_id uuid not null unique references public.recommendations (id) on delete restrict,
  action_version_id uuid not null references public.action_versions (id) on delete restrict,
  exposure_count integer check (exposure_count is null or exposure_count > 0),
  exposure_bucket text check (exposure_bucket is null or exposure_bucket in ('1','2','3+')),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check ((exposure_bucket is null and exposure_count is null) or (exposure_bucket is not null and exposure_count is not null))
);

create table if not exists public.action_outcomes (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null unique references public.action_executions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.outcome_status not null default 'pending',
  interest_count integer not null default 0 check (interest_count >= 0),
  booking_count integer not null default 0 check (booking_count >= 0),
  attribution_type text not null default 'user_reported_association' check (attribution_type = 'user_reported_association'),
  maturation_at timestamptz not null,
  finalization_at timestamptz not null,
  finalized_at timestamptz,
  last_prompted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'pending' and finalized_at is null) or (status <> 'pending' and finalized_at is not null)),
  check (finalization_at >= maturation_at)
);

create index if not exists action_executions_user_completed_idx
  on public.action_executions (user_id, completed_at desc);
create index if not exists action_executions_action_version_idx
  on public.action_executions (action_version_id, completed_at desc);
create index if not exists action_outcomes_user_status_idx
  on public.action_outcomes (user_id, status, finalized_at desc);
create index if not exists action_outcomes_pending_maturation_idx
  on public.action_outcomes (maturation_at)
  where status = 'pending';

drop trigger if exists action_outcomes_set_updated_at on public.action_outcomes;
create trigger action_outcomes_set_updated_at before update on public.action_outcomes
for each row execute function private.set_updated_at();

alter table public.action_executions enable row level security;
alter table public.action_outcomes enable row level security;
revoke all on table public.action_executions, public.action_outcomes from public, anon, authenticated;
grant select on table public.action_executions, public.action_outcomes to authenticated;

drop policy if exists action_executions_owner_read on public.action_executions;
create policy action_executions_owner_read on public.action_executions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists action_outcomes_owner_read on public.action_outcomes;
create policy action_outcomes_owner_read on public.action_outcomes for select to authenticated
  using ((select auth.uid()) = user_id);

-- Shared evidence calculation. Pending outcomes are deliberately excluded.
create or replace function private.evidence_summary(p_user_id uuid, p_category text, p_prior numeric)
returns jsonb language sql stable security definer set search_path = pg_catalog, public as $$
  with observations as (
    select
      case ao.status when 'booking' then 1.0 when 'interest' then 0.35 else 0.0 end /
        greatest(1, least(coalesce(ae.exposure_count, 1), 3)) as normalized_result,
      pg_catalog.power(0.5, greatest(0, extract(epoch from (pg_catalog.now() - ao.finalized_at)) / 86400.0) / 60.0) as recency_weight,
      ao.status
    from public.action_executions ae
    join public.action_outcomes ao on ao.execution_id = ae.id
    join public.action_versions av on av.id = ae.action_version_id
    join public.action_protocols ap on ap.id = av.protocol_id
    where ae.user_id = p_user_id
      and ap.category = p_category
      and ap.action_type = 'acquisition'
      and ao.status <> 'pending'
      and ao.finalized_at is not null
  ), aggregate as (
    select count(*)::integer as comparable_count,
      count(*) filter (where status in ('interest','booking'))::integer as positive_count,
      coalesce(sum(recency_weight * normalized_result), 0)::numeric as weighted_result,
      coalesce(sum(recency_weight), 0)::numeric as weight_sum
    from observations
  )
  select jsonb_build_object(
    'posterior', ((8.0 * greatest(0.0, least(1.0, p_prior)) + weighted_result) /
      (8.0 + weight_sum)),
    'comparable_count', comparable_count,
    'positive_count', positive_count
  ) from aggregate;
$$;
revoke all on function private.evidence_summary(uuid,text,numeric) from public, anon, authenticated;

-- Publish a new configured version for each protocol; v1 remains immutable.
insert into public.action_versions (
  protocol_id, version_number, status, title, short_description, why_now_template,
  when_to_use, when_not_to_use, steps, eligible_professions, eligible_stages,
  eligible_bottlenecks, required_channels, requirements, duration_minutes, difficulty,
  exposure_mode, max_exposure, cooldown_hours, maturation_hours, finalization_hours,
  editorial_prior, ethical_guardrail, message_template, created_by, published_at
)
select
  av.protocol_id, 2, 'published', av.title, av.short_description, av.why_now_template,
  av.when_to_use, av.when_not_to_use, av.steps, av.eligible_professions, av.eligible_stages,
  av.eligible_bottlenecks, av.required_channels, av.requirements, av.duration_minutes, av.difficulty,
  case when ap.action_type = 'foundation' then 'none'
       when ap.measurement_class = 'direct_outreach' then 'direct'
       when ap.measurement_class = 'broadcast' then 'broadcast'
       when ap.measurement_class = 'return' then 'return'
       when ap.measurement_class = 'referral' then 'referral'
       when ap.measurement_class = 'partnership' then 'partnership'
       else 'none' end,
  av.max_exposure,
  av.cooldown_hours,
  case when ap.action_type = 'foundation' then 0
       when ap.measurement_class = 'partnership' then 72 else 24 end,
  case when ap.action_type = 'foundation' then 0
       when ap.measurement_class = 'partnership' then 336
       when ap.measurement_class in ('return','referral') then 168 else 72 end,
  av.editorial_prior, av.ethical_guardrail, av.message_template, av.created_by, pg_catalog.now()
from public.action_versions av
join public.action_protocols ap on ap.id = av.protocol_id
where av.version_number = 1 and av.status = 'published'
on conflict (protocol_id, version_number) do nothing;

insert into public.recommendation_policy_versions (version, status, params, created_by, activated_at)
select 2, 'active',
  p.params || jsonb_build_object('confidence_thresholds', jsonb_build_object(
    'signal_outcomes', 5, 'signal_positive', 3, 'strong_outcomes', 8, 'strong_margin', 0.05
  )), p.created_by, pg_catalog.now()
from public.recommendation_policy_versions p
where p.version = 1
on conflict (version) do nothing;
update public.recommendation_policy_versions set status = case when version = 2 then 'active' else 'retired' end
where version in (1,2);

create or replace function public.generate_next_recommendation()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid(); v_profile public.business_profiles%rowtype; v_context public.context_checkins%rowtype;
  v_policy public.recommendation_policy_versions%rowtype; v_current public.recommendations%rowtype;
  v_action public.action_versions%rowtype; v_rec public.recommendations%rowtype;
  v_score numeric; v_stage_fit numeric; v_channel_fit numeric; v_prior numeric; v_viability numeric;
  v_evidence numeric; v_why text; v_sequence integer; v_is_foundation boolean; v_has_readiness_gap boolean;
  v_summary jsonb; v_confidence public.confidence_level; v_limit integer; v_completed integer;
  v_other_posterior numeric; v_signal_outcomes integer; v_signal_positive integer; v_strong_outcomes integer; v_strong_margin numeric;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements e where e.user_id=v_user and e.product_code='agenda_8020' and e.status='active' and e.expires_at>pg_catalog.now()) then
    raise exception using errcode='42501', message='entitlement_required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 8020));
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('status','onboarding_required'); end if;
  select * into v_current from public.recommendations where user_id=v_user and status in ('presented','opened','started') order by created_at desc limit 1;
  if found then
    select av.* into v_action from public.action_versions av where av.id=v_current.action_version_id;
    return jsonb_build_object('status','existing','recommendation_id',v_current.id,'action_version_id',v_current.action_version_id,
      'title',v_action.title,'short_description',v_action.short_description,'why_now',v_current.why_now_rendered,
      'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,
      'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),
      'confidence_level',coalesce(v_current.score_components->>'confidence_level','learning'));
  end if;
  select count(*) into v_completed from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed';
  select greatest(1, coalesce((v_policy.params->'daily_limits'->>v_profile.daily_available_minutes::text)::integer, 3)) into v_limit
  from public.recommendation_policy_versions v_policy where status='active' order by version desc limit 1;
  if coalesce(v_completed,0) >= coalesce(v_limit,3) then
    return jsonb_build_object('status','daily_limit_reached','message','Você já fez o suficiente por hoje. Volte amanhã para continuar.');
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
  where av.status='published' and ap.active
    and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number)
    and av.eligible_professions @> array[v_profile.profession]::text[]
    and (cardinality(av.eligible_stages)=0 or v_profile.stage=any(av.eligible_stages))
    and (cardinality(av.eligible_bottlenecks)=0 or v_profile.current_bottleneck=any(av.eligible_bottlenecks))
    and (cardinality(av.required_channels)=0 or (v_profile.channels && av.required_channels))
    and av.duration_minutes <= v_profile.daily_available_minutes
    and ((ap.action_type='foundation' and v_is_foundation) or (ap.action_type='acquisition' and not v_is_foundation))
    and (ap.action_type='foundation' or (v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path))
    and (coalesce((av.requirements->>'needs_can_serve_next_7_days')::boolean,false) = false or not v_profile.can_serve_next_7_days)
    and (coalesce((av.requirements->>'needs_has_real_portfolio')::boolean,false) = false or not v_profile.has_real_portfolio)
    and (coalesce((av.requirements->>'needs_has_booking_path')::boolean,false) = false or not v_profile.has_booking_path)
    and (coalesce((av.requirements->>'requires_context_signal')::boolean,false) = false)
    and not exists (select 1 from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id and uap.block_until>pg_catalog.now())
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status <> 'expired' and rr.created_at > pg_catalog.now() - make_interval(hours => av.cooldown_hours))
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status='swapped' and rr.created_at > pg_catalog.now() - interval '1 day')
  order by
    (case when v_profile.stage=any(av.eligible_stages) then 20 else 0 end
      + case when v_profile.current_bottleneck=any(av.eligible_bottlenecks) then 15 else 0 end
      + case when ap.action_type='foundation' then 5 else 0 end
      + case when cardinality(av.required_channels)=0 or v_profile.channels && av.required_channels then 20 else 0 end
      + (av.editorial_prior*15)
      + (case when ap.action_type='acquisition' then ((private.evidence_summary(v_user, ap.category, av.editorial_prior)->>'posterior')::numeric * 15) else 0 end)
      + 5 + coalesce((select uap.weight_adjustment from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id),0)) desc,
    av.id asc limit 1;
  if not found then return jsonb_build_object('status','no_eligible_action','message','Não conseguimos encontrar uma ação possível agora. Vamos ajustar seu plano.'); end if;
  v_stage_fit := case when v_profile.stage=any(v_action.eligible_stages) then 20 else 0 end + case when v_profile.current_bottleneck=any(v_action.eligible_bottlenecks) then 15 else 0 end;
  v_channel_fit := case when cardinality(v_action.required_channels)=0 or v_profile.channels && v_action.required_channels then 20 else 0 end;
  v_prior := v_action.editorial_prior*15; v_viability := 5;
  v_summary := private.evidence_summary(v_user, (select ap.category from public.action_protocols ap where ap.id=v_action.protocol_id), v_action.editorial_prior);
  v_evidence := case when (select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id)='acquisition' then ((v_summary->>'posterior')::numeric*15) else 0 end;
  v_signal_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'signal_outcomes')::integer,5);
  v_signal_positive := coalesce((v_policy.params->'confidence_thresholds'->>'signal_positive')::integer,3);
  v_strong_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'strong_outcomes')::integer,8);
  v_strong_margin := coalesce((v_policy.params->'confidence_thresholds'->>'strong_margin')::numeric,0.05);
  v_other_posterior := 0;
  if (select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id)='acquisition' then
    select coalesce(max((private.evidence_summary(v_user, ap.category, av.editorial_prior)->>'posterior')::numeric),0) into v_other_posterior
    from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id
    where ap.action_type='acquisition' and ap.category <> (select ap2.category from public.action_protocols ap2 where ap2.id=v_action.protocol_id)
      and av.status='published' and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number);
    if (v_summary->>'comparable_count')::integer >= v_strong_outcomes and (v_summary->>'posterior')::numeric >= v_other_posterior + v_strong_margin then v_confidence := 'strong_signal';
    elsif (v_summary->>'comparable_count')::integer >= v_signal_outcomes and (v_summary->>'positive_count')::integer >= v_signal_positive and (v_summary->>'posterior')::numeric > v_action.editorial_prior then v_confidence := 'signal';
    else v_confidence := 'learning'; end if;
  else v_confidence := 'learning'; end if;
  v_score := v_stage_fit+v_channel_fit+v_prior+v_evidence+v_viability;
  v_why := case when v_is_foundation then
    case when not v_profile.can_serve_next_7_days then 'Você ainda não confirmou disponibilidade para atender nos próximos 7 dias. Vamos preparar esse básico antes de buscar novas pessoas.'
      when not v_profile.has_real_portfolio then 'Você ainda não tem uma foto real pronta para mostrar. Vamos preparar essa prova antes de buscar novas pessoas.'
      when not v_profile.has_booking_path then 'Você ainda não deixou claro por onde alguém pode marcar. Vamos deixar esse caminho simples antes de buscar novas pessoas.'
      else 'Você contou como está hoje. Vamos preparar o básico para a próxima ação ficar possível.' end
    else case v_profile.current_bottleneck when 'first_clients' then 'Você está começando e precisa das primeiras clientes. Esta é uma ação simples para criar movimento.' when 'low_visibility' then 'Pouca gente conhece seu trabalho. Esta ação ajuda a colocar seu serviço diante de pessoas próximas.' when 'low_conversion' then 'Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale começar por uma conversa que já existe.' when 'empty_slots' then 'Você já atende, mas ainda ficam horários vazios. Esta ação ajuda a mostrar uma disponibilidade real.' when 'low_return' then 'Você quer fazer suas clientes voltarem mais. Esta ação retoma uma relação que já existe.' else 'Esta é a próxima ação mais simples para o seu momento.' end end;
  select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
  insert into public.recommendations (user_id, action_version_id, context_checkin_id, policy_version_id, sequence_number, score, score_components, why_now_rendered, exploration)
  values (v_user, v_action.id, v_context.id, v_policy.id, v_sequence, v_score,
    jsonb_build_object('fit',v_stage_fit,'channel',v_channel_fit,'prior',v_prior,'evidence',v_evidence,'viability',v_viability,'confidence_level',v_confidence), v_why, false)
  returning * into v_rec;
  return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'confidence_level',v_confidence,'score',v_score);
end; $$;

create or replace function public.complete_recommendation(p_recommendation_id uuid, p_exposure_bucket text default null)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid := auth.uid(); v_rec public.recommendations%rowtype; v_action public.action_versions%rowtype; v_type public.action_type; v_execution public.action_executions%rowtype; v_outcome public.action_outcomes%rowtype; v_count integer;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  if p_exposure_bucket is not null and p_exposure_bucket not in ('1','2','3+') then raise exception using errcode='22023', message='invalid_exposure_bucket'; end if;
  select r.* into v_rec from public.recommendations r where r.id=p_recommendation_id and r.user_id=v_user and r.status='started' for update;
  if not found then raise exception using errcode='22023', message='recommendation_not_current'; end if;
  select av.* into v_action from public.action_versions av where av.id=v_rec.action_version_id;
  select ap.action_type into v_type from public.action_protocols ap where ap.id=v_action.protocol_id;
  if v_action.exposure_mode in ('direct','return','referral','partnership') then
    if p_exposure_bucket is null then raise exception using errcode='22023', message='exposure_count_required'; end if;
  elsif p_exposure_bucket is not null then raise exception using errcode='22023', message='exposure_count_not_applicable'; end if;
  v_count := case p_exposure_bucket when '1' then 1 when '2' then 2 when '3+' then 3 else null end;
  if v_action.max_exposure is not null and coalesce(v_count,0) > v_action.max_exposure then
    raise exception using errcode='22023', message='exposure_limit_exceeded';
  end if;
  update public.recommendations set status='completed', completed_at=coalesce(completed_at,pg_catalog.now()) where id=v_rec.id;
  insert into public.action_executions (user_id,recommendation_id,action_version_id,exposure_count,exposure_bucket,completed_at)
  values (v_user,v_rec.id,v_action.id,v_count,p_exposure_bucket,coalesce(v_rec.completed_at,pg_catalog.now())) returning * into v_execution;
  if v_type='acquisition' then
    insert into public.action_outcomes (execution_id,user_id,status,maturation_at,finalization_at)
    values (v_execution.id,v_user,'pending',v_execution.completed_at+make_interval(hours=>v_action.maturation_hours),v_execution.completed_at+make_interval(hours=>v_action.finalization_hours)) returning * into v_outcome;
  end if;
  return jsonb_build_object('ok',true,'execution_id',v_execution.id,'outcome_id',v_outcome.id,'outcome_status',v_outcome.status,'action_type',v_type);
end; $$;

create or replace function public.record_outcome(p_execution_id uuid, p_status public.outcome_status)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_outcome public.action_outcomes%rowtype; v_interest integer:=0; v_booking integer:=0;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_outcome from public.action_outcomes where execution_id=p_execution_id and user_id=v_user for update;
  if not found then raise exception using errcode='22023', message='execution_not_owned'; end if;
  if v_outcome.status <> 'pending' then raise exception using errcode='22023', message='outcome_already_finalized'; end if;
  if p_status='pending' then
    update public.action_outcomes set status='pending', last_prompted_at=pg_catalog.now() where id=v_outcome.id;
  else
    v_interest := case when p_status='interest' then 1 else 0 end;
    v_booking := case when p_status='booking' then 1 else 0 end;
    update public.action_outcomes set status=p_status, interest_count=v_interest, booking_count=v_booking, finalized_at=pg_catalog.now() where id=v_outcome.id;
  end if;
  select * into v_outcome from public.action_outcomes where id=v_outcome.id;
  return jsonb_build_object('ok',true,'outcome_id',v_outcome.id,'status',v_outcome.status,'finalized_at',v_outcome.finalized_at);
end; $$;

create or replace function public.get_recommendation_detail(p_recommendation_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_rec public.recommendations%rowtype; v_action public.action_versions%rowtype; v_outcome public.action_outcomes%rowtype; v_type public.action_type;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_rec from public.recommendations where id=p_recommendation_id and user_id=v_user;
  if not found then return null; end if;
  if v_rec.status='presented' then update public.recommendations set status='opened', opened_at=coalesce(opened_at,pg_catalog.now()) where id=v_rec.id; v_rec.status='opened'; end if;
  select * into v_action from public.action_versions where id=v_rec.action_version_id;
  select ap.action_type into v_type from public.action_protocols ap where ap.id=v_action.protocol_id;
  select ao.* into v_outcome from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id where ae.recommendation_id=v_rec.id;
  return jsonb_build_object('id',v_rec.id,'status',v_rec.status,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_rec.why_now_rendered,'when_to_use',v_action.when_to_use,'when_not_to_use',v_action.when_not_to_use,'steps',v_action.steps,'duration_minutes',v_action.duration_minutes,'ethical_guardrail',v_action.ethical_guardrail,'message_template',v_action.message_template,'action_type',v_type,'exposure_mode',v_action.exposure_mode,'confidence_level',coalesce(v_rec.score_components->>'confidence_level','learning'),'outcome',case when v_outcome.id is null then null else jsonb_build_object('id',v_outcome.id,'execution_id',v_outcome.execution_id,'status',v_outcome.status,'maturation_at',v_outcome.maturation_at,'finalization_at',v_outcome.finalization_at,'finalized_at',v_outcome.finalized_at,'matured',v_outcome.maturation_at<=pg_catalog.now()) end);
end; $$;

create or replace function public.get_today_plan()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_plan jsonb; v_pending jsonb; v_pending_id uuid; v_checkin_required boolean:=false;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not public.can_access_agenda(v_user) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('onboarding_required',true); end if;
  if exists (select 1 from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed') then
    v_plan:=jsonb_build_object('status','next_action_available','message','Você concluiu sua ação de hoje. Quando quiser, veja sua próxima ação.');
  else
    v_plan:=public.generate_next_recommendation();
  end if;
  select jsonb_build_object('outcome_id',ao.id,'recommendation_id',ae.recommendation_id,'title',av.title,'status',ao.status,'maturation_at',ao.maturation_at)
    into v_pending
  from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id join public.recommendations r on r.id=ae.recommendation_id join public.action_versions av on av.id=ae.action_version_id
  where ao.user_id=v_user and ao.status='pending' and ao.maturation_at<=pg_catalog.now() order by ao.maturation_at asc limit 1;
  if v_pending is not null then
    v_pending_id := (v_pending->>'outcome_id')::uuid;
    update public.action_outcomes set last_prompted_at=pg_catalog.now() where id=v_pending_id and user_id=v_user and status='pending';
  end if;
  v_checkin_required := coalesce(v_profile.next_checkin_at<=pg_catalog.now(),false) or v_plan->>'status'='no_eligible_action';
  return jsonb_build_object('onboarding_required',false,'name',(select p.name from public.profiles p where p.user_id=v_user),
    'focus',case v_profile.current_bottleneck when 'first_clients' then 'Preparar o básico para conseguir suas primeiras clientes.' when 'low_visibility' then 'Fazer mais pessoas conhecerem seu trabalho.' when 'low_conversion' then 'Transformar mais conversas em horários.' when 'empty_slots' then 'Preencher horários que ainda estão vazios.' when 'low_return' then 'Fazer suas clientes voltarem.' end,
    'recommendation',v_plan,'pending_outcome',v_pending,'checkin_required',v_checkin_required);
end; $$;

create or replace function public.get_progress()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_week_start date:=date_trunc('week', current_date)::date; v_profile public.business_profiles%rowtype; v_policy public.recommendation_policy_versions%rowtype; v_actions integer; v_interest integer; v_booking integer; v_foundation jsonb; v_confidence public.confidence_level; v_top_category text; v_top_summary jsonb; v_top_posterior numeric:=0; v_top_prior numeric:=0; v_other_posterior numeric:=0; v_signal_outcomes integer; v_signal_positive integer; v_strong_outcomes integer; v_strong_margin numeric;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  select * into v_policy from public.recommendation_policy_versions where status='active' order by version desc limit 1;
  select count(*)::integer into v_actions from public.action_executions where user_id=v_user and completed_at::date>=v_week_start;
  select coalesce(sum(interest_count),0)::integer, coalesce(sum(booking_count),0)::integer into v_interest,v_booking from public.action_outcomes where user_id=v_user and finalized_at::date>=v_week_start and status in ('interest','booking');
  select ap.category, private.evidence_summary(v_user,ap.category,av.editorial_prior), av.editorial_prior
    into v_top_category,v_top_summary,v_top_prior
  from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id
  where ap.action_type='acquisition' and av.status='published'
    and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number)
  order by (private.evidence_summary(v_user,ap.category,av.editorial_prior)->>'posterior')::numeric desc, ap.category asc limit 1;
  v_signal_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'signal_outcomes')::integer,5);
  v_signal_positive := coalesce((v_policy.params->'confidence_thresholds'->>'signal_positive')::integer,3);
  v_strong_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'strong_outcomes')::integer,8);
  v_strong_margin := coalesce((v_policy.params->'confidence_thresholds'->>'strong_margin')::numeric,0.05);
  if v_top_category is null then v_confidence:='learning';
  else
    v_top_posterior := (v_top_summary->>'posterior')::numeric;
    select coalesce(max((private.evidence_summary(v_user,ap.category,av.editorial_prior)->>'posterior')::numeric),0) into v_other_posterior
    from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id
    where ap.action_type='acquisition' and ap.category<>v_top_category and av.status='published'
      and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number);
    if (v_top_summary->>'comparable_count')::integer>=v_strong_outcomes and v_top_posterior>=v_other_posterior+v_strong_margin then v_confidence:='strong_signal';
    elsif (v_top_summary->>'comparable_count')::integer>=v_signal_outcomes and (v_top_summary->>'positive_count')::integer>=v_signal_positive and v_top_posterior>v_top_prior then v_confidence:='signal';
    else v_confidence:='learning'; end if;
  end if;
  v_foundation := jsonb_build_object('completed', (case when v_profile.can_serve_next_7_days then 1 else 0 end + case when v_profile.has_booking_path then 1 else 0 end + case when v_profile.has_real_portfolio then 1 else 0 end), 'total',3, 'availability',v_profile.can_serve_next_7_days, 'booking_path',v_profile.has_booking_path, 'portfolio',v_profile.has_real_portfolio);
  return jsonb_build_object('week_start',v_week_start,'actions_completed',v_actions,'people_interested',v_interest,'bookings',v_booking,'confidence_level',v_confidence,'top_category',v_top_category,'moment_message',case v_confidence when 'strong_signal' then 'Esse tipo de ação tem mostrado mais resultado nas suas últimas tentativas.' when 'signal' then 'As últimas tentativas desse tipo tiveram alguns sinais positivos.' else 'Ainda estamos conhecendo o que faz mais sentido para o seu momento.' end,'next_focus',case when v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path then 'Vamos testar mais uma ação possível para o seu momento.' else 'Vamos concluir o básico para deixar a próxima ação possível.' end,'foundation',v_foundation);
end; $$;

create or replace function public.get_checkin()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_recent_not_moment integer; v_negative integer; v_due boolean; v_extraordinary boolean;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('required',false,'onboarding_required',true); end if;
  select count(*)::integer into v_recent_not_moment from (select reason from public.action_swaps where user_id=v_user order by created_at desc limit 2) recent where reason='not_for_my_moment';
  select count(*)::integer into v_negative from public.action_outcomes where user_id=v_user and finalized_at is not null and status='none';
  v_due := coalesce(v_profile.next_checkin_at<=pg_catalog.now(),false); v_extraordinary := v_recent_not_moment=2 or v_negative>=8;
  return jsonb_build_object('required',v_due or v_extraordinary,'reason',case when v_due then 'fortnight' when v_extraordinary then 'extraordinary' else null end,'extraordinary',v_extraordinary,'stage',v_profile.stage,'bottleneck',v_profile.current_bottleneck,'channels',v_profile.channels,'daily_available_minutes',v_profile.daily_available_minutes,'can_serve_next_7_days',v_profile.can_serve_next_7_days,'has_real_portfolio',v_profile.has_real_portfolio,'has_booking_path',v_profile.has_booking_path,'next_checkin_at',v_profile.next_checkin_at);
end; $$;

create or replace function public.save_checkin(p_stage public.user_stage, p_bottleneck public.bottleneck, p_channels text[], p_daily_available_minutes integer, p_can_serve_next_7_days boolean, p_has_real_portfolio boolean, p_has_booking_path boolean)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid(); v_checkin public.context_checkins%rowtype;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  if p_channels is null or cardinality(p_channels)=0 or not (p_channels <@ array['instagram','whatsapp','existing_clients','local_network','partnerships','none']::text[]) or ('none'=any(p_channels) and cardinality(p_channels)<>1) then raise exception using errcode='22023', message='invalid_channels'; end if;
  if p_daily_available_minutes not in (10,20,30,45) then raise exception using errcode='22023', message='invalid_daily_minutes'; end if;
  update public.recommendations set status='expired', expired_at=pg_catalog.now() where user_id=v_user and status in ('presented','opened','started');
  update public.business_profiles set stage=p_stage,current_bottleneck=p_bottleneck,channels=p_channels,daily_available_minutes=p_daily_available_minutes,can_serve_next_7_days=p_can_serve_next_7_days,has_real_portfolio=p_has_real_portfolio,has_booking_path=p_has_booking_path,next_checkin_at=pg_catalog.now()+interval '14 days',updated_at=pg_catalog.now() where user_id=v_user;
  insert into public.context_checkins (user_id,stage,bottleneck,channels,daily_available_minutes,can_serve_next_7_days,has_real_portfolio,has_booking_path,trigger)
  values(v_user,p_stage,p_bottleneck,p_channels,p_daily_available_minutes,p_can_serve_next_7_days,p_has_real_portfolio,p_has_booking_path,'fortnight') returning * into v_checkin;
  return jsonb_build_object('ok',true,'context_checkin_id',v_checkin.id,'next_checkin_at',pg_catalog.now()+interval '14 days');
end; $$;

create or replace function public.mark_recommendation_not_completed(p_recommendation_id uuid)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501', message='entitlement_required'; end if;
  update public.recommendations set status='not_completed' where id=p_recommendation_id and user_id=v_user and status='started';
  return found;
end; $$;

revoke all on function public.complete_recommendation(uuid,text) from public, anon;
grant execute on function public.complete_recommendation(uuid,text) to authenticated;
revoke all on function public.record_outcome(uuid,public.outcome_status) from public, anon;
grant execute on function public.record_outcome(uuid,public.outcome_status) to authenticated;
revoke all on function public.get_progress() from public, anon;
grant execute on function public.get_progress() to authenticated;
revoke all on function public.get_checkin() from public, anon;
grant execute on function public.get_checkin() to authenticated;
revoke all on function public.save_checkin(public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean) from public, anon;
grant execute on function public.save_checkin(public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean) to authenticated;
revoke all on function public.mark_recommendation_not_completed(uuid) from public, anon;
grant execute on function public.mark_recommendation_not_completed(uuid) to authenticated;
