# Auditoria de domínio — Agenda 80/20

**Data:** 2026-08-28  
**Escopo:** `app/`, `lib/`, `supabase/`, documentação e configuração do repositório.  
**Conclusão atualizada:** o produto começou a transição de um orientador de aquisição vertical para um produto horizontal de aquisição, relacionamento e agendamento. O Growth Coach e o núcleo inicial de booking já suportam múltiplos tipos de serviço; a agenda ainda precisa das telas de configuração e gestão operacional listadas em [`product-architecture-spec.md`](product-architecture-spec.md).

## Mapa de acoplamentos encontrados

| Severidade | Local | Evidência | Decisão para o produto horizontal |
| --- | --- | --- | --- |
| Alta | `app/onboarding/onboarding-form.tsx:10`, `app/onboarding/actions.ts:9,25` | profissão é fixa em `nail_design`; rótulo inclui “Unhas / Nail Designer / Soft Gel” e a validação rejeita qualquer outro valor | trocar por seleção de nicho/especialidade configurável; manter `nail_design` como seed inicial |
| Alta | `supabase/migrations/20260828001835_phase_2_core_experience.sql:25,78` | `business_profiles.profession` e `action_versions.eligible_professions` têm default `nail_design` | migrar para referências/ códigos de `niches`; compatibilidade por view/alias e backfill |
| Alta | `supabase/migrations/20260828001835_phase_2_core_experience.sql:418` | seed e template falam de Soft Gel e unhas | preservar histórico, marcar conteúdo com `niche_tags`, substituir seeds futuros por conteúdo parametrizado |
| Alta | `supabase/migrations/20260828001835_phase_2_core_experience.sql:5-20` | `user_stage`, `bottleneck`, `measurement_class` e sinais modelam aquisição, não operação de agenda | manter como `growth_context`; adicionar domínio de serviço, disponibilidade e reserva |
| Alta | `supabase/migrations/20260828035239_phase_3_evidence.sql:242,337` e `20260828042126_phase_3_policy_alias.sql:65` | textos de recomendação assumem “clientes” e funil de aquisição | mover copy para catálogo/localização; o motor recebe contexto e não frases de nicho |
| Média | `app/admin/actions/page.tsx:5`, `app/admin/actions.ts:21`, `app/admin/messages/page.tsx:4` e migration de operações | UI e mutations usam placeholder/default `nail_design` | catálogo admin deve selecionar tags de nicho e permitir conteúdo global |
| Média | `app/terms/page.tsx:1` | termos descrevem exclusivamente profissionais de nail design | tornar termos sobre prestadores de serviços; nichos aparecem como configuração da experiência |
| Média | `app/privacy/page.tsx:3` | coleta “profissão” e “clientes”, sem vocabulário de serviço/agendamento | atualizar inventário para provider, business, service, customer e appointment; não coletar dados de terceiros sem necessidade |
| Média | `docs/implementation-plan.md`, `docs/phase-7-beta-qa.md` | “alunas” e produto Agenda 80/20 são tratados como identidade única | produto permanece código/entitlement legado; experiência recebe `workspace`/tenant e linguagem neutra |
| Baixa | `app/belevy/benefit-card.tsx` e copy de check-in | “organize seus horários, clientes e dinheiro” sem modelar agenda | benefício pode continuar, mas deve apontar para capacidades reais ou ser rotulado como handoff externo |

## O que não foi encontrado

- Não existe coluna, enum ou validação explícita de gênero/sexo.
- Não existe entidade de cliente final, serviço, recurso, horário disponível, reserva ou conflito de agenda.
- Não existe fluxo de descoberta de serviço → escolha de horário → confirmação → cancelamento/remarcação.
- O campo `has_booking_path` representa apenas prontidão (“tenho caminho para marcar”), não uma reserva no sistema.

## Leitura arquitetural atual

O repositório usa Next.js 16 App Router, React 19, TypeScript e Supabase. As páginas autenticadas chamam RPCs controladas; RLS e entitlement são a fronteira de autorização. O `proxy.ts` serve para checagens otimistas/redirects, não para autorização completa, conforme a documentação local do Next.js 16. A implementação existente deve ser tratada como um bounded context legado de **Growth Coach**, e não como o modelo central de agendamento.

## Riscos se nada for feito

1. Adicionar telas de agenda sobre `business_profiles` faria o agendamento depender de um perfil de marketing e impossibilitaria múltiplos prestadores, locais ou serviços.
2. Defaults e seeds fariam qualquer novo nicho receber conteúdo de nail design por acidente.
3. Um campo “gênero” adicionado para resolver copy criaria coleta desnecessária e não representa nem prestador nem cliente.
4. Alterar enums/colunas em place quebraria recomendações, snapshots, RLS e exports existentes.

## Regra de decisão

O domínio canônico deve ser neutro: **workspace → provider → service/resource → availability → appointment → customer**. Beleza é o primeiro catálogo de nichos e não uma regra do núcleo. O motor de recomendações e o conteúdo de aquisição são consumidores opcionais desse núcleo.
