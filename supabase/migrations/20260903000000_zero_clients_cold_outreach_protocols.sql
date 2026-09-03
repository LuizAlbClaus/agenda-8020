-- ============================================================================
-- Migration: 20260903000000_zero_clients_cold_outreach_protocols.sql
-- Descrição: Protocolos de Aquisição Ativa Fria para Iniciantes com Zero Clientes
--            e Desbloqueio do Motor de Recomendação para opportunity_signals = 'none'.
-- ============================================================================

-- 1. Inserir novos protocolos no catálogo de ação
insert into public.action_protocols (slug, action_type, category, measurement_class) values
  ('COLD_01_CLOSE_CIRCLES', 'acquisition', 'conversations', 'direct_outreach'),
  ('COLD_02_LOCAL_SHOWCASE', 'acquisition', 'local', 'partnership'),
  ('COLD_03_PORTFOLIO_LAUNCH', 'acquisition', 'conversations', 'broadcast')
on conflict (slug) do update set active = true;

-- 2. Inserir versões ativas e publicadas com requirements sem trava de sinal
with seed(slug, title, short_desc, why, use_when, not_when, steps, stages, bottlenecks, channels, req, duration, cooldown, prior, guardrail, message) as (values
  (
    'COLD_01_CLOSE_CIRCLES',
    'Convide 3 pessoas próximas para modelo',
    'Convide 3 pessoas do seu convívio para servirem de modelo com data marcada.',
    'Você está começando e precisa das primeiras clientes reais para gerar movimento, fotos e segurança.',
    'Quando você tem poucas ou nenhuma cliente e quer criar atendimentos reais nesta semana.',
    'Quando sua agenda já está com alta ocupação e você não precisa de modelos de treino.',
    '["Escolha 3 pessoas próximas (amigas, familiares ou conhecidas) com quem você tem bom diálogo.", "Explique com honestidade que está aperfeiçoando o atendimento e ofereça uma condição especial de modelo.", "Defina o dia e o horário exato antes de encerrar a conversa."]',
    '{starting,some_clients}',
    '{first_clients,low_visibility}',
    '{whatsapp,existing_clients,local_network}',
    '{"requires_context_signal": false}',
    10,
    48,
    0.95,
    'Convide com carinho e transparência sobre o valor de modelo ou custo de material, sem pressão.',
    'Oi [Nome]! Estou organizando meus atendimentos de [Serviço] e separei 3 vagas especiais para modelos esta semana para registrar fotos do meu portfólio. Lembrei de você na hora! Se você topar vir, consigo fazer por uma condição super especial de modelo. Tenho quinta às 14h ou sexta às 10h. Qual fica mais tranquilo para você?'
  ),
  (
    'COLD_02_LOCAL_SHOWCASE',
    'Proponha uma parceria de cortesia local',
    'Apresente seu serviço em um comércio complementar da sua rua ou bairro.',
    'Lojas de roupas, salões e clínicas vizinhas já atendem o mesmo público que precisa do seu serviço.',
    'Quando você quer ser conhecida por quem mora ou trabalha perto de onde você atende.',
    'Quando você atende apenas em domicílio distante do seu bairro de referência.',
    '["Escolha um comércio complementar próximo (loja de roupas, salão, clínica ou cafeteria).", "Converse com a responsável e proponha deixar 5 vouchers de cortesia de cuidado para as melhores clientes dela.", "Troquem contatos no WhatsApp e deixem combinado o canal para agendamento."]',
    '{starting,some_clients}',
    '{first_clients,low_visibility}',
    '{partnerships,local_network,whatsapp}',
    '{"requires_context_signal": false}',
    15,
    72,
    0.90,
    'Proponha uma troca respeitosa que valorize as clientes do comércio parceiro, sem insistência.',
    'Olá! Tudo bem? Sou profissional aqui no bairro e atendo com [Serviço]. Sei que você tem clientes incríveis aqui na loja e gostaria de presentear 5 delas com um voucher especial de cuidado para conhecerem meu trabalho. Podemos conversar 2 minutinhos no WhatsApp?'
  ),
  (
    'COLD_03_PORTFOLIO_LAUNCH',
    'Avise sua rede sobre abertura de agenda',
    'Comunique seus horários nas suas redes pessoais com condição de inauguração.',
    'Muitas pessoas que já seguem você não sabem que você está atendendo e com vagas abertas.',
    'Quando você tem horários disponíveis e quer avisar sua rede de forma profissional e direta.',
    'Quando sua grade da semana já estiver completamente lotada.',
    '["Separe uma foto real do seu serviço ou do seu espaço de atendimento.", "Publique um aviso claro informando que sua agenda está aberta para os próximos 7 dias.", "Deixe o link ou WhatsApp direto para quem quiser garantir vaga antes de encerrar."]',
    '{starting,some_clients,irregular_schedule}',
    '{first_clients,low_visibility,empty_slots}',
    '{instagram,whatsapp}',
    '{"requires_context_signal": false}',
    10,
    48,
    0.92,
    'Não anuncie escassez mentirosa. Informe com clareza a disponibilidade real.',
    'Meninas, oficialmente aberta a agenda de [Serviço] para esta semana! 💖 Separei alguns horários para quem quiser garantir atendimento impecável. Me manda uma mensagem no privado ou clica no link para ver os horários disponíveis antes que preencham!'
  )
)
insert into public.action_versions (
  protocol_id, version_number, status, title, short_description, why_now_template,
  when_to_use, when_not_to_use, steps, eligible_stages, eligible_bottlenecks,
  required_channels, requirements, duration_minutes, cooldown_hours, editorial_prior,
  ethical_guardrail, message_template, published_at
)
select 
  ap.id, 1, 'published', s.title, s.short_desc, s.why, s.use_when, s.not_when,
  s.steps::jsonb, s.stages::public.user_stage[], s.bottlenecks::public.bottleneck[],
  s.channels::text[], s.req::jsonb, s.duration, s.cooldown, s.prior, s.guardrail,
  s.message, now()
from seed s 
join public.action_protocols ap on ap.slug = s.slug
on conflict (protocol_id, version_number) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  why_now_template = excluded.why_now_template,
  when_to_use = excluded.when_to_use,
  when_not_to_use = excluded.when_not_to_use,
  steps = excluded.steps,
  eligible_stages = excluded.eligible_stages,
  eligible_bottlenecks = excluded.eligible_bottlenecks,
  required_channels = excluded.required_channels,
  requirements = excluded.requirements,
  duration_minutes = excluded.duration_minutes,
  cooldown_hours = excluded.cooldown_hours,
  editorial_prior = excluded.editorial_prior,
  ethical_guardrail = excluded.ethical_guardrail,
  message_template = excluded.message_template,
  status = 'published';

-- 3. Atualizar generate_next_recommendation() com mensagem acolhedora para first_clients
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

 v_why:=case when v_has_gap then 'Vamos preparar o básico para a próxima ação ficar possível.'
   else case v_profile.current_bottleneck 
     when 'first_clients' then 'Você está começando e precisa de primeiras clientes. Esta ação abre portas e cria oportunidades reais para o seu momento.'
     when 'low_visibility' then 'Pouca gente conhece seu trabalho. Esta ação ajuda a colocar seu serviço diante de pessoas próximas.'
     when 'low_conversion' then 'Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale começar por uma conversa que já existe.'
     when 'empty_slots' then 'Você já atende, mas ainda ficam horários vazios. Esta ação ajuda a mostrar uma disponibilidade real.'
     when 'low_return' then 'Você quer fazer suas clientes voltarem mais. Esta ação retoma uma relação que já existe.'
     else 'Esta é a próxima ação mais simples para o seu momento.' 
   end 
 end;

 select coalesce(max(sequence_number),0)+1 into v_sequence from public.recommendations where user_id=v_user and recommendation_date=current_date;
 insert into public.recommendations(user_id,action_version_id,context_checkin_id,policy_version_id,sequence_number,score,score_components,why_now_rendered,exploration,random_seed)
 values(v_user,v_action.id,v_context.id,v_policy.id,v_sequence,v_score,jsonb_build_object('fit',v_fit,'channel',v_channel,'prior',v_prior,'evidence',v_evidence,'viability',v_viability,'confidence_level','learning','policy_params',jsonb_build_object('prior_weight',v_prior_weight,'recency_half_life_days',v_half_life)),v_why,v_explore,v_seed) returning * into v_rec;
 return jsonb_build_object('status','created','recommendation_id',v_rec.id,'action_version_id',v_action.id,'title',v_action.title,'short_description',v_action.short_description,'why_now',v_why,'duration_minutes',v_action.duration_minutes,'steps',v_action.steps,'ethical_guardrail',v_action.ethical_guardrail,'action_type',(select ap.action_type from public.action_protocols ap where ap.id=v_action.protocol_id),'score',v_score,'exploration',v_explore,'random_seed',v_seed);
end; $$;

revoke all on function public.generate_next_recommendation() from public,anon;
grant execute on function public.generate_next_recommendation() to authenticated;
