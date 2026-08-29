-- Fase 3 incremental delta: avoid PL/pgSQL variable/alias ambiguity in daily limits.
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
    return jsonb_build_object('status','existing','recommendation_id',v_current.id,'action_version_id',v_current.action_version_id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_current.why_now_rendered,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'confidence_level',coalesce(v_current.score_components->>'confidence_level','learning'));
  end if;
  select count(*) into v_completed from public.recommendations where user_id=v_user and recommendation_date=current_date and status='completed';
  select greatest(1, coalesce((policy_row.params->'daily_limits'->>v_profile.daily_available_minutes::text)::integer, 3)) into v_limit
  from public.recommendation_policy_versions policy_row where policy_row.status='active' order by policy_row.version desc limit 1;
  if coalesce(v_completed,0) >= coalesce(v_limit,3) then
    return jsonb_build_object('status','daily_limit_reached','message','Você já fez o suficiente por hoje. Volte amanhã para continuar.');
  end if;
  select * into v_context from public.context_checkins where user_id=v_user order by created_at desc limit 1;
  if not found then
    insert into public.context_checkins (user_id, stage, bottleneck, channels, daily_available_minutes, can_serve_next_7_days, has_real_portfolio, has_booking_path, trigger)
    values (v_user, v_profile.stage, v_profile.current_bottleneck, v_profile.channels, v_profile.daily_available_minutes, v_profile.can_serve_next_7_days, v_profile.has_real_portfolio, v_profile.has_booking_path, 'engine') returning * into v_context;
  end if;
  select * into v_policy from public.recommendation_policy_versions where status='active' order by version desc limit 1;
  if not found then raise exception using errcode='55000', message='recommendation_policy_missing'; end if;
  v_has_readiness_gap := not (v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path); v_is_foundation := v_has_readiness_gap;
  select av.* into v_action from public.action_versions av join public.action_protocols ap on ap.id=av.protocol_id
  where av.status='published' and ap.active
    and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number)
    and av.eligible_professions @> array[v_profile.profession]::text[] and (cardinality(av.eligible_stages)=0 or v_profile.stage=any(av.eligible_stages))
    and (cardinality(av.eligible_bottlenecks)=0 or v_profile.current_bottleneck=any(av.eligible_bottlenecks)) and (cardinality(av.required_channels)=0 or (v_profile.channels && av.required_channels))
    and av.duration_minutes <= v_profile.daily_available_minutes and ((ap.action_type='foundation' and v_is_foundation) or (ap.action_type='acquisition' and not v_is_foundation))
    and (ap.action_type='foundation' or (v_profile.can_serve_next_7_days and v_profile.has_real_portfolio and v_profile.has_booking_path))
    and (coalesce((av.requirements->>'needs_can_serve_next_7_days')::boolean,false) = false or not v_profile.can_serve_next_7_days)
    and (coalesce((av.requirements->>'needs_has_real_portfolio')::boolean,false) = false or not v_profile.has_real_portfolio)
    and (coalesce((av.requirements->>'needs_has_booking_path')::boolean,false) = false or not v_profile.has_booking_path)
    and (coalesce((av.requirements->>'requires_context_signal')::boolean,false) = false)
    and not exists (select 1 from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id and uap.block_until>pg_catalog.now())
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status <> 'expired' and rr.created_at > pg_catalog.now() - make_interval(hours => av.cooldown_hours))
    and not exists (select 1 from public.recommendations rr join public.action_versions oldav on oldav.id=rr.action_version_id where rr.user_id=v_user and oldav.protocol_id=av.protocol_id and rr.status='swapped' and rr.created_at > pg_catalog.now() - interval '1 day')
  order by (case when v_profile.stage=any(av.eligible_stages) then 20 else 0 end + case when v_profile.current_bottleneck=any(av.eligible_bottlenecks) then 15 else 0 end + case when ap.action_type='foundation' then 5 else 0 end + case when cardinality(av.required_channels)=0 or v_profile.channels && av.required_channels then 20 else 0 end + (av.editorial_prior*15) + (case when ap.action_type='acquisition' then ((private.evidence_summary(v_user, ap.category, av.editorial_prior)->>'posterior')::numeric * 15) else 0 end) + 5 + coalesce((select uap.weight_adjustment from public.user_action_preferences uap where uap.user_id=v_user and uap.protocol_id=av.protocol_id),0)) desc, av.id asc limit 1;
  if not found then return jsonb_build_object('status','no_eligible_action','message','Não conseguimos encontrar uma ação possível agora. Vamos ajustar seu plano.'); end if;
  v_stage_fit := case when v_profile.stage=any(v_action.eligible_stages) then 20 else 0 end + case when v_profile.current_bottleneck=any(v_action.eligible_bottlenecks) then 15 else 0 end;
  v_channel_fit := case when cardinality(v_action.required_channels)=0 or v_profile.channels && v_action.required_channels then 20 else 0 end; v_prior := v_action.editorial_prior*15; v_viability := 5;
  v_summary := private.evidence_summary(v_user, (select ap.category from public.action_protocols ap where ap.id=v_action.protocol_id), v_action.editorial_prior);
  v_evidence := case when (select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id)='acquisition' then ((v_summary->>'posterior')::numeric*15) else 0 end;
  v_signal_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'signal_outcomes')::integer,5); v_signal_positive := coalesce((v_policy.params->'confidence_thresholds'->>'signal_positive')::integer,3); v_strong_outcomes := coalesce((v_policy.params->'confidence_thresholds'->>'strong_outcomes')::integer,8); v_strong_margin := coalesce((v_policy.params->'confidence_thresholds'->>'strong_margin')::numeric,0.05); v_other_posterior := 0;
  if (select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id)='acquisition' then
    select coalesce(max((private.evidence_summary(v_user, ap.category, av.editorial_prior)->>'posterior')::numeric),0) into v_other_posterior from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id where ap.action_type='acquisition' and ap.category <> (select ap2.category from public.action_protocols ap2 where ap2.id=v_action.protocol_id) and av.status='published' and not exists (select 1 from public.action_versions newer where newer.protocol_id=av.protocol_id and newer.status='published' and newer.version_number>av.version_number);
    if (v_summary->>'comparable_count')::integer >= v_strong_outcomes and (v_summary->>'posterior')::numeric >= v_other_posterior + v_strong_margin then v_confidence := 'strong_signal'; elsif (v_summary->>'comparable_count')::integer >= v_signal_outcomes and (v_summary->>'positive_count')::integer >= v_signal_positive and (v_summary->>'posterior')::numeric > v_action.editorial_prior then v_confidence := 'signal'; else v_confidence := 'learning'; end if;
  else v_confidence := 'learning'; end if;
  v_score := v_stage_fit+v_channel_fit+v_prior+v_evidence+v_viability;
  v_why := case when v_is_foundation then case when not v_profile.can_serve_next_7_days then 'Você ainda não confirmou disponibilidade para atender nos próximos 7 dias. Vamos preparar esse básico antes de buscar novas pessoas.' when not v_profile.has_real_portfolio then 'Você ainda não tem uma foto real pronta para mostrar. Vamos preparar essa prova antes de buscar novas pessoas.' when not v_profile.has_booking_path then 'Você ainda não deixou claro por onde alguém pode marcar. Vamos deixar esse caminho simples antes de buscar novas pessoas.' else 'Você contou como está hoje. Vamos preparar o básico para a próxima ação ficar possível.' end else case v_profile.current_bottleneck when 'first_clients' then 'Você está começando e precisa das primeiras clientes. Esta é uma ação simples para criar movimento.' when 'low_visibility' then 'Pouca gente conhece seu trabalho. Esta ação ajuda a colocar seu serviço diante de pessoas próximas.' when 'low_conversion' then 'Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale começar por uma conversa que já existe.' when 'empty_slots' then 'Você já atende, mas ainda ficam horários vazios. Esta ação ajuda a mostrar uma disponibilidade real.' when 'low_return' then 'Você quer fazer suas clientes voltarem mais. Esta ação retoma uma relação que já existe.' else 'Esta é a próxima ação mais simples para o seu momento.' end end;
  select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
  insert into public.recommendations (user_id, action_version_id, context_checkin_id, policy_version_id, sequence_number, score, score_components, why_now_rendered, exploration) values (v_user, v_action.id, v_context.id, v_policy.id, v_sequence, v_score, jsonb_build_object('fit',v_stage_fit,'channel',v_channel_fit,'prior',v_prior,'evidence',v_evidence,'viability',v_viability,'confidence_level',v_confidence), v_why, false) returning * into v_rec;
  return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'confidence_level',v_confidence,'score',v_score);
end; $$;

revoke all on function public.generate_next_recommendation() from public, anon;
grant execute on function public.generate_next_recommendation() to authenticated;
