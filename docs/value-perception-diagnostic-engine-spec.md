# Agenda 80/20 — Especificação Técnica Executável (SPEC)
## Módulo: Motor de Diagnóstico de Percepção de Valor, Planos de 48 Horas & Micro-Aprendizagem Pedagógica

**Status:** Aprovado para Implementação Executável  
**Versão:** 1.0.0 — Setembro/2026  
**Autoridade:** Líder Técnico de Engenharia de Software & Especificação Executável do Comitê  
**Stack Canônica:** Next.js 16.3.3 (App Router, Server Actions, React 19.2.8), TypeScript strict, Tailwind CSS v4 (@theme OKLCH), Supabase / PostgreSQL 15+ (RLS estrito, Security Definer, RPCs versionadas), Zod 4.4.3.  
**Compatibilidade:** 100% Aditiva sobre as Fases 0 a 11 e o módulo de Copiloto de Vendas / Retenção Biológica (`docs/sales-copilot-biological-retention-spec.md`).

---

## 1. Visão Geral e Síntese de Integração dos Especialistas

Esta especificação consolida e orquestra as diretrizes de todos os especialistas do comitê — Percepção de Valor e Precificação Premium, UX Pedagógica e Micro-Aprendizagem — em uma arquitetura executável direta para o repositório **Agenda 80/20**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         AGENDA 80/20 VALUE ENGINE                                │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│        PSICOLOGIA DO VALOR PERCEBIDO   │         UX PEDAGÓGICA & EDUCAÇÃO        │
│  • Equação de Valor (Alex Hormozi)     │  • Micro-Auditoria em 45s (3 Perguntas) │
│  • Ancoragem e Filtro (Dan Kennedy)    │  • Diagnóstico Revelado (Sem Culpa)     │
│  • Alquimia Sensorial (Rory Sutherland)│  • Plano 48 Horas (Missões de 10 min)   │
│  • 4 Alavancas de Valor no Serviço     │  • Pílula do Café (Áudio 1 min / Cards) │
└────────────────────────────────────────┴─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      CAMADA DE PERSISTÊNCIA & RLS (POSTGRES)                     │
│  • diagnostic_questions                • value_diagnostics                       │
│  • diagnostic_results                  • value_playbooks                         │
│  • value_actions                       • workspace_value_action_progress         │
│  • micro_learning_pills                • workspace_learning_progress             │
│  • calculate_value_diagnostic()        • get_active_value_diagnostic()           │
│  • complete_value_action()             • get_daily_micro_learning_pill()          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Fundamentação Teórica: As Quatro Escolas de Percepção de Valor

A precificação de serviços presenciais e corporais (beleza, estética, bem-estar, saúde e serviços locais) **nunca é uma equação contábil estrita de custo mais margem**. O preço é um **sinalizador psicológico de competência, segurança biológica e status**.

#### 1. A Equação de Valor de Alex Hormozi
$$\text{Valor Percebido} = \frac{\text{Resultado dos Sonhos (Dream Outcome)} \times \text{Probabilidade Percebida de Conquista}}{\text{Atraso no Tempo (Time Delay)} \times \text{Esforço e Sacrifício}}$$

*Aplicação na Autônoma Solo:* O valor colapsa quando o serviço é vendido como mão-de-obra braçal (ex: *"aplicar fibra de vidro"*). O valor explode quando é enquadrado como a conquista de uma autoimagem elevada (*"mãos elegantes e resistentes para o trabalho"*), com probabilidade garantida (Garantia Blindada de 7 dias), sem espera na recepção e com zero dor ou desconforto.

#### 2. A Doutrina de Precificação Premium de Dan Kennedy
*"Não há nenhuma vantagem estratégica em ser o segundo mais barato da sua região; mas há um oceano de vantagens em ser a mais exclusiva e bem posicionada."*

Cobrar barato demais ativa o **Efeito Chivas Regal Reverso**: a cliente desconfia da higiene, dos materiais e da capacitação técnica da profissional. Preço baixo atrai a pior fatia de mercado (caçadoras de desconto desleais, que faltam sem avisar e reclamam de tudo), enquanto afasta as clientes de maior valor que buscam segurança para o seu corpo.

#### 3. A Alquimia Sensorial de Rory Sutherland
O cérebro humano não avalia utilidade de forma puramente matemática. O julgamento de valor é mediado por **sinais colaterais de contexto**. Um copo de água na pia não custa nada; servida em garrafa de vidro com fatia de limão siciliano e gelo em taça de cristal custa R$ 18,00. O líquido é $H_2O$, mas a moldura sensorial reprograma o valor percebido. No salão/estúdio:
- Café em copo plástico mole = percepção de serviço barato de bairro.
- Café em xícara de cerâmica com biscoitinho em prato de bambu = percepção de clínica boutique.

#### 4. As 4 Alavancas de Valor no Atendimento Local
1. **Sensorial & Ritualística:** Aroma de ambiente exclusivo, iluminação indireta quente (2700K), louça de cerâmica, ritual de recepção e momento do espelho.
2. **Biossegurança Dramatizada:** Abertura solene do envelope de autoclave na frente da cliente com explicação do indicador químico de 134°C, descarte dramático de lixas na frente da cliente e certificados Anvisa visíveis.
3. **Embalagem & Tangibilização do Intangível:** Envelope de Cuidados Home Care em papel de alta gramatura, Cartão de Garantia de 7 dias e mimo de manutenção (óleo ou escovinha em tubo acrílico).
4. **Posicionamento Especialista:** Transição de "faz-tudo" para "especialista no problema X", condução de anamnese prévia e roteiro consultivo em 3 tempos no WhatsApp.

---

## 2. Auditoria Arquitetural e Conformidade Canônica

### 2.1. Arquitetura Atual do Repositório
- **Next.js 16.3.3 App Router & React 19.2.8:** O fluxo de diagnóstico opera de forma desacoplada através de Server Actions tipadas em `app/diagnostic/actions.ts`. Modais e drawers utilizam `useTransition` para mutações sem bloqueio de renderização e feedback instantâneo.
- **Tailwind CSS v4 & OKLCH (`DESIGN.md`):**
  - Fundo neutro fresco: `var(--color-canvas)` (`oklch(0.985 0.005 250)`).
  - Cards e superfícies: `var(--color-surface-card)` (`oklch(1 0 0)`), bordas `var(--color-border-subtle)`.
  - Ação e foco: `var(--color-action-primary)` (`oklch(0.64 0.21 38)`).
  - Sucesso e celebração: `var(--color-revenue-primary)` (`oklch(0.68 0.18 152)`).
  - Oportunidade e alertas calmos: `var(--color-opportunity-primary)` (`oklch(0.75 0.16 75)`).
- **Diretrizes Anti-Slop (`DESIGN.md`):**
  - Touch target mínimo: `min-h-[48px]`.
  - Proibido faixas laterais coloridas decorativas (`border-left: 4px`).
  - Proibido gradientes de texto em títulos.
  - Raios de curvatura consistentes: `rounded-[var(--radius-card)]` (14px).
  - Sombras nítidas de repouso: `--shadow-card-resting`.
- **Supabase SSR & Multitenancy:**
  - Isolamento estrito por `workspace_id`.
  - Todas as funções SQL privilegiadas são `security definer` com `set search_path = pg_catalog, public`.
  - Políticas de RLS utilizam a função canônica do projeto `private.workspace_access(workspace_id)`.

---

## 3. Modelo de Dados Aditivo (Database Schema)

Arquivo de Migration canônico:  
`supabase/migrations/20260902000000_value_perception_diagnostic_engine.sql`

```sql
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
create policy questions_read on public.diagnostic_questions for select to authenticated using (active = true);

revoke all on table public.value_playbooks from public, anon;
grant select on table public.value_playbooks to authenticated;
create policy playbooks_read on public.value_playbooks for select to authenticated using (active = true);

revoke all on table public.value_actions from public, anon;
grant select on table public.value_actions to authenticated;
create policy actions_read on public.value_actions for select to authenticated using (active = true);

revoke all on table public.micro_learning_pills from public, anon;
grant select on table public.micro_learning_pills to authenticated;
create policy pills_read on public.micro_learning_pills for select to authenticated using (active = true);

-- Dados tenant-isolated via workspace_access
revoke all on table public.value_diagnostics from public, anon;
grant select, insert, update on table public.value_diagnostics to authenticated;
create policy value_diagnostics_owner on public.value_diagnostics for all to authenticated
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

revoke all on table public.diagnostic_results from public, anon;
grant select, insert, update on table public.diagnostic_results to authenticated;
create policy diagnostic_results_owner on public.diagnostic_results for all to authenticated
  using (exists (
    select 1 from public.value_diagnostics vd
    where vd.id = diagnostic_results.diagnostic_id
      and private.workspace_access(vd.workspace_id)
  ));

revoke all on table public.workspace_value_action_progress from public, anon;
grant select, insert, update on table public.workspace_value_action_progress to authenticated;
create policy val_action_progress_owner on public.workspace_value_action_progress for all to authenticated
  using (private.workspace_access(workspace_id))
  with check (private.workspace_access(workspace_id));

revoke all on table public.workspace_learning_progress from public, anon;
grant select, insert, update on table public.workspace_learning_progress to authenticated;
create policy learning_progress_owner on public.workspace_learning_progress for all to authenticated
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
```

---

## 4. Seeds Canônicas de Produção

As sementes abaixo fornecem o conteúdo editorial completo, validado por psicólogos e especialistas em precificação para serviços de beleza, estética e saúde.

```sql
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
```

---

## 5. Tipagem TypeScript Estrita e Schemas Zod

Caminho canônico:  
`lib/value-diagnostic-types.ts`

```typescript
import { z } from "zod";

// ============================================================================
// Enums e Literais Canônicos
// ============================================================================

export const ValueDiagnosticTriggerSchema = z.enum([
  "copilot_objection",
  "checkin_flow",
  "action_outcome",
  "manual_audit",
]);
export type ValueDiagnosticTrigger = z.infer<typeof ValueDiagnosticTriggerSchema>;

export const ValueArchetypeSchema = z.enum([
  "price_prisoner",
  "hidden_artisan",
  "polishing_specialist",
  "premium_brand",
]);
export type ValueArchetype = z.infer<typeof ValueArchetypeSchema>;

export const ValueLeakCategorySchema = z.enum([
  "showcase_commodity",
  "climax_rushed",
  "intangible_vacuum",
  "pricing_fear",
  "balanced",
]);
export type ValueLeakCategory = z.infer<typeof ValueLeakCategorySchema>;

export const QuestionDimensionSchema = z.enum([
  "positioning_showcase",
  "service_climax_ritual",
  "physical_tangibility",
  "pricing_anchoring",
]);
export type QuestionDimension = z.infer<typeof QuestionDimensionSchema>;

export const ActionExecutionStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "dismissed",
]);
export type ActionExecutionStatus = z.infer<typeof ActionExecutionStatusSchema>;

export const LearningThemeSchema = z.enum([
  "positioning",
  "fearless_pricing",
  "enchantment_ritual",
  "client_retention",
]);
export type LearningTheme = z.infer<typeof LearningThemeSchema>;

// ============================================================================
// Schemas de Validação de Payloads de Entrada (Zod 4)
// ============================================================================

export const AnswerItemSchema = z.object({
  question_id: z.string().uuid("ID de questão inválido"),
  option_id: z.string().min(1, "Opção selecionada é obrigatória"),
});

export const SubmitValueDiagnosticInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  trigger: ValueDiagnosticTriggerSchema,
  answers: z.array(AnswerItemSchema).min(1, "Ao menos uma resposta deve ser enviada"),
});
export type SubmitValueDiagnosticInput = z.infer<typeof SubmitValueDiagnosticInputSchema>;

export const CompleteValueActionInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  actionId: z.string().uuid("ID de ação inválido"),
});
export type CompleteValueActionInput = z.infer<typeof CompleteValueActionInputSchema>;

export const ConsumeLearningPillInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  pillId: z.string().uuid("ID de pílula inválido"),
});
export type ConsumeLearningPillInput = z.infer<typeof ConsumeLearningPillInputSchema>;

// ============================================================================
// Interfaces de Dados de Frontend
// ============================================================================

export interface DiagnosticOptionUI {
  id: string;
  label: string;
  description: string;
  points: number;
  leak_flag?: ValueLeakCategory | null;
}

export interface DiagnosticQuestionUI {
  id: string;
  slug: string;
  dimension: QuestionDimension;
  step_order: number;
  title: string;
  helper_text: string;
  options: DiagnosticOptionUI[];
}

export interface ValueActionMissionUI {
  progress_id: string;
  action_id: string;
  mission_number: number;
  title: string;
  subtitle: string;
  duration_minutes: number;
  scientific_principle: string;
  action_steps: string[];
  ready_to_use_script?: string | null;
  status: ActionExecutionStatus;
  completed_at?: string | null;
}

export interface ActiveValueDiagnosticUI {
  diagnostic_id: string;
  ivp_score: number;
  archetype: ValueArchetype;
  primary_leak: ValueLeakCategory;
  headline: string;
  empathic_rationale: string;
  client_perception_gap: {
    sees_today: string;
    will_see_after: string;
  };
  created_at: string;
  missions: ValueActionMissionUI[];
}

export interface VisualLearningCard {
  step: 1 | 2 | 3;
  tag: string;
  text: string;
  actionScript?: string;
}

export interface MicroLearningPillUI {
  pill_id: string;
  slug: string;
  theme: LearningTheme;
  expert_reference: string;
  title: string;
  catchphrase: string;
  audio_url?: string | null;
  duration_seconds: number;
  audio_transcript: string;
  visual_cards: VisualLearningCard[];
  quick_script_to_copy?: string | null;
  consumed_today: boolean;
}
```

---

## 6. Especificação dos Componentes Frontend (Next.js 16 / React 19)

Todos os componentes são estritamente compatíveis com React 19, utilizam a paleta OKLCH do `app/globals.css`, respeitam o alvo de toque de `min-h-[48px]`, vibração tátil suave (`navigator.vibrate(25)`) e diretrizes anti-slop.

### 6.1. Componente: Modal da Micro-Auditoria em 45 Segundos
Arquivo: `components/diagnostic/value-diagnostic-modal.tsx`

```tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { X, Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagnosticQuestionUI, ValueDiagnosticTrigger } from "@/lib/value-diagnostic-types";
import { submitValueDiagnosticAction } from "@/app/diagnostic/actions";

interface ValueDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticComplete: (diagnosticData: any) => void;
  workspaceId: string;
  triggerSource?: ValueDiagnosticTrigger;
  questions: DiagnosticQuestionUI[];
}

export function ValueDiagnosticModal({
  isOpen,
  onClose,
  onDiagnosticComplete,
  workspaceId,
  triggerSource = "manual_audit",
  questions,
}: ValueDiagnosticModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const currentSelectedOptionId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignora em dispositivos sem permissão
      }
    }
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setErrorMsg(null);
  };

  const handleNext = () => {
    if (!currentSelectedOptionId) {
      setErrorMsg("Por favor, selecione a opção que melhor reflete seu atendimento.");
      return;
    }

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submissão final
      startTransition(async () => {
        const answersArray = Object.entries(selectedAnswers).map(([qId, oId]) => ({
          question_id: qId,
          option_id: oId,
        }));

        const res = await submitValueDiagnosticAction({
          workspaceId,
          trigger: triggerSource,
          answers: answersArray,
        });

        if (res.ok && res.data) {
          onDiagnosticComplete(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || "Não conseguimos calcular o diagnóstico agora.");
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMsg(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity"
    >
      <div className="w-full max-w-lg rounded-t-[20px] sm:rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-elevated)] border border-[var(--color-border-subtle)] max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header com Progresso */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Micro-Auditoria em 45s
              </p>
              <h2 id="diagnostic-modal-title" className="text-sm font-bold text-[var(--color-ink-solid)]">
                Passo {currentStep + 1} de {questions.length}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar auditoria"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Barra de Progresso Fina */}
        <div className="h-1 w-full bg-[var(--color-surface-muted)] overflow-hidden rounded-full mt-2">
          <div
            className="h-full bg-[var(--color-action-primary)] transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Pergunta Atual */}
        {currentQuestion && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)] text-balance leading-snug">
                {currentQuestion.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed text-pretty">
                {currentQuestion.helper_text}
              </p>
            </div>

            {/* Opções Táteis */}
            <div className="space-y-2.5 pt-1" role="radiogroup">
              {currentQuestion.options.map((option) => {
                const isSelected = currentSelectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-[var(--radius-card)] border transition-all flex items-start justify-between gap-3 min-h-[56px] focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]",
                      isSelected
                        ? "bg-[var(--color-action-subtle)] border-[var(--color-action-primary)] shadow-xs"
                        : "bg-[var(--color-surface-card)] border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-muted)]"
                    )}
                  >
                    <div className="space-y-1 pr-2">
                      <p
                        className={cn(
                          "text-sm font-bold leading-snug",
                          isSelected ? "text-[var(--color-action-primary)]" : "text-[var(--color-ink-solid)]"
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border mt-0.5",
                        isSelected
                          ? "border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-white"
                          : "border-[var(--color-border-strong)] bg-white"
                      )}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-semibold text-[var(--color-danger-primary)] pt-1">
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* Rodapé de Ações - Zona do Polegar */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 px-4 rounded-[var(--radius-button)] text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isPending || !currentSelectedOptionId}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] text-white text-sm sm:text-base font-bold shadow-xs hover:bg-[var(--color-action-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] ml-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Calculando seu diagnóstico...</span>
              </>
            ) : isLastStep ? (
              <>
                <span>Ver Meu Diagnóstico</span>
                <Sparkles className="size-4" />
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 6.2. Componente: Tela do Diagnóstico Revelado & Prescrição
Arquivo: `components/diagnostic/value-diagnostic-result.tsx`

```tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveValueDiagnosticUI } from "@/lib/value-diagnostic-types";
import { completeValueActionMission } from "@/app/diagnostic/actions";

interface ValueDiagnosticResultProps {
  diagnostic: ActiveValueDiagnosticUI;
  workspaceId: string;
}

export function ValueDiagnosticResult({ diagnostic, workspaceId }: ValueDiagnosticResultProps) {
  const [missions, setMissions] = useState(diagnostic.missions);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(
    missions.length > 0 ? missions[0].action_id : null
  );
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleMissionComplete = (actionId: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    startTransition(async () => {
      const res = await completeValueActionMission({
        workspaceId,
        actionId,
      });

      if (res.ok) {
        setMissions((prev) =>
          prev.map((m) =>
            m.action_id === actionId
              ? { ...m, status: m.status === "completed" ? "not_started" : "completed" }
              : m
          )
        );
      }
    });
  };

  const handleCopyScript = async (actionId: string, scriptText: string) => {
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopiedScriptId(actionId);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setTimeout(() => setCopiedScriptId(null), 3000);
    } catch {}
  };

  const completedCount = missions.filter((m) => m.status === "completed").length;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* 1. Card de Boas-Vindas Empáticas (Zero Culpa) */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]">
            <CheckCircle2 className="size-4" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Diagnóstico de Valor Concluído
          </p>
        </div>

        <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] text-balance">
          {diagnostic.headline}
        </h1>

        <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
          {diagnostic.empathic_rationale}
        </p>

        {/* 2. O Contraste Perceptivo: Como ela enxerga hoje vs Amanhã */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3.5 border border-[var(--color-border-subtle)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-1">
              <AlertCircle className="size-3.5 text-[var(--color-opportunity-primary)]" />
              Como a cliente enxerga hoje
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-ink-solid)] leading-snug">
              {diagnostic.client_perception_gap.sees_today}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-revenue-subtle)] p-3.5 border border-[var(--color-revenue-primary)]/20">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)] flex items-center gap-1">
              <Sparkles className="size-3.5" />
              Como ela vai enxergar em 48h
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-ink-solid)] font-semibold leading-snug">
              {diagnostic.client_perception_gap.will_see_after}
            </p>
          </div>
        </div>
      </div>

      {/* 3. O Acordo Sagrado de 48 Horas */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/30 bg-[var(--color-action-subtle)] p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldCheck className="size-5 shrink-0 text-[var(--color-action-primary)] mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            O Acordo de 48 Horas
          </p>
          <p className="text-sm font-bold text-[var(--color-ink-solid)] leading-snug">
            Você NÃO vai baixar R$ 1 do seu preço nem dar desconto.
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            Nós vamos subir a percepção de valor do seu atendimento através de 3 missões práticas de 10 minutos cada.
          </p>
        </div>
      </div>

      {/* 4. Lista das Missões de 10 Minutos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
            Missões de Valor em 48h ({completedCount}/{missions.length} Concluídas)
          </h2>
          <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
            Tempo: ~10 min cada
          </span>
        </div>

        {missions.map((mission) => {
          const isCompleted = mission.status === "completed";
          const isExpanded = expandedMissionId === mission.action_id;
          const isCopied = copiedScriptId === mission.action_id;

          return (
            <div
              key={mission.action_id}
              className={cn(
                "rounded-[var(--radius-card)] border bg-[var(--color-surface-card)] transition-all shadow-[var(--shadow-card-resting)] overflow-hidden",
                isCompleted
                  ? "border-[var(--color-revenue-primary)]/40 bg-[var(--color-revenue-subtle)]/20"
                  : "border-[var(--color-border-subtle)]"
              )}
            >
              {/* Mission Header */}
              <div
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                onClick={() => setExpandedMissionId(isExpanded ? null : mission.action_id)}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMissionComplete(mission.action_id);
                    }}
                    aria-label={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all min-h-[48px] min-w-[48px]",
                      isCompleted
                        ? "bg-[var(--color-revenue-primary)] text-white border-[var(--color-revenue-primary)]"
                        : "border-[var(--color-border-strong)] bg-white hover:border-[var(--color-action-primary)]"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin text-[var(--color-ink-muted)]" />
                    ) : (
                      <Check className={cn("size-4", isCompleted ? "opacity-100 stroke-[3]" : "opacity-0")} />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-action-primary)]">
                        Missão {mission.mission_number}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink-muted)]">
                        <Clock3 className="size-3" />
                        {mission.duration_minutes} min
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "text-sm sm:text-base font-bold leading-tight mt-0.5",
                        isCompleted ? "line-through text-[var(--color-ink-muted)]" : "text-[var(--color-ink-solid)]"
                      )}
                    >
                      {mission.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center text-[var(--color-ink-muted)]">
                  {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                </div>
              </div>

              {/* Mission Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 border-t border-[var(--color-border-subtle)] pt-3 space-y-4">
                  {/* Princípio Científico */}
                  <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3 border border-[var(--color-border-subtle)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                      Fundamento da Neurociência & Marketing
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      {mission.scientific_principle}
                    </p>
                  </div>

                  {/* Passo a Passo */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                      O que fazer agora (Passo a Passo de 10 min):
                    </p>
                    <ol className="space-y-2 pl-1">
                      {mission.action_steps.map((step, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-[var(--color-ink-solid)] flex items-start gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[11px] font-bold text-[var(--color-ink-muted)] mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Roteiro Pronto para Copiar */}
                  {mission.ready_to_use_script && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                          Roteiro Pronto para Falar ou Enviar:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(mission.action_id, mission.ready_to_use_script!)}
                          className="inline-flex min-h-[48px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-primary)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
                        >
                          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          <span>{isCopied ? "Copiado!" : "Copiar Roteiro"}</span>
                        </button>
                      </div>

                      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3 text-xs sm:text-sm font-mono leading-relaxed text-[var(--color-ink-solid)] border border-[var(--color-border-subtle)] select-all">
                        {mission.ready_to_use_script}
                      </div>
                    </div>
                  )}

                  {/* Botão de Conclusão da Missão */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleMissionComplete(mission.action_id)}
                      className={cn(
                        "w-full inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]",
                        isCompleted
                          ? "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                          : "bg-[var(--color-action-primary)] text-white hover:bg-[var(--color-action-hover)] shadow-xs"
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{isCompleted ? "Desmarcar Conclusão" : "Concluir Missão de 10 min"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 6.3. Componente: Micro-Aprendizagem Pedagógica ("Pílula de Café" - 1 Minuto)
Arquivo: `components/diagnostic/micro-learning-pill.tsx`

```tsx
"use client";

import * as React from "react";
import { useState, useRef, useTransition } from "react";
import {
  Coffee,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
  Volume2,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MicroLearningPillUI } from "@/lib/value-diagnostic-types";
import { markLearningPillConsumedAction } from "@/app/diagnostic/actions";

interface MicroLearningPillProps {
  pill: MicroLearningPillUI;
  workspaceId: string;
}

export function MicroLearningPill({ pill, workspaceId }: MicroLearningPillProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [mode, setMode] = useState<"audio" | "cards">("audio");
  const [copiedScript, setCopiedScript] = useState(false);
  const [isConsumed, setIsConsumed] = useState(pill.consumed_today);
  const [isPending, startTransition] = useTransition();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      // Registra consumo no play
      if (!isConsumed) {
        handleMarkConsumed();
      }
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.ended) {
        setIsPlaying(false);
      }
    }
  };

  const handleMarkConsumed = () => {
    startTransition(async () => {
      const res = await markLearningPillConsumedAction({
        workspaceId,
        pillId: pill.pill_id,
      });
      if (res.ok) {
        setIsConsumed(true);
      }
    });
  };

  const handleCopy = async () => {
    if (!pill.quick_script_to_copy) return;
    try {
      await navigator.clipboard.writeText(pill.quick_script_to_copy);
      setCopiedScript(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setTimeout(() => setCopiedScript(false), 3000);
    } catch {}
  };

  return (
    <aside
      aria-label="Pílula de aprendizado de 1 minuto"
      className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)]"
    >
      {/* Top Header: Pílula do Café & Status do Café Tomado */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
            <Coffee className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
              Pílula do Café • {pill.duration_seconds}s
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Mestre: <span className="font-semibold text-[var(--color-ink-solid)]">{pill.expert_reference}</span>
            </p>
          </div>
        </div>

        {/* Marcador Amigável de Conclusão */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleMarkConsumed}
            disabled={isConsumed || isPending}
            className={cn(
              "inline-flex min-h-[48px] items-center gap-1 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all",
              isConsumed
                ? "bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] border border-[var(--color-revenue-primary)]/30"
                : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
            )}
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isConsumed ? "Café tomado hoje" : "Ouvir agora"}</span>
          </button>
        </div>
      </div>

      {/* Título da Pílula */}
      <div className="mt-3">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-ink-solid)] leading-snug">
          {pill.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)] leading-relaxed text-pretty">
          "{pill.catchphrase}"
        </p>
      </div>

      {/* Alternador de Formato: Áudio vs Cards Visuais */}
      <div className="mt-4 flex items-center justify-between gap-2 border-y border-[var(--color-border-subtle)] py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          Como prefere aprender?
        </span>
        <div className="inline-flex rounded-[var(--radius-button)] bg-[var(--color-surface-muted)] p-0.5 border border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={cn(
              "inline-flex min-h-[48px] items-center gap-1.5 px-3 rounded-[var(--radius-button)] text-xs font-bold transition-colors",
              mode === "audio"
                ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
            )}
          >
            <Volume2 className="size-3.5" />
            <span>Áudio ({pill.duration_seconds}s)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("cards")}
            className={cn(
              "inline-flex min-h-[48px] items-center gap-1.5 px-3 rounded-[var(--radius-button)] text-xs font-bold transition-colors",
              mode === "cards"
                ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Cards Rápidos</span>
          </button>
        </div>
      </div>

      {/* Player de Áudio Guiado */}
      {mode === "audio" ? (
        <div className="mt-4 space-y-3">
          {/* Elemento de Áudio Oculto */}
          {pill.audio_url && (
            <audio
              ref={audioRef}
              src={pill.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar áudio" : "Ouvir áudio explicativo"}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-white shadow-sm hover:bg-[var(--color-action-hover)] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              {/* Barra de Progresso do Áudio */}
              <div className="h-2 w-full bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-action-primary)] transition-all duration-100"
                  style={{
                    width: `${pill.duration_seconds ? (currentTime / pill.duration_seconds) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-muted)]">
                <span>{Math.floor(currentTime)}s</span>
                <span>{pill.duration_seconds}s</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeedChange}
              aria-label="Alternar velocidade"
              className="inline-flex min-h-[48px] items-center justify-center px-2.5 rounded-[var(--radius-button)] text-xs font-mono font-bold bg-[var(--color-surface-muted)] text-[var(--color-ink-solid)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)]"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Transcrição Textual Rápida */}
          <details className="text-xs text-[var(--color-ink-muted)] pt-1">
            <summary className="cursor-pointer font-bold text-[var(--color-action-primary)] hover:underline">
              Ver transcrição do áudio
            </summary>
            <p className="mt-2 p-3 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] leading-relaxed text-pretty font-sans text-[var(--color-ink-solid)]">
              {pill.audio_transcript}
            </p>
          </details>
        </div>
      ) : (
        /* Modo Cards Visuais (Estilo Stories em 3 Telas) */
        <div className="mt-4 space-y-3">
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4 border border-[var(--color-border-subtle)] min-h-[110px] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] text-[10px] font-bold text-[var(--color-action-primary)] uppercase tracking-wider mb-2">
                {pill.visual_cards[activeCardIndex]?.tag || `Passo ${activeCardIndex + 1}`}
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-ink-solid)] leading-relaxed">
                {pill.visual_cards[activeCardIndex]?.text}
              </p>
            </div>

            {/* Paginação dos Cards */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--color-border-subtle)]/60">
              <div className="flex items-center gap-1.5">
                {pill.visual_cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCardIndex(i)}
                    aria-label={`Ir para o card ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      activeCardIndex === i
                        ? "w-5 bg-[var(--color-action-primary)]"
                        : "w-2 bg-[var(--color-border-strong)]"
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveCardIndex((prev) => (prev + 1) % pill.visual_cards.length)}
                className="inline-flex min-h-[48px] items-center gap-1 text-xs font-bold text-[var(--color-action-primary)]"
              >
                <span>{activeCardIndex === pill.visual_cards.length - 1 ? "Voltar ao Início" : "Próximo"}</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão One-Tap para Copiar Script Prático se existir */}
      {pill.quick_script_to_copy && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--color-ink-muted)] truncate">
            Script prático para usar no WhatsApp:
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[48px] shrink-0 items-center gap-1.5 px-3 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-primary)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            {copiedScript ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span>{copiedScript ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
```

---

## 7. Critérios de Aceite BDD & Cenários de Teste (Gherkin)

```gherkin
Funcionalidade: Motor de Diagnóstico de Percepção de Valor e Micro-Aprendizagem
  Como uma profissional autônoma de serviços
  Eu quero diagnosticar o porquê minhas clientes acham caro e aprender em 1 minuto
  Para que eu consiga valorizar meu trabalho, parar de dar descontos e aumentar minha renda com dignidade

  Contexto:
    Dado que estou autenticada no Agenda 80/20
    E possuo um workspace ativo vinculado ao meu negócio de serviços

  Cenário: Detecção de vazamento de valor via Copiloto e acionamento da micro-auditoria
    Dado que selecionei a objeção "Achei Caro" no SOS Copiloto de Vendas por 2 vezes nesta semana
    Quando eu visualizo a resposta no Copiloto
    Então o sistema deve exibir o banner pedagógico "Quer fazer uma Micro-Auditoria de 45 segundos?"
    E ao tocar no botão "Fazer Micro-Auditoria"
    O modal interativo de 3 perguntas deve ser aberto na primeira pergunta

  Cenário: Resolução da micro-auditoria de 45 segundos e revelação acolhedora
    Dado que estou no modal da micro-auditoria
    Quando respondo às 3 perguntas selecionando opções que pontuam 25 de 100 pontos
    E toco em "Ver Meu Diagnóstico"
    Então o sistema deve calcular o IVP (Índice de Valor Percebido) em tempo real
    E classificar meu negócio no arquétipo "price_prisoner" (A Prisioneira do Preço)
    E exibir a mensagem empática de desculpabilização técnica: "O problema nunca foi a sua técnica"
    E apresentar o Acordo de 48 Horas prescrevendo as 3 missões de 10 minutos

  Cenário: Conclusão de uma micro-missão de 10 minutos (O Ritual do Espelho)
    Dado que tenho um plano de alto valor ativo com a "Missão 1: O Ritual do Espelho" pendente
    Quando toco no botão de conclusão da Missão 1
    Então o sistema deve emitir um feedback háptico de 30ms no celular
    E persistir a conclusão no banco com timestamp
    E atualizar o contador para "1/3 Concluídas" com celebração visual

  Cenário: Consumo da Pílula do Café de 1 minuto entre atendimentos
    Dado que estou na tela Hoje e vejo o card "Pílula do Café • 52s" do Alex Hormozi
    Quando toco no botão Play
    Então o áudio começa a tocar com barra de progresso em tempo real
    E o indicador do dia é marcado automaticamente como "Café tomado hoje"
    E ao tocar em "Copiar", o script da Equação de Valor é copiado para a área de transferência

  Cenário: Isolamento estrito de multitenancy (RLS)
    Dado que outro usuário de outro workspace tenta ler os resultados de diagnóstico deste workspace
    Quando uma requisição direta ou RPC é executada com token de outro usuário
    Então o PostgreSQL deve negar a leitura retornando zero registros ou erro de permissão (42501)
```

---

## 8. Roteiro de Implementação para a Equipe

1. **Sprint Database:**
   - Criar arquivo `supabase/migrations/20260902000000_value_perception_diagnostic_engine.sql` com o DDL completo, RLS e RPCs.
   - Executar migração no banco de dados e validar as funções de cálculo.
2. **Sprint Core Logic:**
   - Criar `lib/value-diagnostic-types.ts` com tipos TypeScript e validação Zod.
   - Criar `app/diagnostic/actions.ts` exportando as Server Actions:
     - `submitValueDiagnosticAction`
     - `completeValueActionMission`
     - `markLearningPillConsumedAction`
3. **Sprint UI Components:**
   - Criar `components/diagnostic/value-diagnostic-modal.tsx`.
   - Criar `components/diagnostic/value-diagnostic-result.tsx`.
   - Criar `components/diagnostic/micro-learning-pill.tsx`.
4. **Sprint Integration:**
   - Integrar o gatilho da Micro-Auditoria no `sales-copilot-drawer.tsx` quando a categoria for `price_too_high`.
   - Integrar o componente `MicroLearningPill` na página `app/today/page.tsx`.
   - Criar a rota de diagnóstico dedicada `app/diagnostic/page.tsx` para visualização e acompanhamento contínuo do plano de valor.
5. **Sprint QA & Telemetria:**
   - Validar cenários de teste Gherkin em staging.
