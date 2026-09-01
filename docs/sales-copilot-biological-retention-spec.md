# Agenda 80/20 — Especificação Técnica Executável (SPEC)
## Módulos: SOS Copiloto de Vendas, Roteiro de Áudio, Trava de Prontidão e Retenção Biológica

**Status:** Aprovado para Implementação Executável  
**Versão:** 1.0.0 — Setembro/2026  
**Autoridade:** Líder Técnico de Arquitetura de Software & Especificação Executável do Comitê  
**Stack Canônica:** Next.js 16.3.3 (App Router, Server Actions, React 19.2.8), TypeScript strict, Tailwind CSS v4 (@theme OKLCH), Supabase / PostgreSQL 15+ (RLS estrito, Security Definer, RPCs versionadas), Zod 4.4.3.  
**Compatibilidade:** 100% Aditiva sobre as Fases 0 a 11. Preserva o Growth Coach legado, Workspaces e o canal parceiro Belevy.

---

## 1. Visão Geral e Síntese de Integração dos Especialistas

Esta especificação consolida e orquestra as diretrizes de todos os especialistas do comitê em uma arquitetura executável direta para o repositório **Agenda 80/20**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           AGENDA 80/20 CORE                            │
 ├────────────────────────────────┬───────────────────────────────────────┤
 │     PSICOLOGIA & UX EMPÁTICA    │       MOTOR DE VENDAS & RETENÇÃO      │
 │  • Modelo BJ Fogg (B = MAP)    │  • SOS Copiloto (Drawer deslizante)   │
 │  • Zero Ansiedade / Micro-Ação │  • Roteiro de Áudio / Teleprompter    │
 │  • Ergonomia One-Thumb (48px)  │  • Retenção Biológica (Ciclos de dias)│
 │  • Haptic Feedback Tátil       │  • Trava de Prontidão (Guardrails)    │
 └────────────────────────────────┴───────────────────────────────────────┘
                                  │
                                  ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    CAMADA DE PERSISTÊNCIA & RLS (PG)                   │
 │  • copilot_templates            • objection_interactions               │
 │  • recurrence_cycle_days        • v_due_retentions (View Otimizada)    │
 │  • check_readiness_lock()       • get_copilot_templates()              │
 └────────────────────────────────┘
```

### 1.1. Os 7 Pilares Integrados

1. **UX Empática do Autônomo:**  
   O profissional solo atua sob sobrecarga física e mental, consultando o app em janelas de 2 a 5 minutos entre atendimentos. As interfaces evitam métricas estressantes ou dashboards complexos. Toda ação principal reside no terço inferior da tela (zona ergonômica do polegar), possui alvo de toque $\ge 48\text{px}$ e fornece microinterações hápticas (`navigator.vibrate(25)`).
2. **Lógica Psicológica Comportamental (BJ Fogg $B = MAP$):**  
   O comportamento desejado (enviar mensagem/fechar horário) só ocorre quando **Motivação**, **Habilidade** e **Gatilho** convergem.  
   - *Habilidade:* Reduzida a quase zero atrito com roteiros pré-escritos e cópia em 1 clique (elimina a "paralisia da folha em branco").  
   - *Motivação:* Revelada através de cards explicativos objetivos ("Por que funciona agora? Não pressiona e oferece opção binária").  
   - *Gatilho:* Nudges oportunos contextualizados por dados reais (ex: tempo desde último atendimento, horário vago no dia seguinte).
3. **Roteiro de Áudio (Teleprompter Guiado):**  
   Muitos clientes de serviços respondem muito melhor a áudios calorosos no WhatsApp do que a blocos de texto frio. O profissional conta com um alternador instantâneo `[Texto | Áudio]`. No modo áudio, a interface transforma-se em um teleprompter de bolso com estimativa de segundos de gravação (ex: `⏱️ 24s`), marcações de ritmo e entonação (`[Tom caloroso]`, `[Pausa 1s]`) e orientações psicológicas para evitar dicção robotizada.
4. **SOS Copiloto de Vendas (`sales-copilot-drawer.tsx`):**  
   Gaveta deslizante mobile-first com acesso imediato a respostas táticas para as 5 maiores objeções de balcão/WhatsApp:  
   - *"Achei caro / Está fora do orçamento"*  
   - *"Vou ver e te aviso / Depois te chamo"*  
   - *"Preciso falar com meu marido/esposa"*  
   - *"Só queria saber o preço"*  
   - *"Não tenho horário livre nesta semana"*  
   Cada objeção traz a decodificação do subtexto psicológico da cliente e 2 opções de resposta (Direta vs. Consultiva).
5. **Trava de Prontidão (Readiness Lock / Guardrail):**  
   Impede o autônomo de disparar ações de prospecção caso seus fundamentos ou agenda estejam descalibrados. Se o profissional tentar rodar um protocolo de oferta de horários (`CONV_03_TWO_REAL_SLOTS` ou `AVAIL_01_REAL_SLOT`) sem horários livres cadastrados ou sem regras ativas, o sistema ativa um bloqueio pedagógico calmo, orientando-o a abrir a agenda antes de convidar pessoas.
6. **Retenção Biológica (`recurrence_cycle_days` & `v_due_retentions`):**  
   O corpo humano e os serviços estéticos/terapêuticos seguem cadências fisiológicas naturais (crescimento de unhas: 21-28 dias; renovação de cílios: 15-21 dias; corte/raiz de cabelo: 30-45 dias; massagem/dor: 15 dias). O sistema monitora a data do último atendimento concluído e calcula a janela biológica de retorno (`early`, `optimal_timing`, `overdue`), gerando na tela Hoje o momento exato em que a abordagem soa como cuidado profissional proativo, nunca como desespero comercial.
7. **Módulos Avançados & Auditoria RLS:**  
   Catálogo de templates auditado em banco (`copilot_templates`), rastreamento anônimo e seguro de eficácia de objeções (`objection_interactions`), Server Actions tipadas com Zod v4 e execução de RPCs seguras em PostgreSQL com isolamento estrito por `workspace_id`.

---

## 2. Auditoria da Arquitetura Vigente e Diretrizes de Conformidade

### 2.1. Arquitetura Atual do Repositório
- **Next.js 16.3.3 App Router:** Server Components como padrão para busca de dados (`app/today/page.tsx`, `app/action/[recommendationId]/page.tsx`). Mutações exclusivamente via Server Actions em `actions.ts` ou Route Handlers isolados.
- **Tailwind CSS v4 & OKLCH:** Configurado via `@theme` em `app/globals.css`. Não existem classes Tailwind arbitrárias fora dos tokens definidos (`--color-canvas`, `--color-surface-card`, `--color-surface-muted`, `--color-action-primary`, `--color-action-subtle`, `--color-revenue-primary`, `--color-opportunity-primary`, `--color-danger-primary`, `--color-ink-solid`, `--color-ink-muted`, `--color-border-subtle`, `--color-border-strong`).
- **Ergonomia e Anti-Slop (`DESIGN.md`):**
  - Alvo de toque mínimo: `min-h-[48px]`.
  - Bordas de cartões: raio uniforme de 14px (`rounded-[var(--radius-card)]`), sem faixas laterais coloridas decorativas (`border-left: 4px`).
  - Sem degradês de texto; sem sombras difusas desproporcionais (usar `--shadow-card-resting`).
  - Textos longos com `text-pretty`, títulos curtos com `text-balance`.
- **Supabase SSR:** Clientes instanciados via `createClient()` de `@/lib/supabase/server`. Sessão verificada via `getClaims()`. Todas as funções SQL privilegiadas são `security definer` com `set search_path = pg_catalog, public`.

---

## 3. Modelo de Dados Aditivo (Database Schema)

Arquivo de Migration canônico:  
`supabase/migrations/20260901000000_copilot_and_biological_retention.sql`

```sql
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

create policy copilot_templates_read on public.copilot_templates 
  for select to authenticated using (active = true);

revoke all on table public.objection_interactions from public, anon;
grant select, insert, update on table public.objection_interactions to authenticated;

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
```

---

## 4. Especificação dos Componentes de Frontend

### 4.1. `components/copilot/sales-copilot-drawer.tsx`
**Papel:** Drawer/Bottom Sheet deslizante acessível de forma onipresente no rodapé do mobile ou acionável a partir de qualquer tela de ação.  
**Ergonomia:** Alvo de toque no terço inferior, transição CSS fluida (`transition-transform duration-200 ease-out`), suporte a fechar por arraste ou backdrop, `max-w-lg mx-auto`.

```tsx
"use client";

import * as React from "react";
import { MessageSquare, Mic, ShieldAlert, X, Copy, Check, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScriptModeToggle, type ScriptMode } from "./script-mode-toggle";
import { AudioTeleprompter } from "./audio-teleprompter";
import { PsychologicalRationaleCard } from "./psychological-rationale-card";

export interface CopilotTemplate {
  id: string;
  slug: string;
  objection_category: string;
  title: string;
  psychological_rationale: string;
  client_subtext: string;
  script_text: string;
  script_audio: string;
  audio_duration_seconds: number;
  audio_tone_guide: string;
  approach_type: "direct" | "consultative" | "downsell";
}

interface SalesCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CopilotTemplate[];
  onTrackUse?: (templateId: string, mode: ScriptMode) => void;
}

export function SalesCopilotDrawer({
  isOpen,
  onClose,
  templates,
  onTrackUse,
}: SalesCopilotDrawerProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("price_too_high");
  const [activeTemplate, setActiveTemplate] = React.useState<CopilotTemplate | null>(null);
  const [mode, setMode] = React.useState<ScriptMode>("text");
  const [copied, setCopied] = React.useState(false);

  // Filtra templates pela categoria selecionada
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => t.objection_category === selectedCategory);
  }, [templates, selectedCategory]);

  React.useEffect(() => {
    if (filteredTemplates.length > 0 && !activeTemplate) {
      setActiveTemplate(filteredTemplates[0]);
    }
  }, [filteredTemplates, activeTemplate]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    if (!activeTemplate) return;
    try {
      await navigator.clipboard.writeText(activeTemplate.script_text);
      if ("vibrate" in navigator) navigator.vibrate(25);
      setCopied(true);
      onTrackUse?.(activeTemplate.id, "text");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl mx-auto rounded-t-[18px] bg-[var(--color-surface-card)] border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-card-elevated)] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="copilot-drawer-title"
      >
        {/* Top Handle / Grab Bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[var(--color-border-strong)] opacity-60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-[var(--radius-sm)] bg-[var(--color-action-subtle)] flex items-center justify-center text-[var(--color-action-primary)]">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <h2 id="copilot-drawer-title" className="text-base font-bold text-[var(--color-ink-solid)] leading-tight">
                SOS Copiloto de Vendas
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Destrave objeções e feche horários sem pressão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar copiloto"
            className="size-10 rounded-full flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Categorias de Objeção (Pills horizontais) */}
        <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto border-b border-[var(--color-border-subtle)] scrollbar-none">
          {[
            { id: "price_too_high", label: "Achei Caro" },
            { id: "procrastination", label: "Vou Ver e Te Aviso" },
            { id: "third_party_decision", label: "Ver com Marido" },
            { id: "just_browsing", label: "Só o Preço" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                const next = templates.find((t) => t.objection_category === cat.id);
                setActiveTemplate(next ?? null);
              }}
              className={cn(
                "min-h-[40px] px-3.5 py-1.5 rounded-[var(--radius-pill)] text-xs font-bold whitespace-nowrap transition-colors border",
                selectedCategory === cat.id
                  ? "bg-[var(--color-action-primary)] text-white border-[var(--color-action-primary)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeTemplate ? (
            <>
              {/* Card de Desconstrução Psicológica */}
              <PsychologicalRationaleCard
                clientSubtext={activeTemplate.client_subtext}
                rationale={activeTemplate.psychological_rationale}
              />

              {/* Segmented Control: Texto vs Áudio */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                  Formato de Envio
                </span>
                <ScriptModeToggle mode={mode} onChange={setMode} />
              </div>

              {/* Conteúdo do Roteiro */}
              {mode === "text" ? (
                <div className="space-y-3">
                  <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-4 text-sm font-mono leading-relaxed text-[var(--color-ink-solid)] select-all">
                    &ldquo;{activeTemplate.script_text}&rdquo;
                  </div>

                  <Button
                    onClick={handleCopyText}
                    variant={copied ? "revenue" : "primary"}
                    fullWidth
                    className="min-h-[48px] text-sm font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        <span>Copiado com sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        <span>Copiar Mensagem Pronta</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <AudioTeleprompter
                  script={activeTemplate.script_audio}
                  durationSeconds={activeTemplate.audio_duration_seconds}
                  toneGuide={activeTemplate.audio_tone_guide}
                  onDone={() => onTrackUse?.(activeTemplate.id, "audio")}
                />
              )}
            </>
          ) : (
            <p className="text-center text-sm text-[var(--color-ink-muted)] py-8">
              Nenhum template disponível para esta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 4.2. `components/copilot/script-mode-toggle.tsx`
**Papel:** Alternador ergonômico acessível com touch target $\ge 40\text{px}$, suporte a leitor de tela e transição visual instantânea.

```tsx
"use client";

import * as React from "react";
import { MessageSquare, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScriptMode = "text" | "audio";

interface ScriptModeToggleProps {
  mode: ScriptMode;
  onChange: (mode: ScriptMode) => void;
  className?: string;
}

export function ScriptModeToggle({ mode, onChange, className }: ScriptModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Alternar formato do roteiro"
      className={cn(
        "inline-flex p-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("text")}
        aria-pressed={mode === "text"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[var(--radius-pill)] text-xs font-bold transition-all duration-150",
          mode === "text"
            ? "bg-white text-[var(--color-action-primary)] shadow-xs"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
        )}
      >
        <MessageSquare className="size-3.5" aria-hidden="true" />
        <span>Texto</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("audio")}
        aria-pressed={mode === "audio"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[var(--radius-pill)] text-xs font-bold transition-all duration-150",
          mode === "audio"
            ? "bg-white text-[var(--color-action-primary)] shadow-xs"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
        )}
      >
        <Mic className="size-3.5" aria-hidden="true" />
        <span>Roteiro de Áudio</span>
      </button>
    </div>
  );
}
```

---

### 4.3. `components/copilot/psychological-rationale-card.tsx`
**Papel:** Explicitar para o profissional o subtexto inconsciente da cliente e a justificativa comportamental por trás do script (BJ Fogg $B=MAP$), diminuindo a culpa e o receio de vender.

```tsx
import * as React from "react";
import { Sparkles, Brain, HelpCircle } from "lucide-react";

interface PsychologicalRationaleCardProps {
  clientSubtext: string;
  rationale: string;
}

export function PsychologicalRationaleCard({
  clientSubtext,
  rationale,
}: PsychologicalRationaleCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-4 space-y-2.5">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
          <HelpCircle className="size-3.5" />
          O que a cliente realmente pensa
        </span>
        <p className="mt-1 text-xs sm:text-sm font-semibold italic text-[var(--color-ink-solid)]">
          &ldquo;{clientSubtext}&rdquo;
        </p>
      </div>

      <div className="border-t border-[var(--color-action-primary)]/15 pt-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          <Brain className="size-3.5 text-[var(--color-action-primary)]" />
          Por que esta resposta funciona
        </span>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed text-pretty">
          {rationale}
        </p>
      </div>
    </div>
  );
}
```

---

### 4.4. `components/copilot/audio-teleprompter.tsx`
**Papel:** Teleprompter guiado para gravação no WhatsApp com estimativa de segundos de áudio, instruções de tom e botões de ritmo.

```tsx
"use client";

import * as React from "react";
import { Clock, Volume2, CheckCircle2, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AudioTeleprompterProps {
  script: string;
  durationSeconds: number;
  toneGuide: string;
  onDone?: () => void;
}

export function AudioTeleprompter({
  script,
  durationSeconds,
  toneGuide,
  onDone,
}: AudioTeleprompterProps) {
  const [completed, setCompleted] = React.useState(false);

  const handleComplete = () => {
    if ("vibrate" in navigator) navigator.vibrate(25);
    setCompleted(true);
    onDone?.();
  };

  return (
    <div className="space-y-3">
      {/* Meta Header */}
      <div className="flex items-center justify-between">
        <Badge variant="action" className="font-bold">
          <Clock className="size-3" />
          Duração Estimada: ~{durationSeconds} segundos
        </Badge>
        <span className="text-[11px] text-[var(--color-ink-muted)] font-medium">
          Grave segurando o mic no WhatsApp
        </span>
      </div>

      {/* Guia de Tom */}
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-2.5 flex items-start gap-2">
        <Volume2 className="size-4 text-[var(--color-action-primary)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-ink-muted)] leading-tight">
          <strong className="text-[var(--color-ink-solid)]">Tom recomendado:</strong> {toneGuide}
        </p>
      </div>

      {/* Teleprompter Box */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-strong)] bg-white p-4 sm:p-5 shadow-xs">
        <p className="text-sm sm:text-base font-medium leading-relaxed text-[var(--color-ink-solid)] space-y-2 whitespace-pre-line text-pretty">
          {script.split("\n").map((paragraph, i) => (
            <span key={i} className="block">
              {paragraph}
            </span>
          ))}
        </p>
      </div>

      <Button
        onClick={handleComplete}
        variant={completed ? "revenue" : "primary"}
        fullWidth
        className="min-h-[48px] text-sm font-bold"
      >
        {completed ? (
          <>
            <CheckCircle2 className="size-4" />
            <span>Áudio Enviado!</span>
          </>
        ) : (
          <span>Marcar como Enviado</span>
        )}
      </Button>
    </div>
  );
}
```

---

### 4.5. `components/copilot/retention-opportunity-card.tsx`
**Papel:** Card de oportunidade na tela Hoje (`app/today/page.tsx`), apresentando a cliente no ponto ideal de retorno biológico com botão One-Tap para WhatsApp.

```tsx
"use client";

import * as React from "react";
import { MessageCircle, Clock, Calendar, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DueRetentionItem {
  appointment_id: string;
  customer_id: string;
  customer_name: string;
  customer_contact: string | null;
  service_id: string;
  service_name: string;
  recurrence_cycle_days: number;
  days_since_completed: number;
  variance_days: number;
  timing_status: "optimal_timing" | "overdue";
}

interface RetentionOpportunityCardProps {
  item: DueRetentionItem;
  onOpenCopilot?: (category: string) => void;
}

export function RetentionOpportunityCard({
  item,
  onOpenCopilot,
}: RetentionOpportunityCardProps) {
  const isOptimal = item.timing_status === "optimal_timing";

  const message = `Oi ${item.customer_name}! Tudo bem? Lembrei que hoje faz ${item.days_since_completed} dias desde o seu último atendimento de ${item.service_name}. Para manter o resultado perfeito e sem danificar, já separei dois horários para o seu retorno nesta semana: quinta às 15h ou sexta às 11h. Qual fica melhor para você?`;

  const handleWhatsApp = () => {
    if ("vibrate" in navigator) navigator.vibrate(25);
    const cleanPhone = (item.customer_contact ?? "").replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/25 bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={isOptimal ? "revenue" : "opportunity"}>
          <RefreshCw className="size-3 animate-spin-reverse" />
          <span>{isOptimal ? "Momento Biológico Perfeito" : "Retorno em Atraso"}</span>
        </Badge>
        <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
          {item.days_since_completed} dias decorridos
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--color-ink-solid)]">
          {item.customer_name} — {item.service_name}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          {isOptimal
            ? `O ciclo ideal desse serviço é de ${item.recurrence_cycle_days} dias. Entrar em contato agora soa como cuidado profissional proativo.`
            : `A manutenção passou ${item.variance_days} dias do prazo ideal. Uma mensagem atenciosa evita que a cliente busque outro local por urgência.`}
        </p>
      </div>

      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-3 text-xs font-mono text-[var(--color-ink-solid)] line-clamp-2">
        &ldquo;{message}&rdquo;
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          onClick={handleWhatsApp}
          variant="revenue"
          className="flex-1 min-h-[48px] text-xs sm:text-sm font-bold"
        >
          <MessageCircle className="size-4" />
          <span>Enviar via WhatsApp</span>
        </Button>
      </div>
    </article>
  );
}
```

---

### 4.6. `components/copilot/readiness-lock-banner.tsx`
**Papel:** Bloqueio pedagógico para a Trava de Prontidão. Substitui o botão de ação cega por um aviso calmo que guia o usuário para a resolução do gargalo.

```tsx
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadinessLockBannerProps {
  reason: string;
  fixUrl: string;
}

export function ReadinessLockBanner({ reason, fixUrl }: ReadinessLockBannerProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/40 bg-[var(--color-opportunity-subtle)] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-white flex items-center justify-center text-[var(--color-opportunity-primary)] shadow-xs">
          <Lock className="size-3.5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-opportunity-primary)]">
          Trava de Prontidão Ativa
        </span>
      </div>

      <p className="text-sm font-semibold text-[var(--color-ink-solid)] leading-snug">
        {reason}
      </p>

      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        Para manter sua reputação e autoridade, não fazemos convites sem antes garantir que você tenha onde receber essa cliente.
      </p>

      <Link
        href={fixUrl}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-action-hover)]"
      >
        <span>Resolver pendência na Agenda</span>
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
```

---

## 5. Integração nas Telas Principais

### 5.1. Integração na Tela Hoje (`app/today/page.tsx`)
A página `app/today/page.tsx` passará a:
1. Consultar concorrentemente:
   - `supabase.rpc("get_today_plan")`
   - `supabase.rpc("get_belevy_benefit")`
   - `supabase.rpc("get_due_retentions", { p_limit: 3 })`
   - `supabase.rpc("get_copilot_templates")`
2. Exibir o bloco de **Retenção Biológica Devida** logo após o Foco do Dia e antes da Ação Prioritária (ou como card intercalado de alta prioridade quando `timing_status = 'optimal_timing'`).
3. Renderizar o botão flutuante/atalho do **SOS Copiloto de Vendas** no terço inferior, abrindo o `SalesCopilotDrawer`.

### 5.2. Integração no Detalhe da Ação (`app/action/[recommendationId]/action-detail.tsx`)
No detalhe da recomendação:
1. Adicionar o `ScriptModeToggle` acima de `detail.message_template`.
2. Se `mode === 'audio'`, renderizar o `AudioTeleprompter` com as instruções de voz.
3. Incorporar o botão discreto: `"Cliente trouxe uma objeção? Abrir Copiloto SOS"` que dispara o drawer sem sair da tela.

---

## 6. Server Actions e Handlers Seguros (TypeScript Strict)

Arquivo: `app/action/copilot-actions.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

const TrackObjectionSchema = z.object({
  templateId: z.string().uuid(),
  category: z.enum([
    "price_too_high",
    "procrastination",
    "third_party_decision",
    "just_browsing",
    "schedule_friction",
  ]),
  mode: z.enum(["text", "audio"]),
  customerId: z.string().uuid().optional(),
  resolution: z.enum(["converted", "declined", "dismissed", "pending"]).default("pending"),
});

export async function trackCopilotUsage(input: z.infer<typeof TrackObjectionSchema>) {
  const parsed = TrackObjectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de rastreamento inválidos." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("track_objection_interaction", {
    p_template_id: parsed.data.templateId,
    p_category: parsed.data.category,
    p_mode: parsed.data.mode,
    p_customer_id: parsed.data.customerId ?? null,
    p_resolution: parsed.data.resolution,
  });

  if (error) {
    return { ok: false, error: "Erro ao registrar telemetria do copiloto." };
  }

  await trackAnalyticsEvent("copilot_template_used", {
    category: parsed.data.category,
    mode: parsed.data.mode,
  });

  return { ok: true, interactionId: data };
}

export async function verifyActionReadiness(actionSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_readiness_lock", {
    p_action_slug: actionSlug,
  });

  if (error || !data) {
    return { locked: false, reason: null, fix_url: null };
  }

  return data as { locked: boolean; reason: string | null; fix_url: string | null };
}
```

---

## 7. Critérios de Aceite Formais (BDD / Gherkin)

```gherkin
Funcionalidade: SOS Copiloto de Vendas e Roteiro de Áudio
  Como profissional autônomo sob rotina intensa
  Quero respostas imediatas e roteiros de áudio guiados para objeções no WhatsApp
  Para fechar atendimentos sem sofrer paralisia de decisão

  Cenário: Abertura do SOS Copiloto com One-Thumb Reach
    Dado que estou autenticado na tela "/today" ou "/action/[id]"
    Quando clico no botão "SOS Copiloto" no terço inferior da tela
    Então o drawer deslizante deve subir cobrindo até 90% da altura da viewport
    E as 4 categorias de objeção devem estar visíveis com altura de toque >= 40px
    E a primeira resposta deve carregar a desconstrução psicológica e o subtexto do cliente

  Cenário: Alternância entre Modo Texto e Modo Áudio (Teleprompter)
    Dado que estou com a objeção "Achei Caro" aberta no copiloto
    Quando alterno o toggle para "Roteiro de Áudio"
    Então o script de texto é substituído pelo teleprompter guiado
    E o componente exibe a duração estimada (ex: "~28 segundos") e a instrução de tom
    E ao clicar em "Marcar como Enviado", um pulso de vibração tátil (25ms) deve ser disparado

  Cenário: Cópia com 1 Clique e Rastreamento Seguro
    Dado que selecionei o modo "Texto" para a resposta direta de preço
    Quando clico no botão "Copiar Mensagem Pronta"
    Então o texto é gravado na área de transferência
    E a RPC "track_objection_interaction" é invocada registrando o modo "text"
    E o botão exibe o estado "Copiado com sucesso!" por 2,5 segundos

Funcionalidade: Retenção Biológica Otimizada
  Como profissional de estética ou saúde
  Quero saber quando uma cliente atinge a janela ideal de manutenção biológica
  Para reativar a relação com autoridade técnica e sem parecer invasivo

  Cenário: Detecção de Cliente em Janela Ideal
    Dado que a cliente "Ana" concluiu um serviço de "Unhas em Gel" há 23 dias
    E o ciclo de retenção configurado para o serviço é de 21 dias
    Quando a tela "/today" carrega as retenções devidas via "get_due_retentions"
    Então a cliente "Ana" deve ser listada com o badge "Momento Biológico Perfeito"
    E a mensagem sugerida deve calcular exatamente os 23 dias decorridos
    E o botão "Enviar via WhatsApp" deve gerar o link wa.me com a mensagem pré-formatada

  Cenário: Cliente com Agendamento Futuro Já Marcado
    Dado que a cliente "Bruna" completou o serviço há 25 dias
    Mas possui um horário com status "confirmed" para amanhã
    Quando a view "v_due_retentions" é consultada
    Então a cliente "Bruna" NÃO deve constar na lista de retenção devida

Funcionalidade: Trava de Prontidão (Readiness Gate)
  Como orientador do Agenda 80/20
  Quero impedir que o profissional convide clientes para horários inexistentes
  Para proteger a reputação e a autoridade do prestador

  Cenário: Bloqueio de Ação de Horários Vagos sem Vagas na Agenda
    Dado que o profissional tenta executar a ação "CONV_03_TWO_REAL_SLOTS"
    Porém não cadastrou nenhuma regra semanal ativa na sua agenda
    Quando a função "check_readiness_lock" é executada no servidor
    Então o retorno deve indicar "locked: true"
    E a tela de detalhe da ação substitui o botão de conclusão pelo "ReadinessLockBanner"
    E o botão direciona para "/agenda" com a mensagem explicativa
```

---

## 8. Métricas de Validação e Telemetria de Sucesso

| Métrica de Produto | Definição / Query | Meta Alvo |
| :--- | :--- | :--- |
| **Tempo de Execução de Micro-Missão** | Tempo entre abrir a recomendação e copiar o script / marcar concluído. | $\le 2{,}5\text{ minutos}$ em 80% das sessões. |
| **Adesão ao Roteiro de Áudio** | Proporção de usos do modo `audio` vs `text` no copiloto. | $\ge 35\%$ de adoção do modo áudio. |
| **Taxa de Conversão de Retenção Biológica** | Percentual de contatos de `v_due_retentions` que geraram novo `appointment` em até 7 dias. | $\ge 42\%$ de conversão (contra 14% de reativação fria). |
| **Eficácia de Desarme de Objeção** | Interações de `objection_interactions` marcadas com status `converted`. | $\ge 30\%$ de recuperação de clientes com objeção. |
| **Zero Falsas Promessas (Trava de Prontidão)** | Incidência de cancelamentos por incompatibilidade após envio de ação de vaga. | $< 1\%$ de conflito de agenda. |

---

## 9. Roteiro Passo a Passo de Execução para os Desenvolvedores

1. **Camada de Banco de Dados:**
   - Aplicar a migration `supabase/migrations/20260901000000_copilot_and_biological_retention.sql`.
   - Executar testes de integração das RPCs `get_copilot_templates`, `get_due_retentions` e `check_readiness_lock`.
2. **Componentes UI Copiloto:**
   - Criar `components/copilot/script-mode-toggle.tsx`.
   - Criar `components/copilot/psychological-rationale-card.tsx`.
   - Criar `components/copilot/audio-teleprompter.tsx`.
   - Criar `components/copilot/readiness-lock-banner.tsx`.
   - Criar `components/copilot/retention-opportunity-card.tsx`.
   - Montar a gaveta principal `components/copilot/sales-copilot-drawer.tsx`.
3. **Integração de Server Actions:**
   - Implementar `app/action/copilot-actions.ts` com validações Zod.
4. **Acoplamento nas Páginas de Fluxo:**
   - Atualizar `app/today/page.tsx` para carregar `get_due_retentions` e renderizar as oportunidades biológicas e o gatilho do SOS Copiloto.
   - Atualizar `app/action/[recommendationId]/action-detail.tsx` para incorporar o alternador texto/áudio e o acionador de objeção.
5. **Validação E2E e Lints:**
   - Executar `npm run build` e `npm run lint`.
   - Garantir 100% de conformidade com os tokens OKLCH e ergonomia mobile.
