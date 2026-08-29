-- Agenda 80/20 — Fase 9: domínio horizontal de serviços e agendamentos.
-- O conteúdo legado continua compatível com nail_design, mas novos cadastros
-- passam a registrar o nicho, serviço e contexto de atendimento.

create table if not exists public.service_niche_catalog (
  code text primary key,
  label text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_niche_catalog(code,label,description) values
  ('beauty','Beleza','Unhas, cabelo, sobrancelhas, estética e maquiagem'),
  ('health_wellness','Saúde e bem-estar','Terapias, massagens, pilates e atendimentos de cuidado'),
  ('local_services','Serviços locais','Serviços feitos na casa do cliente ou em um espaço local'),
  ('education','Educação','Aulas, reforço, idiomas e acompanhamento'),
  ('professional_services','Serviços profissionais','Consultoria, atendimento especializado e trabalho autônomo'),
  ('other','Outro serviço','Um serviço que não aparece nas opções acima')
on conflict (code) do update set label=excluded.label, description=excluded.description, active=true;

alter table public.business_profiles add column if not exists service_niche text not null default 'beauty';
alter table public.business_profiles add column if not exists service_name text not null default 'Meu serviço';
alter table public.business_profiles add column if not exists booking_mode text not null default 'in_person';
alter table public.business_profiles add column if not exists has_service_proof boolean not null default false;
alter table public.business_profiles add column if not exists proof_type text not null default 'none';

alter table public.context_checkins add column if not exists service_niche text not null default 'beauty';
alter table public.context_checkins add column if not exists service_name text not null default 'Meu serviço';
alter table public.context_checkins add column if not exists booking_mode text not null default 'in_person';
alter table public.context_checkins add column if not exists has_service_proof boolean not null default false;
alter table public.context_checkins add column if not exists proof_type text not null default 'none';

update public.business_profiles
set service_niche=case
  when profession in ('nail_design','hair_stylist','brows_lashes','esthetician','makeup_artist','beauty_other') then 'beauty'
  when profession='health_wellness' then 'health_wellness'
  when profession='local_service' then 'local_services'
  when profession='teacher' then 'education'
  when profession='professional' then 'professional_services'
  else coalesce(nullif(service_niche,''),'other')
end,
service_name=case when service_name='Meu serviço' and profession='nail_design' then 'Unhas / nail design' else service_name end,
has_service_proof=has_real_portfolio,
proof_type=case when has_real_portfolio then 'portfolio' else 'none' end;

update public.context_checkins
set service_niche=coalesce((select bp.service_niche from public.business_profiles bp where bp.user_id=context_checkins.user_id),'beauty'),
service_name=coalesce((select bp.service_name from public.business_profiles bp where bp.user_id=context_checkins.user_id),'Meu serviço'),
booking_mode=coalesce((select bp.booking_mode from public.business_profiles bp where bp.user_id=context_checkins.user_id),'in_person'),
has_service_proof=has_real_portfolio,
proof_type=case when has_real_portfolio then 'portfolio' else 'none' end;

alter table public.business_profiles drop constraint if exists business_profiles_service_niche_check;
alter table public.business_profiles add constraint business_profiles_service_niche_check check (service_niche in ('beauty','health_wellness','local_services','education','professional_services','other'));
alter table public.business_profiles drop constraint if exists business_profiles_booking_mode_check;
alter table public.business_profiles add constraint business_profiles_booking_mode_check check (booking_mode in ('in_person','online','hybrid','home_visit'));
alter table public.business_profiles drop constraint if exists business_profiles_proof_type_check;
alter table public.business_profiles add constraint business_profiles_proof_type_check check (proof_type in ('portfolio','testimonials','results','none'));
alter table public.context_checkins drop constraint if exists context_checkins_service_niche_check;
alter table public.context_checkins add constraint context_checkins_service_niche_check check (service_niche in ('beauty','health_wellness','local_services','education','professional_services','other'));
alter table public.context_checkins drop constraint if exists context_checkins_booking_mode_check;
alter table public.context_checkins add constraint context_checkins_booking_mode_check check (booking_mode in ('in_person','online','hybrid','home_visit'));
alter table public.context_checkins drop constraint if exists context_checkins_proof_type_check;
alter table public.context_checkins add constraint context_checkins_proof_type_check check (proof_type in ('portfolio','testimonials','results','none'));

alter table public.service_niche_catalog enable row level security;
revoke all on table public.service_niche_catalog from public, anon;
grant select on table public.service_niche_catalog to authenticated;
drop policy if exists service_niche_catalog_read on public.service_niche_catalog;
create policy service_niche_catalog_read on public.service_niche_catalog for select to authenticated using (active);

-- New controlled contract. The old RPC signatures remain available for older clients.
create or replace function public.save_onboarding_v2(
  p_name text, p_profession text, p_service_niche text, p_service_name text, p_booking_mode text,
  p_stage public.user_stage, p_bottleneck public.bottleneck, p_channels text[],
  p_daily_available_minutes integer, p_can_serve_next_7_days boolean,
  p_has_service_proof boolean, p_proof_type text, p_has_booking_path boolean,
  p_opportunity_signals text[]
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_result jsonb; v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if p_service_niche not in ('beauty','health_wellness','local_services','education','professional_services','other') then raise exception using errcode='22023',message='invalid_service_niche'; end if;
  if p_booking_mode not in ('in_person','online','hybrid','home_visit') then raise exception using errcode='22023',message='invalid_booking_mode'; end if;
  if p_proof_type not in ('portfolio','testimonials','results','none') then raise exception using errcode='22023',message='invalid_proof_type'; end if;
  if p_service_name is null or length(trim(p_service_name))=0 or length(trim(p_service_name))>120 then raise exception using errcode='22023',message='invalid_service_name'; end if;
  v_result:=public.save_onboarding(p_name,p_profession,p_stage,p_bottleneck,p_channels,p_daily_available_minutes,p_can_serve_next_7_days,p_has_service_proof,p_has_booking_path,p_opportunity_signals);
  update public.business_profiles set service_niche=p_service_niche,service_name=left(trim(p_service_name),120),booking_mode=p_booking_mode,has_service_proof=p_has_service_proof,proof_type=p_proof_type,updated_at=now() where user_id=v_user;
  update public.context_checkins set service_niche=p_service_niche,service_name=left(trim(p_service_name),120),booking_mode=p_booking_mode,has_service_proof=p_has_service_proof,proof_type=p_proof_type where id=(select c.id from public.context_checkins c where c.user_id=v_user order by c.created_at desc limit 1);
  return v_result||jsonb_build_object('service_niche',p_service_niche,'service_name',left(trim(p_service_name),120));
end; $$;
revoke all on function public.save_onboarding_v2(text,text,text,text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,text,boolean,text[]) from public,anon;
grant execute on function public.save_onboarding_v2(text,text,text,text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,text,boolean,text[]) to authenticated;

create or replace function public.save_checkin_v2(
  p_stage public.user_stage, p_bottleneck public.bottleneck, p_channels text[], p_opportunity_signals text[],
  p_daily_available_minutes integer, p_can_serve_next_7_days boolean,
  p_has_service_proof boolean, p_has_booking_path boolean
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_result jsonb; v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  v_result:=public.save_checkin(p_stage,p_bottleneck,p_channels,p_opportunity_signals,p_daily_available_minutes,p_can_serve_next_7_days,p_has_service_proof,p_has_booking_path);
  update public.business_profiles set has_service_proof=p_has_service_proof,has_real_portfolio=p_has_service_proof,proof_type=case when p_has_service_proof then 'results' else 'none' end,updated_at=now() where user_id=v_user;
  update public.context_checkins set has_service_proof=p_has_service_proof,has_real_portfolio=p_has_service_proof,proof_type=case when p_has_service_proof then 'results' else 'none' end where id=(select c.id from public.context_checkins c where c.user_id=v_user order by c.created_at desc limit 1);
  return v_result;
end; $$;
revoke all on function public.save_checkin_v2(public.user_stage,public.bottleneck,text[],text[],integer,boolean,boolean,boolean) from public,anon;
grant execute on function public.save_checkin_v2(public.user_stage,public.bottleneck,text[],text[],integer,boolean,boolean,boolean) to authenticated;

-- Editorial rows are immutable after publication. Their cross-niche copy and
-- eligibility are handled by a new action/message version, not by mutating
-- published records inside this schema migration.

comment on table public.business_profiles is 'Perfil horizontal de prestador de serviço: nicho, serviço, atendimento, prova e contexto comercial.';
comment on column public.business_profiles.profession is 'Código legado/operacional do tipo de serviço; nail_design permanece aceito para compatibilidade.';
comment on column public.business_profiles.service_niche is 'Nicho amplo do serviço, com beleza como foco inicial e demais categorias suportadas.';
comment on column public.business_profiles.service_name is 'Nome comercial ou descrição curta do serviço que será colocado em movimento.';

-- Treat all_services as a real wildcard so future service types do not require
-- a recommender migration every time a new niche is added.
create or replace function public.generate_next_recommendation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare
 v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_context public.context_checkins%rowtype;
 v_policy public.recommendation_policy_versions%rowtype; v_current public.recommendations%rowtype;
 v_action public.action_versions%rowtype; v_rec public.recommendations%rowtype;
 v_sequence int; v_limit int; v_completed int; v_has_gap boolean; v_score numeric;
 v_fit numeric; v_channel numeric; v_prior numeric; v_evidence numeric; v_viability numeric;
 v_weights jsonb; v_prior_weight numeric; v_half_life numeric; v_exploration_rate numeric;
 v_seed bigint; v_random numeric; v_explore boolean; v_why text; v_summary jsonb;
 v_confidence public.confidence_level; v_signal_outcomes int; v_signal_positive int;
 v_strong_outcomes int; v_strong_margin numeric;
begin
 if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
 if not public.can_access_agenda(v_user) then raise exception using errcode='42501',message='entitlement_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,8020));
 select * into v_profile from public.business_profiles where user_id=v_user;
 if not found then return jsonb_build_object('status','onboarding_required'); end if;
 select * into v_current from public.recommendations where user_id=v_user and status in('presented','opened','started') order by created_at desc limit 1;
 if found then select av.* into v_action from public.action_versions av where av.id=v_current.action_version_id;
   return jsonb_build_object('status','existing','recommendation_id',v_current.id,'action_version_id',v_current.action_version_id,
    'title',v_action.title,'short_description',v_action.short_description,'why_now',v_current.why_now_rendered,'duration_minutes',v_action.duration_minutes,
    'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),
    'exploration',v_current.exploration,'random_seed',v_current.random_seed);
 end if;
 select * into v_policy from public.recommendation_policy_versions where status='active' order by version desc limit 1;
 if not found then raise exception using errcode='55000',message='recommendation_policy_missing'; end if;
 v_weights:=coalesce(v_policy.params->'score_weights','{}');
 v_prior_weight:=greatest(0,coalesce((v_policy.params->>'prior_weight')::numeric,8));
 v_half_life:=greatest(.01,coalesce((v_policy.params->>'recency_half_life_days')::numeric,60));
 v_exploration_rate:=greatest(0,least(1,coalesce((v_policy.params->>'exploration_rate')::numeric,(v_policy.params->'exploration_rates'->>v_profile.daily_available_minutes::text)::numeric,(v_policy.params->'exploration_rates'->>'default')::numeric,0)));
 v_seed:=hashtextextended(v_user::text||':'||current_date::text||':'||v_policy.version::text,8020);
 v_random:=abs(mod(v_seed,100000))::numeric/100000.0; v_explore:=v_random<v_exploration_rate;
 select count(*) into v_completed from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed';
 v_limit:=greatest(1,coalesce((v_policy.params->'daily_limits'->>v_profile.daily_available_minutes::text)::int,3));
 if v_completed>=v_limit then return jsonb_build_object('status','daily_limit_reached','message','Você já fez o suficiente por hoje. Volte amanhã para continuar.'); end if;
 select * into v_context from public.context_checkins where user_id=v_user order by created_at desc limit 1;
 if not found then insert into public.context_checkins(user_id,stage,bottleneck,channels,daily_available_minutes,can_serve_next_7_days,has_real_portfolio,has_booking_path,opportunity_signals,trigger,service_niche,service_name,booking_mode,has_service_proof,proof_type)
   values(v_user,v_profile.stage,v_profile.current_bottleneck,v_profile.channels,v_profile.daily_available_minutes,v_profile.can_serve_next_7_days,v_profile.has_real_portfolio,v_profile.has_booking_path,v_profile.opportunity_signals,'engine',v_profile.service_niche,v_profile.service_name,v_profile.booking_mode,v_profile.has_service_proof,v_profile.proof_type) returning * into v_context; end if;
 v_has_gap:=not(v_profile.can_serve_next_7_days and v_profile.has_service_proof and v_profile.has_booking_path);
 select av.* into v_action from public.action_versions av join public.action_protocols ap on ap.id=av.protocol_id
 where av.status='published' and ap.active and not exists(select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number)
  and ('all_services'=any(av.eligible_professions) or av.eligible_professions @> array[v_profile.profession]::text[])
  and (cardinality(av.eligible_stages)=0 or v_profile.stage=any(av.eligible_stages))
  and (cardinality(av.eligible_bottlenecks)=0 or v_profile.current_bottleneck=any(av.eligible_bottlenecks)) and (cardinality(av.required_channels)=0 or v_profile.channels&&av.required_channels)
  and av.duration_minutes<=v_profile.daily_available_minutes and ((ap.action_type='foundation' and v_has_gap) or(ap.action_type='acquisition' and not v_has_gap))
  and (ap.action_type='foundation' or(v_profile.can_serve_next_7_days and v_profile.has_service_proof and v_profile.has_booking_path))
  and (coalesce((av.requirements->>'needs_can_serve_next_7_days')::boolean,false)=false or not v_profile.can_serve_next_7_days)
  and (coalesce((av.requirements->>'needs_has_real_portfolio')::boolean,false)=false or not v_profile.has_service_proof)
  and (coalesce((av.requirements->>'needs_has_booking_path')::boolean,false)=false or not v_profile.has_booking_path)
  and (coalesce((av.requirements->>'requires_context_signal')::boolean,false)=false or exists(select 1 from public.action_signal_requirements sr where sr.action_version_id=av.id and sr.signal_code=any(v_context.opportunity_signals)))
  and not exists(select 1 from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id and uap.block_until>now())
  and not exists(select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status<>'expired' and rr.created_at>now()-make_interval(hours=>av.cooldown_hours))
 order by (case when v_explore then hashtextextended(av.id::text||':'||v_seed::text,8020)::numeric/9223372036854775807.0 else
   ((case when v_profile.stage=any(av.eligible_stages) then 20 else 0 end+case when v_profile.current_bottleneck=any(av.eligible_bottlenecks) then 15 else 0 end)*coalesce((v_weights->>'fit')::numeric,35)/35
    +(case when cardinality(av.required_channels)=0 or v_profile.channels&&av.required_channels then 20 else 0 end)*coalesce((v_weights->>'channel')::numeric,20)/20
    +(av.editorial_prior*coalesce((v_weights->>'prior')::numeric,15))
    +case when ap.action_type='acquisition' then ((private.evidence_summary(v_user,ap.category,av.editorial_prior,v_prior_weight,v_half_life)->>'posterior')::numeric*coalesce((v_weights->>'evidence')::numeric,15)) else 0 end
    +coalesce((v_weights->>'viability')::numeric,5)+coalesce((select uap.weight_adjustment from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id),0)) end) desc,av.id asc limit 1;
 if not found then return jsonb_build_object('status','no_eligible_action','message','Não conseguimos encontrar uma ação possível agora. Vamos ajustar seu plano.'); end if;
 v_fit:=case when v_profile.stage=any(v_action.eligible_stages) then 20 else 0 end+case when v_profile.current_bottleneck=any(v_action.eligible_bottlenecks) then 15 else 0 end;
 v_channel:=case when cardinality(v_action.required_channels)=0 or v_profile.channels&&v_action.required_channels then 20 else 0 end;
 v_prior:=v_action.editorial_prior*coalesce((v_weights->>'prior')::numeric,15);
 v_summary:=private.evidence_summary(v_user,(select ap.category from public.action_protocols ap where ap.id=v_action.protocol_id),v_action.editorial_prior,v_prior_weight,v_half_life);
 v_evidence:=case when(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id)='acquisition' then (v_summary->>'posterior')::numeric*coalesce((v_weights->>'evidence')::numeric,15) else 0 end;
 v_viability:=coalesce((v_weights->>'viability')::numeric,5); v_score:=v_fit*coalesce((v_weights->>'fit')::numeric,35)/35+v_channel*coalesce((v_weights->>'channel')::numeric,20)/20+v_prior+v_evidence+v_viability;
 v_why:=case when v_has_gap then 'Vamos preparar o básico para a próxima ação de agendamento ficar possível.' else 'Esta é a próxima ação mais simples para o momento do seu serviço.' end;
 select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
 insert into public.recommendations(user_id,action_version_id,context_checkin_id,policy_version_id,sequence_number,score,score_components,why_now_rendered,exploration,random_seed)
 values(v_user,v_action.id,v_context.id,v_policy.id,v_sequence,v_score,jsonb_build_object('fit',v_fit,'channel',v_channel,'prior',v_prior,'evidence',v_evidence,'viability',v_viability,'confidence_level','learning','policy_params',jsonb_build_object('prior_weight',v_prior_weight,'recency_half_life_days',v_half_life)),v_why,v_explore,v_seed) returning * into v_rec;
 return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'score',v_score,'exploration',v_explore,'random_seed',v_seed);
end; $$;

create or replace function public.get_today_plan()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_plan jsonb; v_pending jsonb; v_pending_id uuid; v_checkin_required boolean:=false;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if not public.can_access_agenda(v_user) then raise exception using errcode='42501',message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('onboarding_required',true); end if;
  if exists(select 1 from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed') then v_plan:=jsonb_build_object('status','next_action_available','message','Você concluiu sua ação de hoje. Quando quiser, veja sua próxima ação.'); else v_plan:=public.generate_next_recommendation(); end if;
  select jsonb_build_object('outcome_id',ao.id,'recommendation_id',ae.recommendation_id,'title',av.title,'status',ao.status,'maturation_at',ao.maturation_at) into v_pending
  from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id join public.recommendations r on r.id=ae.recommendation_id join public.action_versions av on av.id=ae.action_version_id
  where ao.user_id=v_user and ao.status='pending' and ao.maturation_at<=pg_catalog.now() order by ao.maturation_at asc limit 1;
  if v_pending is not null then v_pending_id:=(v_pending->>'outcome_id')::uuid; update public.action_outcomes set last_prompted_at=pg_catalog.now() where id=v_pending_id and user_id=v_user and status='pending'; end if;
  v_checkin_required:=coalesce(v_profile.next_checkin_at<=pg_catalog.now(),false) or v_plan->>'status'='no_eligible_action';
  return jsonb_build_object('onboarding_required',false,'name',(select p.name from public.profiles p where p.user_id=v_user),'profession',v_profile.profession,'service_niche',v_profile.service_niche,'service_name',v_profile.service_name,'booking_mode',v_profile.booking_mode,
    'focus',case v_profile.current_bottleneck when 'first_clients' then 'Preparar o básico para conseguir seus primeiros agendamentos.' when 'low_visibility' then 'Fazer mais pessoas conhecerem seu serviço.' when 'low_conversion' then 'Transformar mais conversas em agendamentos.' when 'empty_slots' then 'Preencher horários que ainda estão vazios.' when 'low_return' then 'Fazer seus clientes voltarem.' end,
    'recommendation',v_plan,'pending_outcome',v_pending,'checkin_required',v_checkin_required);
end; $$;

create or replace function public.get_checkin()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_profile public.business_profiles%rowtype; v_recent_not_moment integer; v_negative integer; v_due boolean; v_extraordinary boolean;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if not exists(select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then raise exception using errcode='42501',message='entitlement_required'; end if;
  select * into v_profile from public.business_profiles where user_id=v_user;
  if not found then return jsonb_build_object('required',false,'onboarding_required',true); end if;
  select count(*)::integer into v_recent_not_moment from (select reason from public.action_swaps where user_id=v_user order by created_at desc limit 2) recent where reason='not_for_my_moment';
  select count(*)::integer into v_negative from public.action_outcomes where user_id=v_user and finalized_at is not null and status='none';
  v_due:=coalesce(v_profile.next_checkin_at<=pg_catalog.now(),false); v_extraordinary:=v_recent_not_moment=2 or v_negative>=8;
  return jsonb_build_object('required',v_due or v_extraordinary,'reason',case when v_due then 'fortnight' when v_extraordinary then 'extraordinary' else null end,'extraordinary',v_extraordinary,'stage',v_profile.stage,'bottleneck',v_profile.current_bottleneck,'channels',v_profile.channels,'opportunity_signals',v_profile.opportunity_signals,'daily_available_minutes',v_profile.daily_available_minutes,'can_serve_next_7_days',v_profile.can_serve_next_7_days,'has_service_proof',v_profile.has_service_proof,'has_real_portfolio',v_profile.has_real_portfolio,'has_booking_path',v_profile.has_booking_path,'service_niche',v_profile.service_niche,'service_name',v_profile.service_name,'booking_mode',v_profile.booking_mode,'proof_type',v_profile.proof_type,'next_checkin_at',v_profile.next_checkin_at);
end; $$;
