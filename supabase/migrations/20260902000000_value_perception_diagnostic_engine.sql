-- ============================================================================
-- Migration: 20260902000000_value_perception_diagnostic_engine.sql
-- Descrição: Modelo de Dados Aditivo para o Motor de Diagnóstico de Percepção
--            de Valor, Planos de 48 Horas e Micro-Aprendizagem Pedagógica.
-- ============================================================================

-- 1. Novos Tipos Enumerados
do $$ begin
  create type public.value_diagnostic_trigger as enum (
    'copilot_objection',  -- Disparado após 2+ objeções de 'price_too_high' no Copiloto
    'checkin_flow',      -- Disparado após check-in com gargalo 'low_conversion'
    'action_outcome',    -- Disparado após registrar retorno 'none' ou objeção de preço
    'manual_audit'       -- Iniciado deliberadamente pela usuária na tela Hoje/Ajustar
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.value_archetype as enum (
    'price_prisoner',       -- A Prisioneira do Preço (0 a 35 pts)
    'hidden_artisan',       -- A Artesã Oculta (36 a 65 pts)
    'polishing_specialist', -- A Especialista em Lapidação (66 a 85 pts)
    'premium_brand'         -- A Marca Premium (86 a 100 pts)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.value_leak_category as enum (
    'showcase_commodity',  -- Vazamento 1: Vitrine de commodity / tiroteio de preço
    'climax_rushed',       -- Vazamento 2: Finalização corrida / falta ritual do espelho
    'intangible_vacuum',   -- Vazamento 3: Serviço evapora / zero tangibilidade física
    'pricing_fear',        -- Vazamento 4: Insegurança na ancoragem e falta de garantia
    'balanced'             -- Equilibrado: alta percepção instalada
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_dimension as enum (
    'positioning_showcase',   -- Vitrine, bio e posicionamento
    'service_climax_ritual',  -- Clímax de atendimento e ritual do espelho
    'physical_tangibility',   -- Envelope pós-venda, garantias e artefatos
    'pricing_anchoring'       -- Condução comercial e descompressão de preço
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.action_execution_status as enum (
    'not_started',
    'in_progress',
    'completed',
    'dismissed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.learning_theme as enum (
    'positioning',
    'fearless_pricing',
    'enchantment_ritual',
    'client_retention'
  );
exception when duplicate_object then null; end $$;

-- 2. Tabela de Questões da Micro-Auditoria (Catálogo Centralizado)
create table if not exists public.diagnostic_questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  dimension public.question_dimension not null,
  step_order integer not null,
  title text not null,
  helper_text text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_questions_order_idx on public.diagnostic_questions(step_order, active);

-- 3. Tabela de Diagnósticos de Valor (Instâncias de Auditoria por Workspace)
create table if not exists public.value_diagnostics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger_source public.value_diagnostic_trigger not null,
  ivp_score integer not null check (ivp_score between 0 and 100),
  archetype public.value_archetype not null,
  primary_leak public.value_leak_category not null,
  dimensional_scores jsonb not null default '{}'::jsonb,
  headline text not null,
  empathic_rationale text not null,
  client_perception_gap jsonb not null, -- { "sees_today": text, "will_see_after": text }
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists value_diagnostics_ws_active_idx on public.value_diagnostics(workspace_id, is_active, created_at desc);
create index if not exists value_diagnostics_user_idx on public.value_diagnostics(user_id, created_at desc);

-- 4. Tabela de Respostas do Diagnóstico (Respostas Individuais do Quiz)
create table if not exists public.diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.value_diagnostics(id) on delete cascade,
  question_id uuid not null references public.diagnostic_questions(id) on delete cascade,
  selected_option_id text not null,
  points_awarded numeric(5,2) not null,
  leak_flag public.value_leak_category,
  created_at timestamptz not null default now()
);

create index if not exists diagnostic_results_diag_idx on public.diagnostic_results(diagnostic_id);

-- 5. Catálogo de Playbooks de Valor (Planos de 48 Horas)
create table if not exists public.value_playbooks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  archetype public.value_archetype not null,
  primary_leak public.value_leak_category not null,
  title text not null,
  subtitle text not null,
  agreement_copy text not null, -- Ex: "Você NÃO vai dar desconto..."
  target_duration_hours integer not null default 48,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Catálogo de Ações de Alto Valor (Missões Práticas de 10 minutos)
create table if not exists public.value_actions (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.value_playbooks(id) on delete cascade,
  slug text not null unique,
  mission_number integer not null check (mission_number between 1 and 5),
  title text not null,
  subtitle text not null,
  duration_minutes integer not null default 10,
  scientific_principle text not null, -- Ex: "Peak-End Rule (Kahneman)"
  action_steps jsonb not null check (jsonb_typeof(action_steps) = 'array'),
  ready_to_use_script text,
  script_copy_toast text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists value_actions_playbook_idx on public.value_actions(playbook_id, mission_number);

-- 7. Progresso e Conclusão das Missões por Workspace
create table if not exists public.workspace_value_action_progress (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  diagnostic_id uuid not null references public.value_diagnostics(id) on delete cascade,
  action_id uuid not null references public.value_actions(id) on delete cascade,
  status public.action_execution_status not null default 'not_started',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, diagnostic_id, action_id)
);

create index if not exists ws_val_action_prog_idx on public.workspace_value_action_progress(workspace_id, diagnostic_id, status);

-- 8. Catálogo de Micro-Estudo: Pílulas de Café (1 minuto)
create table if not exists public.micro_learning_pills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  theme public.learning_theme not null,
  expert_reference text not null, -- "Alex Hormozi", "Dan Kennedy", "Rory Sutherland"
  title text not null,
  catchphrase text not null,
  audio_url text,
  duration_seconds integer not null check (duration_seconds between 30 and 75),
  audio_transcript text not null,
  visual_cards jsonb not null check (jsonb_typeof(visual_cards) = 'array'),
  quick_script_to_copy text,
  day_rotation_index integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists micro_learning_pills_theme_idx on public.micro_learning_pills(theme, day_rotation_index, active);

-- 9. Registro de Pílulas Consumidas ("Café Tomado") por Workspace
create table if not exists public.workspace_learning_progress (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pill_id uuid not null references public.micro_learning_pills(id) on delete cascade,
  consumed_date date not null default current_date,
  consumed_at timestamptz not null default now(),
  unique (workspace_id, pill_id, consumed_date)
);

create index if not exists ws_learning_prog_date_idx on public.workspace_learning_progress(workspace_id, consumed_date desc);

-- 10. Row Level Security (RLS)
alter table public.diagnostic_questions enable row level security;
alter table public.value_diagnostics enable row level security;
alter table public.diagnostic_results enable row level security;
alter table public.value_playbooks enable row level security;
alter table public.value_actions enable row level security;
alter table public.workspace_value_action_progress enable row level security;
alter table public.micro_learning_pills enable row level security;
alter table public.workspace_learning_progress enable row level security;

-- Catálogos são leitura pública para autenticados
revoke all on table public.diagnostic_questions from public, anon;
grant select on table public.diagnostic_questions to authenticated;
drop policy if exists questions_read on public.diagnostic_questions;
create policy questions_read on public.diagnostic_questions for select to authenticated using (active = true);

revoke all on table public.value_playbooks from public, anon;
grant select on table public.value_playbooks to authenticated;
drop policy if exists playbooks_read on public.value_playbooks;
create policy playbooks_read on public.value_playbooks for select to authenticated using (active = true);

revoke all on table public.value_actions from public, anon;
grant select on table public.value_actions to authenticated;
drop policy if exists actions_read on public.value_actions;
create policy actions_read on public.value_actions for select to authenticated using (active = true);

revoke all on table public.micro_learning_pills from public, anon;
grant select on table public.micro_learning_pills to authenticated;
drop policy if exists pills_read on public.micro_learning_pills;
create policy pills_read on public.micro_learning_pills for select to authenticated using (active = true);

-- Dados tenant-isolated via workspace_access
revoke all on table public.value_diagnostics from public, anon;
grant select, insert, update on table public.value_diagnostics to authenticated;
drop policy if exists value_diagnostics_owner on public.value_diagnostics;
create policy value_diagnostics_owner on public.value_diagnostics for all to authenticated
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

revoke all on table public.diagnostic_results from public, anon;
grant select, insert, update on table public.diagnostic_results to authenticated;
drop policy if exists diagnostic_results_owner on public.diagnostic_results;
create policy diagnostic_results_owner on public.diagnostic_results for all to authenticated
  using (exists (
    select 1 from public.value_diagnostics vd
    where vd.id = diagnostic_results.diagnostic_id
      and private.workspace_access(vd.workspace_id)
  ));

revoke all on table public.workspace_value_action_progress from public, anon;
grant select, insert, update on table public.workspace_value_action_progress to authenticated;
drop policy if exists val_action_progress_owner on public.workspace_value_action_progress;
create policy val_action_progress_owner on public.workspace_value_action_progress for all to authenticated
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

revoke all on table public.workspace_learning_progress from public, anon;
grant select, insert, update on table public.workspace_learning_progress to authenticated;
drop policy if exists learning_progress_owner on public.workspace_learning_progress for all to authenticated
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

-- 11. Funções RPC de Alta Segurança

-- 11.1. Submissão e Cálculo do Diagnóstico de Valor
create or replace function public.calculate_value_diagnostic(
  p_workspace_id uuid,
  p_trigger public.value_diagnostic_trigger,
  p_answers jsonb -- Array de objetos: [{"question_id": "...", "option_id": "..."}]
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_diagnostic_id uuid;
  v_total_score integer := 0;
  v_rec record;
  v_ans jsonb;
  v_opt jsonb;
  v_opt_points numeric;
  v_opt_leak public.value_leak_category;
  v_dim_scores jsonb := '{}'::jsonb;
  v_recent_objections integer := 0;
  v_archetype public.value_archetype;
  v_primary_leak public.value_leak_category := 'showcase_commodity';
  v_headline text;
  v_empathic text;
  v_sees_today text;
  v_will_see text;
  v_playbook_id uuid;
  v_playbook_rec record;
  v_act record;
  v_result jsonb;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not private.workspace_access(p_workspace_id) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  -- 1. Verifica telemetria de objeções 'Achei Caro' nos últimos 14 dias
  select count(*) into v_recent_objections
  from public.objection_interactions
  where workspace_id = p_workspace_id
    and objection_category = 'price_too_high'
    and created_at >= (now() - interval '14 days');

  -- 2. Desativa diagnósticos anteriores deste workspace
  update public.value_diagnostics
  set is_active = false, updated_at = now()
  where workspace_id = p_workspace_id and is_active = true;

  -- 3. Cria o novo registro de diagnóstico preliminar
  insert into public.value_diagnostics (
    workspace_id,
    user_id,
    trigger_source,
    ivp_score,
    archetype,
    primary_leak,
    dimensional_scores,
    headline,
    empathic_rationale,
    client_perception_gap
  ) values (
    p_workspace_id,
    v_user,
    p_trigger,
    50, -- Temporário enquanto soma
    'hidden_artisan',
    'showcase_commodity',
    '{}'::jsonb,
    'Analisando...',
    'Aguardando cálculo...',
    '{}'::jsonb
  ) returning id into v_diagnostic_id;

  -- 4. Itera e pontua cada resposta
  for v_ans in select * from jsonb_array_elements(p_answers) loop
    select * into v_rec
    from public.diagnostic_questions
    where id = (v_ans->>'question_id')::uuid;

    if found then
      -- Busca a opção selecionada dentro do array JSONB da questão
      select elem into v_opt
      from jsonb_array_elements(v_rec.options) as elem
      where elem->>'id' = (v_ans->>'option_id');

      if v_opt is not null then
        v_opt_points := coalesce((v_opt->>'points')::numeric, 0);
        v_opt_leak := null;
        if (v_opt->>'leak_flag') is not null then
          v_opt_leak := (v_opt->>'leak_flag')::public.value_leak_category;
          -- Registra o vazamento mais prioritário
          if v_opt_leak in ('showcase_commodity', 'climax_rushed', 'intangible_vacuum', 'pricing_fear') then
            v_primary_leak := v_opt_leak;
          end if;
        end if;

        v_total_score := v_total_score + v_opt_points::integer;
        v_dim_scores := jsonb_set(
          v_dim_scores,
          array[v_rec.dimension::text],
          to_jsonb(coalesce((v_dim_scores->>v_rec.dimension::text)::numeric, 0) + v_opt_points)
        );

        -- Salva a resposta individual auditada
        insert into public.diagnostic_results (
          diagnostic_id,
          question_id,
          selected_option_id,
          points_awarded,
          leak_flag
        ) values (
          v_diagnostic_id,
          v_rec.id,
          v_ans->>'option_id',
          v_opt_points,
          v_opt_leak
        );
      end if;
    end if;
  end loop;

  -- Se houve muitas objeções recentes de preço, aplica um leve fator calibrador (-5 pts)
  if v_recent_objections >= 3 then
    v_total_score := greatest(5, v_total_score - 5);
  end if;
  v_total_score := least(100, greatest(0, v_total_score));

  -- 5. Determinação do Arquétipo e Cópias Empáticas
  if v_total_score <= 35 then
    v_archetype := 'price_prisoner';
    v_headline := 'O Efeito "Serviço Invisível": Você entrega ouro, mas a vitrine parece bijuteria';
    v_empathic := 'Respire fundo. O seu trabalho técnico é excelente, mas os seus rituais e embalagem ainda não mostram para a cliente o trabalho que você tem. Sem rituais, o cérebro dela compara você com a opção mais barata da cidade.';
    v_sees_today := 'Mais uma profissional cobrando preço de mercado em um serviço que ela acha que qualquer uma faz.';
    v_will_see := 'A especialista criteriosa que cuida da saúde e autoimagem dela com padrões de esterilização e encanto incomparáveis.';
  elsif v_total_score <= 65 then
    v_archetype := 'hidden_artisan';
    v_headline := 'A Artesã Oculta: Seu talento é impecável, mas o pós-serviço evapora rápido demais';
    v_empathic := 'Você investe em produtos de qualidade e atende com todo carinho, mas quando a cliente levanta da cadeira, o valor começa a se apagar na memória dela. Falta tangibilizar o cuidado em casa.';
    v_sees_today := 'Um ótimo atendimento, mas que desaparece da memória assim que o pagamento do Pix é feito.';
    v_will_see := 'Uma experiência memorável que ela leva para casa no envelope e exibe com orgulho para as amigas.';
  elsif v_total_score <= 85 then
    v_archetype := 'polishing_specialist';
    v_headline := 'Especialista em Lapidação: Você está a 3 ajustes de entrar no Top 10% da sua região';
    v_empathic := 'Sua base é sólida e suas clientes adoram você. O único gargalo que ainda gera hesitação de preço no WhatsApp é a falta de ancoragem consultiva antes de passar o valor numérico.';
    v_sees_today := 'Uma profissional qualificada, mas cujo preço às vezes pega de surpresa antes do desejo ser ativado.';
    v_will_see := 'A autoridade de referência que faz a cliente sentir que pagar o seu valor é um privilégio de autocuidado.';
  else
    v_archetype := 'premium_brand';
    v_headline := 'Marca de Alto Padrão: Seu valor percebido está plenamente instalado';
    v_empathic := 'Parabéns! Sua experiência sensorial, biossegurança e postura colocam você no topo do mercado. Suas próximas alavancas são planos recorrentes e expansão de margem.';
    v_sees_today := 'Uma das melhores e mais desejadas experiências de atendimento da cidade.';
    v_will_see := 'A marca pessoal inegociável na rotina de autocuidado dela.';
  end if;

  -- 6. Atualiza o registro oficial do diagnóstico
  update public.value_diagnostics
  set 
    ivp_score = v_total_score,
    archetype = v_archetype,
    primary_leak = v_primary_leak,
    dimensional_scores = v_dim_scores,
    headline = v_headline,
    empathic_rationale = v_empathic,
    client_perception_gap = jsonb_build_object(
      'sees_today', v_sees_today,
      'will_see_after', v_will_see
    ),
    updated_at = now()
  where id = v_diagnostic_id;

  -- 7. Seleciona o Playbook de 48 Horas e cria o progresso das Missões
  select * into v_playbook_rec
  from public.value_playbooks
  where (archetype = v_archetype or primary_leak = v_primary_leak)
    and active = true
  order by (primary_leak = v_primary_leak) desc, created_at desc
  limit 1;

  if v_playbook_rec is not null then
    for v_act in (
      select * from public.value_actions
      where playbook_id = v_playbook_rec.id and active = true
      order by mission_number asc
    ) loop
      insert into public.workspace_value_action_progress (
        workspace_id,
        diagnostic_id,
        action_id,
        status
      ) values (
        p_workspace_id,
        v_diagnostic_id,
        v_act.id,
        'not_started'
      ) on conflict (workspace_id, diagnostic_id, action_id) do nothing;
    end loop;
  end if;

  -- 8. Monta e retorna o payload completo
  select jsonb_build_object(
    'diagnostic_id', vd.id,
    'ivp_score', vd.ivp_score,
    'archetype', vd.archetype,
    'primary_leak', vd.primary_leak,
    'headline', vd.headline,
    'empathic_rationale', vd.empathic_rationale,
    'client_perception_gap', vd.client_perception_gap,
    'playbook', case when v_playbook_rec is null then null else jsonb_build_object(
      'title', v_playbook_rec.title,
      'subtitle', v_playbook_rec.subtitle,
      'agreement_copy', v_playbook_rec.agreement_copy
    ) end
  ) into v_result
  from public.value_diagnostics vd
  where vd.id = v_diagnostic_id;

  return v_result;
end;
$$;
revoke all on function public.calculate_value_diagnostic(uuid, public.value_diagnostic_trigger, jsonb) from public, anon;
grant execute on function public.calculate_value_diagnostic(uuid, public.value_diagnostic_trigger, jsonb) to authenticated;

-- 11.2. Consulta do Diagnóstico Ativo e suas Missões
create or replace function public.get_active_value_diagnostic(
  p_workspace_id uuid
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_diagnostic record;
  v_playbook record;
  v_missions jsonb;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not private.workspace_access(p_workspace_id) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  select * into v_diagnostic
  from public.value_diagnostics
  where workspace_id = p_workspace_id and is_active = true
  order by created_at desc
  limit 1;

  if v_diagnostic is null then
    return null;
  end if;

  -- Agrega as missões vinculadas com seu status atual
  select coalesce(jsonb_agg(jsonb_build_object(
    'progress_id', wap.id,
    'action_id', va.id,
    'mission_number', va.mission_number,
    'title', va.title,
    'subtitle', va.subtitle,
    'duration_minutes', va.duration_minutes,
    'scientific_principle', va.scientific_principle,
    'action_steps', va.action_steps,
    'ready_to_use_script', va.ready_to_use_script,
    'status', wap.status,
    'completed_at', wap.completed_at
  ) order by va.mission_number asc), '[]'::jsonb) into v_missions
  from public.workspace_value_action_progress wap
  join public.value_actions va on va.id = wap.action_id
  where wap.workspace_id = p_workspace_id
    and wap.diagnostic_id = v_diagnostic.id;

  return jsonb_build_object(
    'diagnostic_id', v_diagnostic.id,
    'ivp_score', v_diagnostic.ivp_score,
    'archetype', v_diagnostic.archetype,
    'primary_leak', v_diagnostic.primary_leak,
    'headline', v_diagnostic.headline,
    'empathic_rationale', v_diagnostic.empathic_rationale,
    'client_perception_gap', v_diagnostic.client_perception_gap,
    'created_at', v_diagnostic.created_at,
    'missions', v_missions
  );
end;
$$;
revoke all on function public.get_active_value_diagnostic(uuid) from public, anon;
grant execute on function public.get_active_value_diagnostic(uuid) to authenticated;

-- 11.3. Concluir Missão de Alto Valor de 10 minutos
create or replace function public.complete_value_action(
  p_workspace_id uuid,
  p_action_id uuid
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_active_diag_id uuid;
  v_completed_count integer;
  v_total_count integer;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not private.workspace_access(p_workspace_id) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  select id into v_active_diag_id
  from public.value_diagnostics
  where workspace_id = p_workspace_id and is_active = true
  limit 1;

  if v_active_diag_id is null then
    raise exception 'Nenhum diagnóstico ativo encontrado para este workspace.';
  end if;

  update public.workspace_value_action_progress
  set 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where workspace_id = p_workspace_id
    and diagnostic_id = v_active_diag_id
    and action_id = p_action_id;

  select 
    count(*) filter (where status = 'completed'),
    count(*)
  into v_completed_count, v_total_count
  from public.workspace_value_action_progress
  where workspace_id = p_workspace_id and diagnostic_id = v_active_diag_id;

  return jsonb_build_object(
    'ok', true,
    'action_id', p_action_id,
    'completed_missions', v_completed_count,
    'total_missions', v_total_count,
    'all_completed', (v_completed_count = v_total_count and v_total_count > 0)
  );
end;
$$;
revoke all on function public.complete_value_action(uuid, uuid) from public, anon;
grant execute on function public.complete_value_action(uuid, uuid) to authenticated;

-- 11.4. Buscar Pílula Diária de Micro-Estudo ("Pílula de Café")
create or replace function public.get_daily_micro_learning_pill(
  p_workspace_id uuid
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_pill record;
  v_consumed boolean := false;
  v_primary_leak public.value_leak_category;
  v_preferred_theme public.learning_theme;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not private.workspace_access(p_workspace_id) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  -- 1. Verifica vazamento ativo
  select primary_leak into v_primary_leak
  from public.value_diagnostics
  where workspace_id = p_workspace_id and is_active = true
  limit 1;

  v_preferred_theme := case
    when v_primary_leak = 'showcase_commodity' then 'positioning'::public.learning_theme
    when v_primary_leak = 'climax_rushed' then 'enchantment_ritual'::public.learning_theme
    when v_primary_leak = 'intangible_vacuum' then 'client_retention'::public.learning_theme
    else 'fearless_pricing'::public.learning_theme
  end;

  -- 2. Seleciona pílula ativa do tema ou em rotação diária
  select * into v_pill
  from public.micro_learning_pills
  where theme = v_preferred_theme and active = true
  order by day_rotation_index asc
  limit 1;

  if v_pill is null then
    select * into v_pill
    from public.micro_learning_pills
    where active = true
    order by random()
    limit 1;
  end if;

  if v_pill is null then
    return null;
  end if;

  -- 3. Verifica se já foi tomada hoje
  select exists (
    select 1 from public.workspace_learning_progress
    where workspace_id = p_workspace_id
      and pill_id = v_pill.id
      and consumed_date = current_date
  ) into v_consumed;

  return jsonb_build_object(
    'pill_id', v_pill.id,
    'slug', v_pill.slug,
    'theme', v_pill.theme,
    'expert_reference', v_pill.expert_reference,
    'title', v_pill.title,
    'catchphrase', v_pill.catchphrase,
    'audio_url', v_pill.audio_url,
    'duration_seconds', v_pill.duration_seconds,
    'audio_transcript', v_pill.audio_transcript,
    'visual_cards', v_pill.visual_cards,
    'quick_script_to_copy', v_pill.quick_script_to_copy,
    'consumed_today', v_consumed
  );
end;
$$;
revoke all on function public.get_daily_micro_learning_pill(uuid) from public, anon;
grant execute on function public.get_daily_micro_learning_pill(uuid) to authenticated;

-- 11.5. Marcar Pílula como Consumida ("Café Tomado")
create or replace function public.mark_micro_learning_consumed(
  p_workspace_id uuid,
  p_pill_id uuid
)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not private.workspace_access(p_workspace_id) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  insert into public.workspace_learning_progress (
    workspace_id,
    user_id,
    pill_id,
    consumed_date
  ) values (
    p_workspace_id,
    v_user,
    p_pill_id,
    current_date
  ) on conflict (workspace_id, pill_id, consumed_date) do nothing;

  return jsonb_build_object('ok', true, 'consumed_date', current_date);
end;
$$;
revoke all on function public.mark_micro_learning_consumed(uuid, uuid) from public, anon;
grant execute on function public.mark_micro_learning_consumed(uuid, uuid) to authenticated;

-- ============================================================================
-- Seeds: Questões da Micro-Auditoria (3 Perguntas em 45 Segundos)
-- ============================================================================

insert into public.diagnostic_questions (slug, dimension, step_order, title, helper_text, options)
values 
(
  'showcase_first_touch',
  'positioning_showcase',
  1,
  'Quando uma cliente chega no seu WhatsApp ou Instagram pela 1ª vez, o que ela encontra logo de cara?',
  'O primeiro ponto de contato define se ela compara você com o preço mais baixo ou com uma especialista.',
  '[
    {
      "id": "price_flyer",
      "label": "Tabela seca de preços ou panfleto com valores listados",
      "description": "Ela vê os preços antes de conhecer a sua técnica ou os resultados.",
      "points": 5,
      "leak_flag": "showcase_commodity"
    },
    {
      "id": "noisy_feed",
      "label": "Fotos misturadas, posts prontos da internet ou catálogo parado",
      "description": "Não fica claro qual é a sua especialidade de destaque nem o padrão do espaço.",
      "points": 15,
      "leak_flag": "showcase_commodity"
    },
    {
      "id": "transformation_showcase",
      "label": "Fotos nítidas de transformações reais com bio clara e foco de especialista",
      "description": "Ela vê a beleza do trabalho final e entende que seu atendimento é diferenciado.",
      "points": 35,
      "leak_flag": null
    }
  ]'::jsonb
),
(
  'climax_mirror_ritual',
  'service_climax_ritual',
  2,
  'No momento em que você termina o procedimento e a cliente vê o resultado, como é esse ritual?',
  'A regra do Pico-Fim (Peak-End) da neurociência: o encanto final determina o valor percebido ao pagar.',
  '[
    {
      "id": "rushed_hand_mirror",
      "label": "Rápido e tímido: entrego um espelhinho, ela olha rápido e já pergunto do Pix",
      "description": "O atendimento termina com pressa sem celebrar a transformação que você fez.",
      "points": 5,
      "leak_flag": "climax_rushed"
    },
    {
      "id": "polite_compliment_only",
      "label": "Ela elogia, mas sai logo em seguida sem nenhum ritual ou foto de resultado",
      "description": "Falta iluminação correta e validação profissional para fixar o orgulho dela.",
      "points": 15,
      "leak_flag": "climax_rushed"
    },
    {
      "id": "mirror_ceremony",
      "label": "Ritual do Espelho: boa iluminação, postura ereta, elogio calmo e contemplação",
      "description": "Ela se sente maravilhosa e o cérebro dela valida que cada centavo valeu a pena.",
      "points": 35,
      "leak_flag": null
    }
  ]'::jsonb
),
(
  'physical_tangibility_takeaway',
  'physical_tangibility',
  3,
  'Além do resultado no próprio corpo, o que a cliente leva fisicamente na mão ao se despedir?',
  'Serviços evaporam da memória se não houver um artefato físico palpável no pós-atendimento.',
  '[
    {
      "id": "zero_physical",
      "label": "Nada físico: apenas a memória do serviço e o comprovante do cartão/Pix",
      "description": "O cérebro primitivo sente que pagou caro por algo que já evaporou do alcance das mãos.",
      "points": 5,
      "leak_flag": "intangible_vacuum"
    },
    {
      "id": "whatsapp_only",
      "label": "Apenas mensagem digital comum no WhatsApp dizendo ''obrigada pela preferência''",
      "description": "Mensagem que qualquer profissional manda; não ancora o cuidado contínuo.",
      "points": 12,
      "leak_flag": "intangible_vacuum"
    },
    {
      "id": "vip_envelope_and_gift",
      "label": "Envelope de Cuidados VIP, Certificado de Garantia de 7 dias ou mimo útil de manutenção",
      "description": "Ela chega em casa com um pacote elegante e lembra do seu valor durante a semana inteira.",
      "points": 30,
      "leak_flag": null
    }
  ]'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  helper_text = excluded.helper_text,
  options = excluded.options,
  active = true;

-- ============================================================================
-- Seeds: Playbooks de Alto Valor de 48 Horas
-- ============================================================================

insert into public.value_playbooks (slug, archetype, primary_leak, title, subtitle, agreement_copy)
values
(
  'playbook_48h_decommoditize',
  'price_prisoner',
  'showcase_commodity',
  'Plano de Alto Valor 48h: Descommoditização & Encanto Imediato',
  'Três ajustes rápidos de 10 minutos para tirar seu trabalho da vala comum e blindar seu preço.',
  'O nosso acordo sagrado: Você NÃO vai baixar R$ 1 do seu preço nem dar desconto. Vamos subir o valor percebido do que você já entrega em 3 missões de 10 minutos.'
),
(
  'playbook_48h_aftercare_tangible',
  'hidden_artisan',
  'intangible_vacuum',
  'Plano de Alto Valor 48h: Tangibilização do Invisível & Fidelização',
  'Transforme seu talento em um kit físico de alto padrão que a cliente leva para casa.',
  'Seu trabalho tem muita qualidade. Vamos fazer a cliente segurar esse valor nas mãos com envelopes de cuidado e garantias de tranquilidade.'
),
(
  'playbook_48h_top10_polish',
  'polishing_specialist',
  'pricing_fear',
  'Plano de Alto Valor 48h: Lapidação Top 10% & Ancoragem Consultiva',
  'Scripts elegantes para transformar curiosas de preço em clientes fiéis que não pedem desconto.',
  'Você já é muito boa. Agora vamos calibrar as 3 frases no WhatsApp que fazem o seu preço soar barato diante de tudo o que você entrega.'
)
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  agreement_copy = excluded.agreement_copy,
  active = true;

-- ============================================================================
-- Seeds: Missões Práticas de 10 Minutos (Value Actions)
-- ============================================================================

insert into public.value_actions (playbook_id, slug, mission_number, title, subtitle, duration_minutes, scientific_principle, action_steps, ready_to_use_script, script_copy_toast)
select 
  p.id,
  'mission_mirror_ritual',
  1,
  'Missão 1: O Ritual do Espelho (O Clímax de 2 Minutos)',
  'Ajuste a iluminação, a postura e a revelação do resultado antes de falar de dinheiro.',
  10,
  'Peak-End Rule (Daniel Kahneman, Nobel de Economia) — o final emocional define 80% da satisfação percebida.',
  '[
    "Guarde qualquer espelho de mão riscado ou pequeno que você use hoje.",
    "Posicione a cliente em frente ao espelho principal do espaço com luz frontal limpa e indireta.",
    "Peça para ela se levantar ou erguer a postura para se olhar por inteiro.",
    "Diga o script de validação olhando nos olhos dela e espere 5 segundos em silêncio para ela sorrir antes de tocar na máquina de cartão."
  ]'::jsonb,
  'Olha com calma esse acabamento, Márcia. Veja como esse alinhamento destacou a elegância natural das suas mãos. Ficou simplesmente impecável.',
  'Script de validação copiado! Fale isso com calma no final do atendimento.'
from public.value_playbooks p where p.slug = 'playbook_48h_decommoditize'
on conflict (slug) do nothing;

insert into public.value_actions (playbook_id, slug, mission_number, title, subtitle, duration_minutes, scientific_principle, action_steps, ready_to_use_script, script_copy_toast)
select 
  p.id,
  'mission_vip_care_envelope',
  2,
  'Missão 2: O Envelope de Cuidados VIP (Tangibilização)',
  'Monte 5 envelopes simples na sua bancada para entregar nas mãos de cada cliente ao se despedir.',
  10,
  'Endowment Effect (Efeito Posse) — objetos físicos pós-compra ancoram o valor percebido e eliminam o remorso do gasto.',
  '[
    "Separe 5 envelopes pequenos de papel kraft ou saquinhos delicados.",
    "Coloque dentro uma lixa delicada ou escovinha de cuidados + 1 sachê de chá calmante ou bala refinada.",
    "Escreva um bilhetinho carinhoso com a data de retorno ideal de acordo com o ciclo do serviço.",
    "Entregue na mão dela com as duas mãos ao se despedir: ''Preparei este mimo de manutenção para o seu resultado durar ainda mais''."
  ]'::jsonb,
  'Preparei este envelope exclusivo de cuidados para você levar para casa. Seu momento de autocuidado não termina na cadeira — segue essas orientações para o resultado durar muito mais tempo.',
  'Instruções copiadas! Monte os 5 envelopes hoje na bancada.'
from public.value_playbooks p where p.slug = 'playbook_48h_decommoditize'
on conflict (slug) do nothing;

insert into public.value_actions (playbook_id, slug, mission_number, title, subtitle, duration_minutes, scientific_principle, action_steps, ready_to_use_script, script_copy_toast)
select 
  p.id,
  'mission_specialist_bio_reframing',
  3,
  'Missão 3: Reposicionamento da Bio de Especialista',
  'Substitua a lista genérica de serviços por uma promessa de transformação e exclusividade no Instagram e WhatsApp.',
  10,
  'Framing Effect (Efeito Enquadramento) — nomes de rituais e soluções atraem clientes que não buscam preço.',
  '[
    "Abra o seu perfil comercial do Instagram e WhatsApp Business.",
    "Remova listas longas como ''manicure, cílios, depilação, maquiagem''.",
    "Cole a estrutura de Especialista com prova social e link oficial de agendamento.",
    "No menu de serviços do Agenda 80/20, troque nomes secos por rituais (ex: de ''Pé e Mão R$ 60'' para ''Ritual Cutilagem & Hidratação Profunda R$ 85'')."
  ]'::jsonb,
  'Especialista em Saúde e Beleza das Unhas Naturais 🌿
Mais de 600 atendimentos realizados com biossegurança hospitalar.
Atendimento exclusivo com hora marcada.
Reserve seu horário: [SEU_LINK_AGENDA]',
  'Modelo de Bio copiado! Cole no seu perfil comercial.'
from public.value_playbooks p where p.slug = 'playbook_48h_decommoditize'
on conflict (slug) do nothing;

-- ============================================================================
-- Seeds: Pílulas de Café (Micro-Estudo de 1 Minuto)
-- ============================================================================

insert into public.micro_learning_pills (
  slug,
  theme,
  expert_reference,
  title,
  catchphrase,
  duration_seconds,
  audio_transcript,
  visual_cards,
  quick_script_to_copy,
  day_rotation_index
) values
(
  'pill_hormozi_value_equation',
  'fearless_pricing',
  'Alex Hormozi (A Equação de Valor)',
  'Como fazer o seu preço parecer 10x menor sem dar R$ 1 de desconto',
  'Preço alto não assusta quando o resultado e a certeza são maiores que o dinheiro.',
  52,
  'Oi, Márcia! Aqui é a sua pílula rápida de hoje. Sabe quando alguém pergunta no WhatsApp: "Quanto custa o serviço?" e seu instinto é só responder o número: "R$ 150"? Pare de fazer isso agora. Quando você joga o número solto, o cérebro da cliente só enxerga o boleto e a dor de gastar. Em vez disso, faça como o Alex Hormozi ensina na Equação de Valor: mostre o resultado e a garantia primeiro. Responda assim: "Oi, querida! O protocolo inclui a análise prévia da sua saúde, os materiais estéreis de grau hospitalar e a garantia incondicional de 7 dias para você ficar impecável o mês inteiro. O valor completo fica R$ 150." Percebeu? O valor entra depois que ela já viu a transformação. Testa hoje na próxima mensagem!',
  '[
    {
      "step": 1,
      "tag": "O Erro Comum",
      "text": "Responder a mensagem com o número seco: ''Olá, custa R$ 150''. O cérebro dela só sente a dor do gasto sem ver o benefício."
    },
    {
      "step": 2,
      "tag": "A Ciência do Valor",
      "text": "Segundo Alex Hormozi, o valor explode quando você aumenta a certeza do resultado e reduz o risco percebido da cliente."
    },
    {
      "step": 3,
      "tag": "O Script de Poder",
      "text": "O protocolo inclui análise prévia personalizada, biossegurança estéril e garantia de 7 dias. O investimento fica R$ 150.",
      "actionScript": "Oi, querida! O protocolo inclui a avaliação inicial, materiais esterilizados de grau hospitalar e garantia incondicional de 7 dias para você não ter nenhuma dor de cabeça. O valor completo fica R$ [SEU_VALOR]."
    }
  ]'::jsonb,
  'Oi, querida! O protocolo inclui a avaliação inicial, materiais esterilizados de grau hospitalar e garantia incondicional de 7 dias para você não ter nenhuma dor de cabeça. O valor completo fica R$ [SEU_VALOR].',
  1
),
(
  'pill_kennedy_price_filter',
  'positioning',
  'Dan Kennedy (Precificação Premium)',
  'Por que cobrar barato atrai a cliente que mais reclama e mais dá trabalho',
  'O preço não serve só para pagar contas; serve como filtro de paz de espírito.',
  58,
  'Hoje vamos falar de uma verdade que ninguém te conta no salão. Dan Kennedy, o maior consultor de negócios de serviço do mundo, tem uma regra de ouro: quem vem até você por preço barato, vai embora pela concorrente da esquina por R$ 2 de diferença. Cobrar barato atrai a cliente que exige milagre, atrasa 20 minutos, cancela no dia e reclama de qualquer detalhe. Quando você sustenta um preço justo e elevado com postura profissional, você afasta a caçadora de desconto e atrai a mulher que valoriza o seu tempo, elogia o seu trabalho e respeita a sua agenda. Não tenha medo de cobrar o que vale; tenha medo de passar o dia de pé atendendo quem não te valoriza.',
  '[
    {
      "step": 1,
      "tag": "A Armadilha",
      "text": "Cobrar barato para ''lotar a agenda''. Você termina o dia exausta, sem dinheiro e com clientes desleais."
    },
    {
      "step": 2,
      "tag": "A Regra de Kennedy",
      "text": "Preço é um filtro de comportamento. Clientes que pagam o valor correto respeitam seus horários e confiam na sua autoridade."
    },
    {
      "step": 3,
      "tag": "Sua Postura Hoje",
      "text": "Nunca se desculpe pelo seu preço nem ofereça desconto no primeiro ''achei caro''. Diga: ''Nosso foco é durabilidade e segurança absoluta''."
    }
  ]'::jsonb,
  'Eu entendo perfeitamente, Patrícia! A diferença do nosso atendimento é que nós priorizamos a saúde biológica e a máxima durabilidade, com produtos certificados e hora marcada exclusiva. Fico à sua disposição quando quiser viver essa experiência!',
  2
),
(
  'pill_sutherland_sensory_alchemy',
  'enchantment_ritual',
  'Rory Sutherland (Alquimia Sensorial)',
  'A xícara de R$ 30: como detalhes de centavos mudam o valor do seu serviço',
  'O cérebro humano julga o que não pode ver através do que consegue tocar e sentir.',
  50,
  'Você sabia que o cérebro da sua cliente não consegue avaliar com precisão a qualidade química do gel ou do cosmético que você usa? Mas ele avalia com precisão absoluta a xícara em que você serve o café e o cheiro do ambiente quando ela entra. Rory Sutherland, mestre da economia comportamental, chama isso de Alquimia. Se você serve café em copo plástico descartável mole, o inconsciente da cliente conclui que o seu serviço também é descartável e comum. Mas se você serve um café quentinho em xícara de cerâmica com um biscoito amanteigado, ela sente que está em um spa de luxo. O custo é de centavos, mas a percepção de valor sobe dezenas de reais na hora.',
  '[
    {
      "step": 1,
      "tag": "O Ponto Cego",
      "text": "Achar que a cliente só repara na parte técnica do procedimento. Ela repara no cheiro, no som e nos detalhes."
    },
    {
      "step": 2,
      "tag": "A Alquimia Comportamental",
      "text": "Pequenos sinais de sofisticação (louça de cerâmica, música ambiente calma) programam o cérebro dela a aceitar preços mais altos com naturalidade."
    },
    {
      "step": 3,
      "tag": "Ação de Hoje",
      "text": "Aposente os copos plásticos moles. Sirva água ou café em uma xícara bonita com um mimo simples de apoio."
    }
  ]'::jsonb,
  'Passei um café fresquinho com um mimo especial para você relaxar hoje enquanto a gente cuida de você. Chega com calma!',
  3
)
on conflict (slug) do update set
  title = excluded.title,
  catchphrase = excluded.catchphrase,
  duration_seconds = excluded.duration_seconds,
  audio_transcript = excluded.audio_transcript,
  visual_cards = excluded.visual_cards,
  quick_script_to_copy = excluded.quick_script_to_copy,
  active = true;
