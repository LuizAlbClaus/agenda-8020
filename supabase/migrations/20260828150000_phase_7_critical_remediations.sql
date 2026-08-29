-- Agenda 80/20 — Fase 7: remediações críticas e controles operacionais.
-- Esta migration é incremental: versões publicadas e snapshots existentes não
-- são alterados. Aplicar somente após revisão e advisors.

-- 1) Refund/chargeback: approvals still require an active mapping, but a
-- terminal event is resolved from its recorded purchase and grant. This keeps
-- refunds correct after an offer mapping is deactivated.
create or replace function public.process_cakto_webhook_event(
  p_event_key text, p_event_type text, p_provider_order_id text,
  p_provider_ref_id text, p_product_id text, p_offer_id text, p_payload_hash text,
  p_customer_email text default null, p_customer_name text default null,
  p_user_id uuid default null, p_paid_at timestamptz default null,
  p_amount numeric default null
) returns jsonb language plpgsql security definer
set search_path = pg_catalog, public as $$
declare
  v_event_id uuid; v_mapping public.commerce_products%rowtype;
  v_purchase public.purchases%rowtype; v_grant public.entitlement_grants%rowtype;
  v_current public.entitlements%rowtype; v_base timestamptz; v_expires timestamptz;
  v_status text; v_valid_grants integer; v_max_expires timestamptz;
  v_min_starts timestamptz; v_order_found boolean := false;
begin
  if p_event_type not in ('purchase_approved','refund','chargeback') then
    raise exception using errcode='22023', message='invalid_event_type';
  end if;
  insert into public.payment_webhook_events(provider,event_key,event_type,provider_order_id,
    provider_ref_id,product_id,offer_id,payload_hash,processing_status)
  values('cakto',p_event_key,p_event_type,p_provider_order_id,p_provider_ref_id,
    p_product_id,p_offer_id,p_payload_hash,'processed')
  on conflict(event_key) do nothing returning id into v_event_id;
  if v_event_id is null then return jsonb_build_object('status','duplicate'); end if;

  if p_event_type = 'purchase_approved' then
    select * into v_mapping from public.commerce_products
    where provider='cakto' and provider_product_id=p_product_id
      and provider_offer_id=p_offer_id and active;
    if not found then
      update public.payment_webhook_events set processing_status='ignored',
        error_code='unknown_product',processed_at=now() where id=v_event_id;
      return jsonb_build_object('status','ignored','reason','unknown_product');
    end if;
    if exists(select 1 from public.payment_webhook_events
      where provider='cakto' and provider_order_id=p_provider_order_id
        and event_type in ('refund','chargeback')) then
      update public.payment_webhook_events set processing_status='ignored',
        error_code='terminal_order',processed_at=now() where id=v_event_id;
      return jsonb_build_object('status','ignored','reason','terminal_order');
    end if;
    if p_user_id is null or p_customer_email is null or p_paid_at is null then
      raise exception using errcode='22023', message='missing_purchase_identity';
    end if;
    select * into v_purchase from public.purchases
      where provider='cakto' and provider_order_id=p_provider_order_id for update;
    if found then
      update public.payment_webhook_events set processing_status='ignored',
        error_code='order_already_recorded',processed_at=now() where id=v_event_id;
      return jsonb_build_object('status','ignored','reason','order_already_recorded');
    end if;
    insert into public.purchases(provider,provider_order_id,provider_ref_id,product_id,offer_id,
      commerce_product_id,user_id,buyer_email,buyer_name,status,amount,paid_at)
    values('cakto',p_provider_order_id,p_provider_ref_id,p_product_id,p_offer_id,v_mapping.id,
      p_user_id,lower(trim(p_customer_email)),nullif(trim(p_customer_name),''),'paid',p_amount,p_paid_at)
    returning * into v_purchase;
    perform pg_advisory_xact_lock(hashtextextended(v_mapping.internal_product_code||':'||p_user_id::text,0));
    select * into v_current from public.entitlements where user_id=p_user_id
      and product_code=v_mapping.internal_product_code and status='active' for update;
    v_base:=greatest(coalesce(v_current.expires_at,p_paid_at),p_paid_at);
    v_expires:=v_base+make_interval(days=>v_mapping.access_days);
    insert into public.entitlement_grants(user_id,product_code,purchase_id,starts_at,expires_at,status)
    values(p_user_id,v_mapping.internal_product_code,v_purchase.id,p_paid_at,v_expires,'active')
    returning * into v_grant;
    insert into public.entitlements(user_id,product_code,status,starts_at,expires_at)
    values(p_user_id,v_mapping.internal_product_code,'active',p_paid_at,v_expires)
    on conflict(user_id,product_code) do update set status='active',
      starts_at=least(public.entitlements.starts_at,excluded.starts_at),
      expires_at=greatest(public.entitlements.expires_at,excluded.expires_at),updated_at=now();
    update public.profiles set name=coalesce(nullif(trim(p_customer_name),''),name)
      where user_id=p_user_id and (name is null or name='');
    insert into public.email_outbox(idempotency_key,template_key,recipient_email,recipient_name,user_id,payload)
    values('access_granted:'||v_purchase.id::text,'access_granted',lower(trim(p_customer_email)),
      nullif(trim(p_customer_name),''),p_user_id,jsonb_build_object('product_code',v_mapping.internal_product_code,
      'expires_at',v_expires,'access_days',v_mapping.access_days)) on conflict(idempotency_key) do nothing;
    update public.payment_webhook_events set processed_at=now() where id=v_event_id;
    return jsonb_build_object('status','processed','purchase_id',v_purchase.id,'grant_id',v_grant.id);
  end if;

  -- Do not consult commerce_products.active for terminal events. The purchase
  -- retains commerce_product_id and product_code is read from its grant.
  select * into v_purchase from public.purchases
    where provider='cakto' and provider_order_id=p_provider_order_id for update;
  if found then
    v_order_found:=true;
    v_status:=case when p_event_type='refund' then 'refunded' else 'chargedback' end;
    update public.purchases set status=v_status where id=v_purchase.id;
    update public.entitlement_grants set status='revoked'
      where purchase_id=v_purchase.id and status='active';
    select count(*),max(expires_at),min(starts_at) into v_valid_grants,v_max_expires,v_min_starts
      from public.entitlement_grants where user_id=v_purchase.user_id
        and product_code=(select eg.product_code from public.entitlement_grants eg where eg.purchase_id=v_purchase.id)
        and status='active' and expires_at>now();
    if v_valid_grants>0 then
      update public.entitlements set status='active',starts_at=v_min_starts,
        expires_at=v_max_expires,updated_at=now() where user_id=v_purchase.user_id
        and product_code=(select eg.product_code from public.entitlement_grants eg where eg.purchase_id=v_purchase.id);
    else
      update public.entitlements set status='revoked',updated_at=now() where user_id=v_purchase.user_id
        and product_code=coalesce((select eg.product_code from public.entitlement_grants eg where eg.purchase_id=v_purchase.id),
          (select cp.internal_product_code from public.commerce_products cp where cp.id=v_purchase.commerce_product_id));
    end if;
  end if;
  update public.payment_webhook_events set processed_at=now(),
    processing_status=case when v_order_found then 'processed' else 'ignored' end,
    error_code=case when v_order_found then null else 'order_not_found' end where id=v_event_id;
  return jsonb_build_object('status',case when v_order_found then 'processed' else 'ignored' end);
end; $$;
revoke all on function public.process_cakto_webhook_event(text,text,text,text,text,text,text,text,text,uuid,timestamptz,numeric) from public,anon,authenticated;
grant execute on function public.process_cakto_webhook_event(text,text,text,text,text,text,text,text,text,uuid,timestamptz,numeric) to service_role;

-- 2) Explicit, non-PII opportunity signals. Existing published action content
-- remains immutable; this relation is the eligibility index for signal-gated
-- actions and is future-extensible by editorial admins.
create table if not exists public.opportunity_signal_catalog (
  code text primary key check (code=lower(code) and code ~ '^[a-z0-9_]{2,64}$'),
  description text not null, active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.opportunity_signal_catalog(code,description) values
 ('conversation_paused','A legitimate conversation stopped without a decision'),
 ('price_question','A person asked a concrete price question'),
 ('objection_raised','A person raised a concrete objection'),
 ('positive_experience','A client reported a positive experience'),
 ('previous_client','The person was served previously'),
 ('referral_permission','A satisfied client authorized a referral ask'),
 ('local_demand','A legitimate local demand was observed'),
 ('warm_contact','A warm contact context exists'),
 ('partner_context','A complementary business context exists'),
 ('none','No opportunity signal is currently available')
on conflict(code) do nothing;
alter table public.context_checkins add column if not exists opportunity_signals text[] not null default '{}';
alter table public.business_profiles add column if not exists opportunity_signals text[] not null default '{}';
create table if not exists public.action_signal_requirements (
  action_version_id uuid not null references public.action_versions(id) on delete restrict,
  signal_code text not null references public.opportunity_signal_catalog(code) on delete restrict,
  created_at timestamptz not null default now(),
  primary key(action_version_id,signal_code)
);
create index if not exists action_signal_requirements_signal_idx on public.action_signal_requirements(signal_code,action_version_id);
alter table public.opportunity_signal_catalog enable row level security;
alter table public.action_signal_requirements enable row level security;
revoke all on table public.opportunity_signal_catalog,public.action_signal_requirements from public,anon,authenticated;
grant select on table public.opportunity_signal_catalog to authenticated;
create policy opportunity_signal_catalog_read on public.opportunity_signal_catalog for select to authenticated using(active);
create policy action_signal_requirements_read on public.action_signal_requirements for select to authenticated using(true);
insert into public.action_signal_requirements(action_version_id,signal_code)
select av.id, s.code from public.action_versions av join public.action_protocols ap on ap.id=av.protocol_id
join (values
  ('CONV_01_PRICE_REOPEN','price_question'),('CONV_02_PAUSED_CONVERSATION','conversation_paused'),
  ('CONV_03_TWO_REAL_SLOTS','price_question'),('CONV_04_OBJECTION','objection_raised'),
  ('REACT_01_PREVIOUS_CLIENT','previous_client'),('RETURN_01_NEXT_VISIT','positive_experience'),
  ('REF_01_ASK_REFERRAL','referral_permission'),('PROOF_01_REQUEST_REVIEW','positive_experience'),
  ('LOCAL_01_EXISTING_DEMAND','local_demand'),('LOCAL_02_WARM_NETWORK','warm_contact'),
  ('PARTNER_01_COMPLEMENTARY_BUSINESS','partner_context')) as s(slug,code) on s.slug=ap.slug
on conflict do nothing;

create or replace function private.validate_opportunity_signals(p_signals text[])
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if p_signals is null or cardinality(p_signals)=0 then return; end if;
  if exists(select 1 from unnest(p_signals) x(code)
    where code is null or length(code)>64 or code<>lower(code)
      or not exists(select 1 from public.opportunity_signal_catalog c where c.code=code and c.active)) then
    raise exception using errcode='22023',message='invalid_opportunity_signals';
  end if;
end; $$;
revoke all on function private.validate_opportunity_signals(text[]) from public,anon,authenticated;

create or replace function public.save_opportunity_signals(p_signals text[])
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_signals text[]:=coalesce(p_signals,'{}');
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if not public.can_access_agenda(v_user) then raise exception using errcode='42501',message='entitlement_required'; end if;
  perform private.validate_opportunity_signals(v_signals);
  update public.business_profiles set opportunity_signals=v_signals,updated_at=now() where user_id=v_user;
  update public.context_checkins set opportunity_signals=v_signals where id=(select id from public.context_checkins where user_id=v_user order by created_at desc limit 1);
  return jsonb_build_object('ok',true,'signals',to_jsonb(v_signals));
end; $$;
revoke all on function public.save_opportunity_signals(text[]) from public,anon;
grant execute on function public.save_opportunity_signals(text[]) to authenticated;

-- 3) Policy-aware, deterministic recommender. Policy weights and decay are
-- read at runtime. A seeded hash provides reproducible exploration while all
-- hard eligibility checks remain mandatory.
create or replace function private.evidence_summary(p_user_id uuid,p_category text,p_prior numeric,p_prior_weight numeric,p_half_life_days numeric)
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
with observations as (
 select case ao.status when 'booking' then 1.0 when 'interest' then .35 else 0 end /
   greatest(1,least(coalesce(ae.exposure_count,1),3)) normalized_result,
   power(.5,greatest(0,extract(epoch from(now()-ao.finalized_at))/86400.0)/greatest(.01,p_half_life_days)) recency_weight,ao.status
 from public.action_executions ae join public.action_outcomes ao on ao.execution_id=ae.id
 join public.action_versions av on av.id=ae.action_version_id join public.action_protocols ap on ap.id=av.protocol_id
 where ae.user_id=p_user_id and ap.category=p_category and ap.action_type='acquisition'
   and ao.status<>'pending' and ao.finalized_at is not null
), aggregate as (
 select count(*)::int comparable_count,count(*) filter(where status in('interest','booking'))::int positive_count,
   coalesce(sum(recency_weight*normalized_result),0)::numeric weighted_result,coalesce(sum(recency_weight),0)::numeric weight_sum from observations)
select jsonb_build_object('posterior',((greatest(0,p_prior_weight)*greatest(0,least(1,p_prior))+weighted_result)/
  greatest(.0001,greatest(0,p_prior_weight)+weight_sum)),'comparable_count',comparable_count,'positive_count',positive_count) from aggregate;
$$;
revoke all on function private.evidence_summary(uuid,text,numeric,numeric,numeric) from public,anon,authenticated;

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
 v_exploration_rate:=greatest(0,least(1,coalesce(
   (v_policy.params->>'exploration_rate')::numeric,
   (v_policy.params->'exploration_rates'->>v_profile.daily_available_minutes::text)::numeric,
   (v_policy.params->'exploration_rates'->>'default')::numeric,0)));
 v_seed:=hashtextextended(v_user::text||':'||current_date::text||':'||v_policy.version::text,8020);
 v_random:=abs(mod(v_seed,100000))::numeric/100000.0; v_explore:=v_random<v_exploration_rate;
 select count(*) into v_completed from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed';
 v_limit:=greatest(1,coalesce((v_policy.params->'daily_limits'->>v_profile.daily_available_minutes::text)::int,3));
 if v_completed>=v_limit then return jsonb_build_object('status','daily_limit_reached','message','Você já fez o suficiente por hoje. Volte amanhã para continuar.'); end if;
 select * into v_context from public.context_checkins where user_id=v_user order by created_at desc limit 1;
 if not found then insert into public.context_checkins(user_id,stage,bottleneck,channels,daily_available_minutes,can_serve_next_7_days,has_real_portfolio,has_booking_path,opportunity_signals,trigger)
   values(v_user,v_profile.stage,v_profile.current_bottleneck,v_profile.channels,v_profile.daily_available_minutes,v_profile.can_serve_next_7_days,v_profile.has_real_portfolio,v_profile.has_booking_path,v_profile.opportunity_signals,'engine') returning * into v_context; end if;
 v_has_gap:=not(v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path);
 select av.* into v_action from public.action_versions av join public.action_protocols ap on ap.id=av.protocol_id
 where av.status='published' and ap.active and not exists(select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number)
  and av.eligible_professions @> array[v_profile.profession]::text[] and (cardinality(av.eligible_stages)=0 or v_profile.stage=any(av.eligible_stages))
  and (cardinality(av.eligible_bottlenecks)=0 or v_profile.current_bottleneck=any(av.eligible_bottlenecks)) and (cardinality(av.required_channels)=0 or v_profile.channels&&av.required_channels)
  and av.duration_minutes<=v_profile.daily_available_minutes and ((ap.action_type='foundation' and v_has_gap) or(ap.action_type='acquisition' and not v_has_gap))
  and (ap.action_type='foundation' or(v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path))
  and (coalesce((av.requirements->>'needs_can_serve_next_7_days')::boolean,false)=false or not v_profile.can_serve_next_7_days)
  and (coalesce((av.requirements->>'needs_has_real_portfolio')::boolean,false)=false or not v_profile.has_real_portfolio)
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
 v_why:=case when v_has_gap then 'Vamos preparar o básico para a próxima ação ficar possível.' else 'Esta é a próxima ação mais simples para o seu momento.' end;
 select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
 insert into public.recommendations(user_id,action_version_id,context_checkin_id,policy_version_id,sequence_number,score,score_components,why_now_rendered,exploration,random_seed)
 values(v_user,v_action.id,v_context.id,v_policy.id,v_sequence,v_score,jsonb_build_object('fit',v_fit,'channel',v_channel,'prior',v_prior,'evidence',v_evidence,'viability',v_viability,'confidence_level','learning','policy_params',jsonb_build_object('prior_weight',v_prior_weight,'recency_half_life_days',v_half_life)),v_why,v_explore,v_seed) returning * into v_rec;
 return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'score',v_score,'exploration',v_explore,'random_seed',v_seed);
end; $$;
revoke all on function public.generate_next_recommendation() from public,anon;
grant execute on function public.generate_next_recommendation() to authenticated;

-- 4) Audited support/admin correction for a purchase email. The provider order,
-- refund path and user identity remain immutable; only the recorded buyer and
-- pending outbox destination are corrected.
create or replace function public.admin_correct_purchase_email(p_purchase_id uuid,p_new_email text,p_reason text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_actor uuid:=private.require_any_role(array['support','admin']::public.app_role[]); b public.purchases%rowtype; r public.purchases%rowtype; v_email text;
begin
 v_email:=lower(trim(p_new_email));
 if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email)>320 then raise exception using errcode='22023',message='invalid_email'; end if;
 if nullif(trim(p_reason),'') is null or length(trim(p_reason))>500 then raise exception using errcode='22023',message='correction_reason_required'; end if;
 select * into b from public.purchases where id=p_purchase_id for update;
 if not found then raise exception using errcode='22023',message='purchase_not_found'; end if;
 update public.purchases set buyer_email=v_email where id=p_purchase_id returning * into r;
 update public.email_outbox set recipient_email=v_email,updated_at=now()
   where user_id=r.user_id and idempotency_key='access_granted:'||p_purchase_id::text and status in('pending','failed');
 perform private.write_admin_audit('correct_purchase_email','purchase',p_purchase_id,
   jsonb_build_object('buyer_email',b.buyer_email,'provider_order_id',b.provider_order_id,'status',b.status,'reason',p_reason),
   jsonb_build_object('buyer_email',r.buyer_email,'provider_order_id',r.provider_order_id,'status',r.status,'reason',p_reason));
 return jsonb_build_object('ok',true,'purchase_id',p_purchase_id,'buyer_email',r.buyer_email);
end; $$;
revoke all on function public.admin_correct_purchase_email(uuid,text,text) from public,anon;
grant execute on function public.admin_correct_purchase_email(uuid,text,text) to authenticated;

-- 5) LGPD requests and controlled anonymization. Financial/provider identity
-- needed for reconciliation is retained, while direct personal fields are
-- minimized. Processing is service-only and every request is audited.
create table if not exists public.privacy_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 request_type text not null check(request_type in('export','delete')), status text not null default 'requested' check(status in('requested','processing','completed','rejected')),
 requested_at timestamptz not null default now(), completed_at timestamptz, result jsonb
);
create index if not exists privacy_requests_user_status_idx on public.privacy_requests(user_id,status,requested_at desc);
alter table public.privacy_requests enable row level security;
revoke all on table public.privacy_requests from public,anon,authenticated;
grant select,insert on table public.privacy_requests to authenticated;
create policy privacy_requests_owner on public.privacy_requests for select to authenticated using((select auth.uid())=user_id);
create policy privacy_requests_insert on public.privacy_requests for insert to authenticated with check((select auth.uid())=user_id);
create or replace function public.request_privacy_export() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid:=auth.uid(); r uuid; begin if v is null then raise exception using errcode='28000',message='authentication_required'; end if; insert into public.privacy_requests(user_id,request_type) values(v,'export') returning id into r; return jsonb_build_object('request_id',r,'status','requested'); end; $$;
create or replace function public.request_privacy_deletion() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid:=auth.uid(); r uuid; begin if v is null then raise exception using errcode='28000',message='authentication_required'; end if; insert into public.privacy_requests(user_id,request_type) values(v,'delete') returning id into r; return jsonb_build_object('request_id',r,'status','requested'); end; $$;
create or replace function public.get_privacy_export() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid:=auth.uid(); begin if v is null then raise exception using errcode='28000',message='authentication_required'; end if; return jsonb_build_object('auth',(select jsonb_build_object('email',u.email,'created_at',u.created_at) from auth.users u where u.id=v),'profile',(select to_jsonb(p)-'user_id' from public.profiles p where p.user_id=v),'business_profile',(select to_jsonb(b)-'user_id' from public.business_profiles b where b.user_id=v),'context_checkins',(select coalesce(jsonb_agg(to_jsonb(c)-'user_id'),'[]') from public.context_checkins c where c.user_id=v),'recommendations',(select coalesce(jsonb_agg(to_jsonb(r)-'user_id'),'[]') from public.recommendations r where r.user_id=v),'executions',(select coalesce(jsonb_agg(to_jsonb(e)-'user_id'),'[]') from public.action_executions e where e.user_id=v),'outcomes',(select coalesce(jsonb_agg(to_jsonb(o)-'user_id'),'[]') from public.action_outcomes o where o.user_id=v),'preferences',(select coalesce(jsonb_agg(to_jsonb(p)-'user_id'),'[]') from public.user_action_preferences p where p.user_id=v),'purchases',(select coalesce(jsonb_agg(to_jsonb(p)-'user_id'),'[]') from public.purchases p where p.user_id=v),'entitlements',(select coalesce(jsonb_agg(to_jsonb(e)-'user_id'),'[]') from public.entitlements e where e.user_id=v),'privacy_requests',(select coalesce(jsonb_agg(to_jsonb(r)-'user_id'),'[]') from public.privacy_requests r where r.user_id=v)); end; $$;
create or replace function public.process_privacy_deletion(p_request_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare r public.privacy_requests%rowtype; begin if current_setting('request.jwt.claim.role',true)<>'service_role' then raise exception using errcode='42501',message='service_role_required'; end if; select * into r from public.privacy_requests where id=p_request_id and request_type='delete' and status='requested' for update; if not found then raise exception using errcode='22023',message='privacy_request_not_found'; end if; update public.profiles set name=null,locale='pt-BR',timezone='America/Sao_Paulo' where user_id=r.user_id; update public.business_profiles set channels='{}',opportunity_signals='{}',updated_at=now() where user_id=r.user_id; update public.context_checkins set channels='{}',opportunity_signals='{}' where user_id=r.user_id; update public.analytics_events set user_id=null,properties='{}' where user_id=r.user_id; update public.email_outbox set recipient_email='deleted+'||md5(r.user_id::text)||'@invalid.local',recipient_name=null,status='suppressed',updated_at=now() where user_id=r.user_id; update public.privacy_requests set status='completed',completed_at=now(),result=jsonb_build_object('anonymized',true,'financial_records_retained',true) where id=r.id; return jsonb_build_object('ok',true,'request_id',r.id,'status','completed'); end; $$;
revoke all on function public.request_privacy_export() from public,anon; grant execute on function public.request_privacy_export() to authenticated;
revoke all on function public.request_privacy_deletion() from public,anon; grant execute on function public.request_privacy_deletion() to authenticated;
revoke all on function public.get_privacy_export() from public,anon; grant execute on function public.get_privacy_export() to authenticated;
revoke all on function public.process_privacy_deletion(uuid) from public,anon,authenticated; grant execute on function public.process_privacy_deletion(uuid) to service_role;

create table if not exists public.privacy_retention_config(
  key text primary key check(key in('analytics_days','email_days','checkin_days')),
  retention_days integer not null check(retention_days between 30 and 3650),
  updated_at timestamptz not null default now()
);
insert into public.privacy_retention_config(key,retention_days) values
 ('analytics_days',730),('email_days',730),('checkin_days',730) on conflict(key) do nothing;
alter table public.privacy_retention_config enable row level security;
revoke all on table public.privacy_retention_config from public,anon,authenticated;
create or replace function public.enforce_privacy_retention() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_analytics integer:=730; v_email integer:=730; v_checkin integer:=730; v_a integer:=0; v_e integer:=0;
begin
 if current_setting('request.jwt.claim.role',true)<>'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
 select retention_days into v_analytics from public.privacy_retention_config where key='analytics_days';
 select retention_days into v_email from public.privacy_retention_config where key='email_days';
 select retention_days into v_checkin from public.privacy_retention_config where key='checkin_days';
 update public.analytics_events set user_id=null,properties='{}' where server_created_at<now()-make_interval(days=>v_analytics) and (user_id is not null or properties<>'{}'::jsonb);
 get diagnostics v_a=row_count;
 update public.email_outbox set recipient_email='retained+'||md5(id::text)||'@invalid.local',recipient_name=null,status='suppressed',updated_at=now()
   where created_at<now()-make_interval(days=>v_email) and template_key not in('access_granted','auth_magic_link') and status<>'suppressed';
 get diagnostics v_e=row_count;
 -- Check-ins are referenced by recommendation snapshots, so retention is
 -- implemented as minimization rather than destructive deletion.
 update public.context_checkins set channels='{}',opportunity_signals='{}'
   where created_at<now()-make_interval(days=>v_checkin) and (channels<>'{}' or opportunity_signals<>'{}');
 return jsonb_build_object('analytics_anonymized',v_a,'emails_suppressed',v_e,'checkins_minimized',true);
end; $$;
revoke all on function public.enforce_privacy_retention() from public,anon,authenticated; grant execute on function public.enforce_privacy_retention() to service_role;

-- 6) Analytics allowlist and a server-side insertion helper; no direct table
-- writes remain available to clients and properties are limited to non-PII keys.
create table if not exists public.analytics_event_allowlist(event_name text primary key, allowed_keys text[] not null default '{}', active boolean not null default true);
insert into public.analytics_event_allowlist(event_name,allowed_keys) values
 ('onboarding_completed','{profession,stage,bottleneck,opportunity_signal_count}'),
 ('recommendation_shown','{has_recommendation,status}'),
 ('action_started','{}'),('action_completed','{}'),('outcome_recorded','{}'),
 ('swap_requested','{}'),('checkin_completed','{stage,bottleneck,opportunity_signal_count}'),
 ('benefit_activated','{}'),('data_export_requested','{}'),
 ('account_deletion_requested','{}'),('support_email_correction_requested','{}') on conflict do nothing;
alter table public.analytics_event_allowlist enable row level security;
revoke all on table public.analytics_event_allowlist from public,anon,authenticated;
create or replace function public.record_analytics_event(p_event_name text,p_event_id text,p_properties jsonb default '{}'::jsonb,p_client_created_at timestamptz default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid:=auth.uid(); a public.analytics_event_allowlist%rowtype; k text; begin if v is null then raise exception using errcode='28000',message='authentication_required'; end if; select * into a from public.analytics_event_allowlist where event_name=p_event_name and active; if not found then raise exception using errcode='22023',message='analytics_event_not_allowed'; end if; if jsonb_typeof(coalesce(p_properties,'{}'::jsonb))<>'object' then raise exception using errcode='22023',message='analytics_properties_object_required'; end if; if coalesce(p_properties,'{}'::jsonb)::text ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then raise exception using errcode='22023',message='analytics_pii_not_allowed'; end if; for k in select jsonb_object_keys(coalesce(p_properties,'{}'::jsonb)) loop if not(k=any(a.allowed_keys)) then raise exception using errcode='22023',message='analytics_property_not_allowed'; end if; end loop; insert into public.analytics_events(user_id,event_name,event_id,properties,client_created_at) values(v,p_event_name,p_event_id,coalesce(p_properties,'{}'::jsonb),p_client_created_at) on conflict(event_id) do nothing; return jsonb_build_object('ok',true); end; $$;
revoke insert,select on table public.analytics_events from authenticated;
revoke all on function public.record_analytics_event(text,text,jsonb,timestamptz) from public,anon; grant execute on function public.record_analytics_event(text,text,jsonb,timestamptz) to authenticated;

-- 7) Shared DB primitive for endpoint-specific rate limiting. Callers pass a
-- one-way subject key (never an email); buckets are not client-readable.
create table if not exists public.rate_limit_buckets(scope text not null,subject_hash text not null,window_started_at timestamptz not null,count integer not null default 0,updated_at timestamptz not null default now(),primary key(scope,subject_hash));
alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from public,anon,authenticated;
create or replace function public.consume_rate_limit(p_scope text,p_subject_hash text,p_limit integer,p_window_seconds integer) returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$ declare v_now timestamptz:=clock_timestamp(); b public.rate_limit_buckets%rowtype; begin if p_scope not in('login','cakto_webhook','admin_mutation','belevy_activation') or p_subject_hash is null or length(p_subject_hash)<16 or length(p_subject_hash)>128 or p_limit<1 or p_window_seconds<1 then raise exception using errcode='22023',message='invalid_rate_limit_input'; end if; perform pg_advisory_xact_lock(hashtextextended(p_scope||':'||p_subject_hash,8020)); select * into b from public.rate_limit_buckets where scope=p_scope and subject_hash=p_subject_hash for update; if not found or v_now>=b.window_started_at+make_interval(secs=>p_window_seconds) then insert into public.rate_limit_buckets(scope,subject_hash,window_started_at,count) values(p_scope,p_subject_hash,v_now,1) on conflict(scope,subject_hash) do update set window_started_at=excluded.window_started_at,count=1,updated_at=v_now; return true; end if; if b.count>=p_limit then update public.rate_limit_buckets set updated_at=v_now where scope=p_scope and subject_hash=p_subject_hash; return false; end if; update public.rate_limit_buckets set count=count+1,updated_at=v_now where scope=p_scope and subject_hash=p_subject_hash; return true; end; $$;
revoke all on function public.consume_rate_limit(text,text,integer,integer) from public; grant execute on function public.consume_rate_limit(text,text,integer,integer) to anon,authenticated,service_role;

-- Compatibility overloads keep the mobile forms on a single, explicit RPC
-- contract while the original Phase 2 signatures remain available to existing clients.
create or replace function public.save_onboarding(
  p_name text, p_profession text, p_stage public.user_stage, p_bottleneck public.bottleneck,
  p_channels text[], p_daily_available_minutes integer, p_can_serve_next_7_days boolean,
  p_has_real_portfolio boolean, p_has_booking_path boolean, p_opportunity_signals text[]
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_result jsonb;
begin
  perform private.validate_opportunity_signals(p_opportunity_signals);
  v_result:=public.save_onboarding(p_name,p_profession,p_stage,p_bottleneck,p_channels,p_daily_available_minutes,p_can_serve_next_7_days,p_has_real_portfolio,p_has_booking_path);
  perform public.save_opportunity_signals(p_opportunity_signals);
  return v_result;
end; $$;
revoke all on function public.save_onboarding(text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean,text[]) from public,anon;
grant execute on function public.save_onboarding(text,text,public.user_stage,public.bottleneck,text[],integer,boolean,boolean,boolean,text[]) to authenticated;

create or replace function public.save_checkin(
  p_stage public.user_stage, p_bottleneck public.bottleneck, p_channels text[], p_opportunity_signals text[],
  p_daily_available_minutes integer, p_can_serve_next_7_days boolean, p_has_real_portfolio boolean, p_has_booking_path boolean
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_result jsonb;
begin
  perform private.validate_opportunity_signals(p_opportunity_signals);
  v_result:=public.save_checkin(p_stage,p_bottleneck,p_channels,p_daily_available_minutes,p_can_serve_next_7_days,p_has_real_portfolio,p_has_booking_path);
  perform public.save_opportunity_signals(p_opportunity_signals);
  return v_result;
end; $$;
revoke all on function public.save_checkin(public.user_stage,public.bottleneck,text[],text[],integer,boolean,boolean,boolean) from public,anon;
grant execute on function public.save_checkin(public.user_stage,public.bottleneck,text[],text[],integer,boolean,boolean,boolean) to authenticated;

-- Names used by the settings surface; the underlying records stay in privacy_requests.
create or replace function public.request_data_export() returns jsonb language sql security definer set search_path=pg_catalog,public as $$ select public.request_privacy_export(); $$;
create or replace function public.request_account_deletion() returns jsonb language sql security definer set search_path=pg_catalog,public as $$ select public.request_privacy_deletion(); $$;
revoke all on function public.request_data_export(),public.request_account_deletion() from public,anon;
grant execute on function public.request_data_export(),public.request_account_deletion() to authenticated;

comment on table public.privacy_requests is 'Fase 7: pedidos LGPD de exportação/anonymização, processados com auditoria.';
comment on table public.action_signal_requirements is 'Fase 7: pré-requisitos de oportunidade por versão editorial; nunca bypassa hard filters.';
