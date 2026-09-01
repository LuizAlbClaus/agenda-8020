-- ============================================================================
-- Migration: 20260901000000_copilot_and_biological_retention.sql
-- Descrição: Modelo aditivo para SOS Copiloto, Templates de Áudio/Texto,
--            Ciclos de Retenção Biológica e Trava de Prontidão.
-- ============================================================================

-- 1. Novos Enums de Domínio
do $$ begin
  create type public.objection_category as enum (
    'price_too_high',        -- Preço / "achei caro"
    'procrastination',       -- "Vou ver e te aviso"
    'third_party_decision',  -- "Falar com marido / sócio"
    'just_browsing',         -- "Só queria saber o valor"
    'schedule_friction'      -- "Não tenho tempo agora"
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.copilot_script_mode as enum ('text', 'audio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.retention_timing_status as enum ('early', 'optimal_timing', 'overdue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.objection_resolution as enum ('converted', 'declined', 'dismissed', 'pending');
exception when duplicate_object then null; end $$;

-- 2. Coluna Aditiva na tabela services: Ciclo de Retenção Biológica (dias)
alter table public.services 
  add column if not exists recurrence_cycle_days integer not null default 28 check (recurrence_cycle_days between 3 and 180);

-- Backfill contextual de acordo com o nicho de serviço
update public.services set recurrence_cycle_days = 21 where niche_code = 'beauty' and name ~* '(unha|nail|gel|fibra)';
update public.services set recurrence_cycle_days = 20 where niche_code = 'beauty' and name ~* '(cílio|lash|sobrancelha|brow)';
update public.services set recurrence_cycle_days = 30 where niche_code = 'beauty' and name ~* '(cabelo|hair|corte)';
update public.services set recurrence_cycle_days = 15 where niche_code = 'health_wellness' and recurrence_cycle_days = 28;

-- 3. Tabela de Templates do Copiloto (Auditada e Centralizada)
create table if not exists public.copilot_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  objection_category public.objection_category,
  niche_code text not null default 'all',
  title text not null,
  psychological_rationale text not null,
  client_subtext text not null,
  script_text text not null,
  script_audio text not null,
  audio_duration_seconds integer not null check (audio_duration_seconds between 5 and 90),
  audio_tone_guide text not null,
  approach_type text not null check (approach_type in ('direct', 'consultative', 'downsell')),
  active boolean not null default true,
  display_order integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists copilot_templates_category_idx on public.copilot_templates(objection_category, active, display_order);
create index if not exists copilot_templates_niche_idx on public.copilot_templates(niche_code, active);

-- 4. Tabela de Interações e Telemetria de Objeções
create table if not exists public.objection_interactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.copilot_templates(id) on delete set null,
  objection_category public.objection_category not null,
  used_mode public.copilot_script_mode not null default 'text',
  resolution public.objection_resolution not null default 'pending',
  customer_id uuid references public.customers(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists objection_interactions_ws_idx on public.objection_interactions(workspace_id, created_at desc);
create index if not exists objection_interactions_user_idx on public.objection_interactions(user_id, created_at desc);

-- 5. View Inteligente de Retenção Biológica Devida (v_due_retentions)
create or replace view public.v_due_retentions as
with last_completed_appointments as (
  select distinct on (a.workspace_id, a.customer_id)
    a.id as appointment_id,
    a.workspace_id,
    a.customer_id,
    a.service_id,
    s.name as service_name,
    s.recurrence_cycle_days,
    a.ends_at,
    (current_date - (a.ends_at at time zone coalesce(w.timezone, 'America/Sao_Paulo'))::date) as days_since_completed
  from public.appointments a
  join public.services s on s.id = a.service_id
  join public.workspaces w on w.id = a.workspace_id
  where a.status = 'completed'
  order by a.workspace_id, a.customer_id, a.ends_at desc
),
scheduled_future as (
  select distinct customer_id
  from public.appointments
  where status in ('held', 'confirmed')
    and starts_at > now()
)
select 
  lca.appointment_id,
  lca.workspace_id,
  lca.customer_id,
  c.display_name as customer_name,
  c.contact as customer_contact,
  lca.service_id,
  lca.service_name,
  lca.recurrence_cycle_days,
  lca.days_since_completed,
  (lca.days_since_completed - lca.recurrence_cycle_days) as variance_days,
  case 
    when lca.days_since_completed < (lca.recurrence_cycle_days - 4) then 'early'::public.retention_timing_status
    when lca.days_since_completed between (lca.recurrence_cycle_days - 4) and (lca.recurrence_cycle_days + 7) then 'optimal_timing'::public.retention_timing_status
    else 'overdue'::public.retention_timing_status
  end as timing_status
from last_completed_appointments lca
join public.customers c on c.id = lca.customer_id
where not exists (
  select 1 from scheduled_future sf where sf.customer_id = lca.customer_id
);

-- 6. Row Level Security (RLS)
alter table public.copilot_templates enable row level security;
alter table public.objection_interactions enable row level security;

revoke all on table public.copilot_templates from public, anon;
grant select on table public.copilot_templates to authenticated;

drop policy if exists copilot_templates_read on public.copilot_templates;
create policy copilot_templates_read on public.copilot_templates 
  for select to authenticated using (active = true);

revoke all on table public.objection_interactions from public, anon;
grant select, insert, update on table public.objection_interactions to authenticated;

drop policy if exists objection_interactions_owner on public.objection_interactions;
create policy objection_interactions_owner on public.objection_interactions 
  for all to authenticated 
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

-- 7. RPCs de Alta Segurança

-- 7.1. Busca de Templates do Copiloto
create or replace function public.get_copilot_templates(
  p_category public.objection_category default null,
  p_niche text default 'all'
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then 
    raise exception using errcode = '28000', message = 'authentication_required'; 
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', ct.id,
    'slug', ct.slug,
    'objection_category', ct.objection_category,
    'title', ct.title,
    'psychological_rationale', ct.psychological_rationale,
    'client_subtext', ct.client_subtext,
    'script_text', ct.script_text,
    'script_audio', ct.script_audio,
    'audio_duration_seconds', ct.audio_duration_seconds,
    'audio_tone_guide', ct.audio_tone_guide,
    'approach_type', ct.approach_type
  ) order by ct.display_order asc, ct.created_at asc), '[]'::jsonb)
  into v_result
  from public.copilot_templates ct
  where ct.active = true
    and (p_category is null or ct.objection_category = p_category)
    and (ct.niche_code = 'all' or ct.niche_code = p_niche);

  return v_result;
end; $$;
revoke all on function public.get_copilot_templates(public.objection_category, text) from public, anon;
grant execute on function public.get_copilot_templates(public.objection_category, text) to authenticated;

-- 7.2. Oportunidades de Retenção Biológica Devida
create or replace function public.get_due_retentions(
  p_limit integer default 5
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_result jsonb;
begin
  if v_user is null then 
    raise exception using errcode = '28000', message = 'authentication_required'; 
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  join public.workspace_members wm on wm.workspace_id = w.id
  where wm.user_id = v_user and w.active = true
  order by w.created_at asc limit 1;

  if v_workspace_id is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'appointment_id', dr.appointment_id,
    'customer_id', dr.customer_id,
    'customer_name', dr.customer_name,
    'customer_contact', dr.customer_contact,
    'service_id', dr.service_id,
    'service_name', dr.service_name,
    'recurrence_cycle_days', dr.recurrence_cycle_days,
    'days_since_completed', dr.days_since_completed,
    'variance_days', dr.variance_days,
    'timing_status', dr.timing_status
  ) order by 
    case dr.timing_status 
      when 'optimal_timing' then 1 
      when 'overdue' then 2 
      else 3 
    end,
    abs(dr.variance_days) asc
  ), '[]'::jsonb)
  into v_result
  from (
    select * from public.v_due_retentions
    where workspace_id = v_workspace_id
      and timing_status in ('optimal_timing', 'overdue')
    limit p_limit
  ) dr;

  return v_result;
end; $$;
revoke all on function public.get_due_retentions(integer) from public, anon;
grant execute on function public.get_due_retentions(integer) to authenticated;

-- 7.3. Trava de Prontidão (Readiness Gate Check)
create or replace function public.check_readiness_lock(
  p_action_slug text
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_profile public.business_profiles%rowtype;
  v_workspace public.workspaces%rowtype;
  v_provider public.providers%rowtype;
  v_rules_count integer := 0;
  v_slots_count integer := 0;
  v_locked boolean := false;
  v_reason text := null;
  v_fix_url text := null;
begin
  if v_user is null then 
    raise exception using errcode = '28000', message = 'authentication_required'; 
  end if;

  select * into v_profile from public.business_profiles where user_id = v_user;
  if not found then 
    return jsonb_build_object('locked', true, 'reason', 'onboarding_required', 'fix_url', '/onboarding');
  end if;

  -- 1. Trava Básica de Perfil
  if not v_profile.can_serve_next_7_days then
    return jsonb_build_object(
      'locked', true,
      'reason', 'Você não confirmou disponibilidade para atender nos próximos 7 dias.',
      'fix_url', '/onboarding?reason=edit'
    );
  end if;

  if not v_profile.has_real_portfolio and not v_profile.has_service_proof then
    return jsonb_build_object(
      'locked', true,
      'reason', 'Você ainda não separou fotos ou provas reais do seu serviço.',
      'fix_url', '/action/fnd-04-real-portfolio'
    );
  end if;

  -- 2. Trava de Agenda Real (Para ações que ofertam horários específicos)
  if p_action_slug in ('CONV_03_TWO_REAL_SLOTS', 'AVAIL_01_REAL_SLOT') then
    select w.* into v_workspace
    from public.workspaces w
    join public.workspace_members wm on wm.workspace_id = w.id
    where wm.user_id = v_user and w.active = true
    order by w.created_at asc limit 1;

    if not found then
      return jsonb_build_object('locked', true, 'reason', 'Workspace de atendimento não configurado.', 'fix_url', '/agenda');
    end if;

    select p.* into v_provider 
    from public.providers p 
    where p.workspace_id = v_workspace.id and p.active = true 
    order by p.created_at asc limit 1;

    if not found then
      return jsonb_build_object('locked', true, 'reason', 'Nenhum profissional ativo configurado na sua agenda.', 'fix_url', '/agenda');
    end if;

    -- Checa se possui regras semanais de horário ativas
    select count(*) into v_rules_count 
    from public.availability_rules 
    where provider_id = v_provider.id and active = true;

    if v_rules_count = 0 then
      return jsonb_build_object(
        'locked', true,
        'reason', 'Você não configurou nenhum dia ou horário de atendimento na sua Agenda.',
        'fix_url', '/agenda'
      );
    end if;
  end if;

  return jsonb_build_object('locked', false, 'reason', null, 'fix_url', null);
end; $$;
revoke all on function public.check_readiness_lock(text) from public, anon;
grant execute on function public.check_readiness_lock(text) to authenticated;

-- 7.4. Registro de Uso e Resolução de Objeções (Analytics e Histórico)
create or replace function public.track_objection_interaction(
  p_template_id uuid,
  p_category public.objection_category,
  p_mode public.copilot_script_mode,
  p_customer_id uuid default null,
  p_resolution public.objection_resolution default 'pending'
)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_interaction_id uuid;
begin
  if v_user is null then 
    raise exception using errcode = '28000', message = 'authentication_required'; 
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  join public.workspace_members wm on wm.workspace_id = w.id
  where wm.user_id = v_user and w.active = true
  order by w.created_at asc limit 1;

  if v_workspace_id is null then 
    raise exception using errcode = '42501', message = 'workspace_not_found'; 
  end if;

  insert into public.objection_interactions (
    workspace_id, user_id, template_id, objection_category, used_mode, resolution, customer_id
  ) values (
    v_workspace_id, v_user, p_template_id, p_category, p_mode, p_resolution, p_customer_id
  ) returning id into v_interaction_id;

  return v_interaction_id;
end; $$;
revoke all on function public.track_objection_interaction(uuid, public.objection_category, public.copilot_script_mode, uuid, public.objection_resolution) from public, anon;
grant execute on function public.track_objection_interaction(uuid, public.objection_category, public.copilot_script_mode, uuid, public.objection_resolution) to authenticated;

-- 8. Seed Canônico de Templates do SOS Copiloto
insert into public.copilot_templates (
  slug, objection_category, niche_code, title, psychological_rationale,
  client_subtext, script_text, script_audio, audio_duration_seconds,
  audio_tone_guide, approach_type, display_order
) values
(
  'OBJ_PRICE_DIRECT',
  'price_too_high',
  'all',
  'Desarmar Preço com Valor Direto',
  'O cliente não contesta o valor absoluto, mas sim a certeza do retorno ou durabilidade. Validar a preocupação sem conceder desconto defensivo reestabelece a autoridade.',
  '"Achei que fosse mais em conta. Não sei se posso pagar agora."',
  'Te entendo perfeitamente! O valor reflete o material que uso, que dura muito mais sem danificar sua saúde/unha. Mas para você conhecer meu trabalho, consigo te encaixar em um horário promocional de primeira visita nesta quinta às 15h. Faz sentido para você?',
  '[Tom acolhedor e seguro] Oi, tudo bem? Olha, super entendo sua preocupação com o valor! O que acontece é que eu trabalho com produtos selecionados que não agridem e duram muito mais tempo, então você acaba economizando na manutenção. [Pausa breve] Faz o seguinte: quero muito que você conheça de perto. Tenho um encaixe na quinta às 15h. Que tal experimentar?',
  28,
  'Fale de forma calorosa, sem pressa e com firmeza suave na voz.',
  'direct',
  1
),
(
  'OBJ_PRICE_DOWNSELL',
  'price_too_high',
  'all',
  'Opção Acessível (Downsell Educado)',
  'Oferecer uma alternativa mais enxuta preserva a venda sem desvalorizar o serviço principal.',
  '"Ficou acima do que planejei gastar."',
  'Super compreensível! Se o procedimento completo não cabe no momento, podemos fazer a versão essencial que resolve super bem e cabe no seu orçamento hoje. Quer que eu te passe os horários dessa opção?',
  '[Tom parceiro e empático] Oi, tudo bom? Super compreensível! Olha só, se o pacote completo não cabe no seu orçamento agora, a gente tem a opção básica que fica super linda e cabe direitinho. Se você quiser, posso te mandar os detalhes e a gente combina um horário essa semana!',
  22,
  'Entonação flexível e leve, transmitindo parceria.',
  'downsell',
  2
),
(
  'OBJ_PROCRASTINATION_SLOT',
  'procrastination',
  'all',
  'Conduzir o "Vou ver e te aviso"',
  'O "te aviso" é um fechamento de conversa por sobrecarga mental de decisão. Ao retirar a pressão de confirmação e propor um bloqueio sem compromisso, eliminamos o atrito.',
  '"Vou ver minha agenda e qualquer coisa te chamo."',
  'Super tranquila! Minha agenda dessa semana está quase fechada, então posso deixar pré-reservado para você até o final da tarde para você não perder o horário. Prefere quinta às 16h ou sexta às 10h?',
  '[Tom leve e descontraído] Perfeito, sem problema nenhum! Só te aviso porque os horários de fim de semana costumam voar rapidinho. Quer que eu segure a quinta às 16h para você sem compromisso até você ver seus compromissos? Aí você não fica sem vaga!',
  20,
  'Ritmo ágil, amigável e despretensioso.',
  'consultative',
  3
),
(
  'OBJ_THIRD_PARTY',
  'third_party_decision',
  'all',
  'Decisão Compartilhada ("Ver com Marido/Esposa")',
  'Evita o confronto e transforma o profissional em aliado, fornecendo argumentos fáceis para a cliente explicar em casa.',
  '"Preciso ver com meu marido antes de marcar."',
  'Claro, conversa com ele sim! Muitas clientes minhas fazem isso. Se ajudar, me diz qual período fica melhor para você (manhã ou tarde) que já separo as duas melhores opções para quando vocês conversarem.',
  '[Tom simpático e compreensivo] Ah, com certeza! Conversa com calma sim! [Risos leves] Para facilitar para você, que turno você prefere? Se for tarde, já deixo duas opções anotadas aqui, aí você já mostra para ele!',
  18,
  'Simpatia espontânea, sorriso na voz.',
  'consultative',
  4
),
(
  'OBJ_JUST_BROWSING',
  'just_browsing',
  'all',
  'Curiosa de Balcão ("Só o preço")',
  'Respostas que dão apenas o número encerram a conversa. Apresentar o preço envelopado com a transformação gera valor imediato.',
  '"Quanto custa?"',
  'Oi! O valor do procedimento é R$ [PRECO], já incluindo todo o cuidado inicial e o acabamento duradouro. Você já faz esse tipo de procedimento ou seria sua primeira vez?',
  '[Tom simpático e acolhedor] Olá, que ótimo falar com você! Nosso procedimento completo fica em R$ [PRECO], e já inclui toda a preparação e produtos de primeira linha. Me conta: você já tem o costume de fazer ou seria a sua primeira vez comigo?',
  19,
  'Energia alta e acolhimento imediato.',
  'consultative',
  5
)
on conflict (slug) do update set
  title = excluded.title,
  psychological_rationale = excluded.psychological_rationale,
  client_subtext = excluded.client_subtext,
  script_text = excluded.script_text,
  script_audio = excluded.script_audio,
  audio_duration_seconds = excluded.audio_duration_seconds,
  audio_tone_guide = excluded.audio_tone_guide,
  approach_type = excluded.approach_type,
  updated_at = now();
