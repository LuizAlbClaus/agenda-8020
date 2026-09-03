# Agenda 80/20 — Contexto completo para handoff de produto e engenharia

> Documento de contexto exportável para outro agente de IA, projeto ou equipe.
> Atualizado em 2026-09-03, com base no código, migrations e documentação deste
> repositório. Valores e estados descritos como “atual” refletem o workspace no
> momento da auditoria; itens “planejados” ainda não devem ser tratados como
> funcionalidades prontas.

## 0. Instrução de leitura para o próximo agente

O Agenda 80/20 tem dois bounded contexts que coexistem:

1. **Growth Coach legado:** entende o momento comercial do prestador e escolhe uma única próxima ação elegível, curta e mensurável.
2. **Serviços e agendamento:** modela workspace, prestador, serviços, disponibilidade, clientes e appointments, com booking público básico.

O primeiro é o núcleo histórico do produto. O segundo é a direção horizontal do produto. Não substituir `business_profiles`, `action_protocols`, `action_versions` ou seus RPCs sem migração compatível: o banco foi evoluído de forma additive-first.

Ao alterar código, considerar como fontes de verdade, nesta ordem:

- comportamento atualmente implementado em `app/`, `components/`, `lib/` e `supabase/migrations/`;
- `docs/product-architecture-spec.md` para o domínio horizontal;
- especificações dos módulos de Copiloto/Retenção e Diagnóstico de Valor;
- auditorias e briefings como contexto estratégico, não como prova de comportamento já entregue.

Este repositório possui `AGENTS.md` com uma regra específica: esta versão do Next.js tem mudanças incompatíveis; antes de escrever código Next.js, consultar a documentação local em `node_modules/next/dist/docs/`.

## 1. Resumo executivo

### O que é

O **Agenda 80/20** é um produto de aquisição, relacionamento e agendamento para profissionais autônomos e pequenos negócios de serviços. Ele foi desenhado para quem trabalha atendendo pessoas e tem apenas 2–5 minutos entre atendimentos.

O produto ajuda a profissional a:

- entender o gargalo atual do negócio;
- receber uma única próxima ação possível, em vez de uma lista genérica;
- executar essa ação com passos curtos e mensagens prontas para WhatsApp ou outros canais;
- registrar execução, sinais e resultados;
- abrir um caminho público de escolha de serviço e horário;
- responder objeções de preço e outras objeções com texto ou roteiro de áudio;
- reativar clientes na janela de retorno biologicamente plausível;
- diagnosticar vazamentos de valor percebido e executar micro-missões de melhoria;
- usar uma agenda local básica ou, opcionalmente, encaminhar a operação oficial ao Belevy.

### O que não é

Não é, no estado atual:

- garantia de agenda cheia, renda, clientes ou taxa de conversão;
- marketplace;
- CRM completo;
- sistema financeiro, prontuário, estoque ou comissão;
- pagamento online dentro do próprio Agenda;
- calendário externo ou chat multicanal;
- substituto obrigatório do Belevy.

### Mecanismo central

> A pessoa informa como está seu serviço, seu tempo, seus canais e seus sinais. O Agenda 80/20 escolhe o próximo movimento que é possível e relevante para aquele momento, e dá um caminho mensurável para transformar interesse em horário.

O princípio 80/20 é comportamental: reduzir opções, reduzir esforço e entregar progresso concreto. A unidade de valor não é um dashboard cheio; é uma ação adequada que pode ser feita agora.

## 2. Público, posicionamento e linguagem

### ICP principal

Profissional autônoma ou pequeno negócio de serviços que está começando, tem poucos clientes, atende de forma irregular ou recebe interesse que não vira marcação. A compradora econômica costuma ser a própria prestadora ou proprietária.

### Nichos

O foco editorial inicial é beleza, mas o núcleo é horizontal:

- `beauty`: unhas, cabelo, sobrancelhas, cílios, estética e maquiagem;
- `health_wellness`: terapias, massagens, pilates e cuidado;
- `local_services`: serviços feitos em casa ou em um espaço local;
- `education`: aulas, reforço, idiomas e acompanhamento;
- `professional_services`: consultoria e atendimento especializado;
- `other`: serviço não coberto pelas categorias anteriores.

Tipos de serviço atualmente usados no onboarding: `nail_design`, `hair_stylist`, `brows_lashes`, `esthetician`, `makeup_artist`, `beauty_other`, `health_wellness`, `local_service`, `teacher`, `professional` e `other`.

O catálogo de nichos deve permanecer configurável e traduzível em banco. Não transformar cada nicho em regra hard-coded do motor.

### Vocabulário canônico

| Termo | Significado |
| --- | --- |
| Workspace | unidade de negócio/tenant que possui configuração e dados |
| Provider | pessoa que presta o serviço |
| Customer | pessoa que agenda/recebe o serviço |
| Service | oferta agendável, com duração, buffer e preço opcional |
| Availability rule | regra recorrente de disponibilidade |
| Availability exception | bloqueio ou janela extraordinária |
| Appointment | reserva de um serviço em um intervalo |
| Growth context | estágio, gargalo, canais, sinais e prontidão comercial |
| Recommendation | ação editorial elegível para o momento |

Não adicionar gênero/sexo como requisito. Nome, pronome e forma de tratamento são opcionais; copy padrão deve ser neutra. O sistema não deve inferir gênero por nome, nicho ou histórico.

### Dor que a comunicação deve abordar

- “Não sei qual é a próxima coisa que vale fazer.”
- “As pessoas perguntam, mas não marcam.”
- “Tenho horários disponíveis, mas não sei como movimentá-los.”
- “Não tenho tempo para aprender uma ferramenta grande.”
- “Ainda não tenho prova suficiente do meu serviço.”

### Promessa honesta

O produto promete clareza, uma próxima ação possível, scripts de apoio, acompanhamento de sinais e um caminho simples de agendamento. Não promete resultado financeiro específico.

Copy de referência:

- Headline estratégica: **“Pare de tentar fazer tudo para movimentar seu serviço.”**
- CTA: **“Montar meu primeiro plano.”**
- Ideia de ativação: “Seu próximo movimento está pronto. Faça só essa ação primeiro.”

Existem alterações de copy comerciais no working tree do usuário. Trate a copy da landing como código atual, mas valide claims antes de publicação em escala.

## 3. Modelo mental e princípios de UX

O produto segue o modelo BJ Fogg (`B = MAP`): comportamento acontece quando motivação, habilidade e gatilho se encontram.

- **Motivação:** progresso financeiro e comercial claro, sem prometer resultado.
- **Habilidade:** ação pequena, passos limitados e mensagem pronta para copiar.
- **Gatilho:** alertas calmos de vaga, check-ins, retenção e botão SOS.
- **Contexto:** mobile-first, uma mão, entre atendimentos, em sessões de 2–5 minutos.
- **Feedback:** estados de copiado, concluído, pendente e erro; vibração háptica onde aplicável.

Regras visuais e ergonômicas:

- alvo interativo preferencial de pelo menos `48px` de altura;
- ação principal no terço inferior da viewport mobile;
- títulos com `text-balance` e parágrafos longos com `text-pretty`;
- cards com raio de 14px, sem borda lateral decorativa de 4px;
- sem gradiente de texto e sem “ghost cards” com sombras exageradas;
- fundo neutro frio, não bege de template;
- respeitar `prefers-reduced-motion`.

Tokens principais em `app/globals.css`:

| Uso | Token |
| --- | --- |
| Fundo | `--color-canvas` |
| Superfície | `--color-surface-card`, `--color-surface-muted` |
| Ação | `--color-action-primary`, `--color-action-subtle` |
| Receita/sucesso | `--color-revenue-primary`, `--color-revenue-subtle` |
| Oportunidade | `--color-opportunity-primary`, `--color-opportunity-subtle` |
| Perigo | `--color-danger-primary`, `--color-danger-subtle` |
| Texto | `--color-ink-solid`, `--color-ink-muted` |
| Bordas | `--color-border-subtle`, `--color-border-strong` |

## 4. Jornada completa da usuária

### 4.1. Aquisição e acesso

1. A pessoa chega à landing page.
2. Vê o mecanismo, os momentos de uso, o Copiloto, Retenção, Diagnóstico e o benefício opcional do Belevy.
3. Escolhe plano na Cakto, quando configurado, ou usa a demo/fluxo de login.
4. O pagamento é único; webhook Cakto processa aprovação, reembolso ou chargeback.
5. O sistema cria/atualiza compra, grant e entitlement `agenda_8020`.
6. A pessoa recebe acesso por magic link/e-mail.
7. Rotas protegidas verificam sessão e entitlement no servidor.

### 4.2. Onboarding

O onboarding coleta:

- nome ou nome comercial;
- tipo de serviço e nicho;
- nome do serviço que será colocado em movimento;
- formato: presencial, online, híbrido ou visita ao cliente;
- prova disponível: portfólio, depoimentos, resultados ou ainda nenhuma;
- estágio: `starting`, `some_clients`, `irregular_schedule`;
- gargalo: `first_clients`, `low_visibility`, `low_conversion`, `empty_slots`, `low_return`;
- canais: Instagram, WhatsApp, clientes existentes, rede local, parcerias ou nenhum;
- sinais de oportunidade: pergunta de preço/horário, conversa pausada, objeção, experiência positiva, cliente anterior, permissão de indicação, demanda local, contato próximo, parceria ou nenhum;
- tempo diário: 10, 20, 30 ou 45 minutos;
- se pode atender nos próximos 7 dias;
- se tem prova real do serviço;
- se tem um caminho de agendamento.

Ao salvar, `save_onboarding_v2` persiste o perfil e contexto, e `generate_next_recommendation` cria ou devolve a primeira recomendação. O sucesso leva à ação ou a `/today`.

### 4.3. Tela Hoje

`/today` é a home autenticada e o principal centro de decisão. Ela:

- valida sessão e acesso;
- mostra alertas de resultado pendente e check-in;
- mostra o foco atual;
- mostra uma única próxima ação, sua duração e “por que agora”;
- permite fazer a ação, trocar ou ajustar contexto;
- apresenta o estado do benefício Belevy;
- renderiza o hub interativo com retenções, Diagnóstico de Valor, Pílula de Café e SOS Copiloto;
- aponta para histórico/progresso e configurações.

Se não houver onboarding, redireciona para `/onboarding`. Se não houver uma ação elegível, exibe mensagem de ajuste de plano.

### 4.4. Detalhe e execução de ação

`/action/[recommendationId]` mostra título, duração, descrição, por que agora, até três passos, template de mensagem, modo Texto/Áudio, lembrete ético e eventual avaliação de resultado.

Estados principais:

- iniciar ação;
- executar e marcar conclusão;
- informar exposição (`1`, `2` ou `3+`) quando solicitado;
- marcar “não consegui fazer hoje”;
- trocar ação por motivo (`no_time`, `no_opportunity`, `recently_done`, `not_for_my_moment`, `did_not_understand`, `do_not_want`);
- registrar resultado depois da maturação: `pending`, `none`, `interest`, `booking`.

O motor limita passos a 1–3 e usa cooldown, elegibilidade, sinais, evidência e disponibilidade de tempo para evitar recomendações incompatíveis.

### 4.5. Check-in e progresso

`/checkin` atualiza o estágio, gargalo, canais, sinais, tempo, capacidade de atender, prova e caminho de booking. O check-in cria histórico e recalibra recomendações.

`/progress` mostra ações concluídas, sinais/resultados, agendamentos reportados, histórico de recomendações e estado da base/fundação do negócio. O “booking path” legado é um sinal de prontidão; não representa necessariamente uma reserva.

### 4.6. Booking público

`/book/[slug]` é público e não exige login do customer:

1. verifica se há redirect vigente para o Belevy;
2. se não houver, carrega contexto público do workspace;
3. lista serviços ativos, dias e slots;
4. customer escolhe serviço, data e horário;
5. informa nome obrigatório e contato opcional;
6. `create_public_booking` valida o slot e cria `customers`, `appointments` e `appointment_events` de forma transacional;
7. em conflito concorrente, a constraint de exclusão retorna slot indisponível;
8. a tela mostra confirmação local e instrução para falar com o espaço sobre cancelamento/remarcação.

O contexto público não revela dados de outros customers. O intervalo usa timezone do workspace; slots são gerados em incrementos de 30 minutos e consideram duração + buffer.

### 4.7. Retenção biológica

Cada serviço pode ter `recurrence_cycle_days`. A view `v_due_retentions` usa o último appointment concluído por customer e classifica:

- `early`: antes da janela de retorno;
- `optimal_timing`: ciclo menos 4 dias até ciclo mais 7 dias;
- `overdue`: depois da janela;

Customers com appointment futuro `held` ou `confirmed` não entram na lista. `/today` mostra até três oportunidades ordenadas primeiro pela janela ideal. O card oferece mensagem pronta e link WhatsApp quando há contato.

Defaults editoriais previstos: unhas 21 dias, cílios/sobrancelhas 20, cabelo 30, saúde/bem-estar 15; o valor efetivo está no serviço.

### 4.8. SOS Copiloto de Vendas

O drawer mobile apresenta respostas táticas para objeções:

- `price_too_high`: “achei caro”;
- `procrastination`: “vou ver e te aviso”;
- `third_party_decision`: “vou falar com marido/sócio”;
- `just_browsing`: “só queria saber o preço”;
- `schedule_friction`: “não tenho horário agora”.

Cada template tem rationale psicológico, subtexto do cliente, script textual, script de áudio, duração, guia de tom e abordagem (`direct`, `consultative`, `downsell`).

O código atual do drawer exibe quatro categorias diretamente; `schedule_friction` existe no tipo/schema e no banco, mas deve ser verificado antes de assumir que está visível em todas as interfaces.

O uso é rastreado em `objection_interactions` via `track_objection_interaction`. O Copiloto não deve enviar mensagens automaticamente ao customer: ele dá apoio para a profissional copiar/falar.

### 4.9. Trava de prontidão

`check_readiness_lock` bloqueia ações de oferta de horário quando faltam fundamentos. A trava verifica, conforme a ação:

- onboarding;
- capacidade de atender nos próximos 7 dias;
- prova real do serviço;
- workspace ativo;
- provider ativo;
- regra semanal ativa para ações que oferecem dois slots ou slot real.

O bloqueio deve ser pedagógico, com link de correção para `/onboarding` ou `/agenda`, e nunca um erro técnico opaco.

### 4.10. Diagnóstico de Percepção de Valor

Fluxo de 45 segundos com três perguntas, diagnóstico de IVP de 0–100, arquétipo, vazamento principal, explicação empática e plano de 48 horas.

Arquétipos:

- `price_prisoner` — 0–35: Prisioneira do Preço;
- `hidden_artisan` — 36–65: Artesã Oculta;
- `polishing_specialist` — 66–85: Especialista em Lapidação;
- `premium_brand` — 86–100: Marca Premium.

Vazamentos:

- `showcase_commodity`;
- `climax_rushed`;
- `intangible_vacuum`;
- `pricing_fear`;
- `balanced`.

O resultado cria um playbook e missões de 10 minutos. A usuária pode concluir cada missão; o progresso é por workspace e diagnóstico. Uma pílula diária de microaprendizagem pode ser consumida em áudio de 30–75s ou cards visuais, com cópia de script prático.

O módulo é educação e apoio à percepção de valor; não deve incentivar mentira, escassez falsa, pressão ou promessa de garantia financeira.

## 5. Mapa de rotas e superfícies

| Rota | Acesso | Responsabilidade |
| --- | --- | --- |
| `/` | pública | landing, posicionamento, oferta, FAQ e CTA |
| `/demo` | pública | demonstração local com dados mockados dos módulos |
| `/login` | pública | entrada por magic link |
| `/auth/confirm` | callback | troca de código por sessão e redirect seguro |
| `/auth/error` | pública | erro de autenticação |
| `/onboarding` | autenticada + entitlement | cadastro/edição de contexto |
| `/today` | autenticada + entitlement | foco diário e hub de crescimento |
| `/action/[recommendationId]` | autenticada + entitlement | detalhe e execução de recomendação |
| `/checkin` | autenticada + entitlement | atualização de contexto |
| `/progress` | autenticada + entitlement | histórico e métricas pessoais |
| `/agenda` | autenticada + entitlement | snapshot local, serviços, appointments e link público |
| `/book/[slug]` | pública | seleção e confirmação de booking local |
| `/diagnostic` | autenticada + entitlement | diagnóstico e playbook de valor |
| `/settings` | autenticada + entitlement | preferências e links de privacidade/benefício |
| `/settings/benefits` | autenticada + entitlement | benefício e conexão Belevy |
| `/belevy` | autenticada + entitlement | estado/ativação/handoff do Belevy |
| `/checkout/sucesso` | pública | confirmação orientativa após checkout |
| `/privacy` | pública | política de privacidade |
| `/terms` | pública | termos e limites do produto |
| `/admin` | autenticada + role | operação editorial, acesso e integridade |
| `/admin/actions` | admin/editor | protocolos e versões de ação |
| `/admin/messages` | admin/editor | templates e versões de mensagem |
| `/admin/policies` | admin/editor | parâmetros do motor |
| `/admin/metrics` | admin | métricas agregadas |
| `/admin/users` | admin/support | busca e suporte de usuários |
| `/admin/commerce` | admin | mappings Cakto/entitlement/benefício |
| `/admin/feature-flags` | admin | flags operacionais |
| `/admin/audit` | admin | trilha de auditoria |
| `/api/integrations/belevy/events` | server-to-server | recebe eventos mínimos do Belevy |

## 6. Arquitetura técnica

### Stack

- Next.js `16.3.3`, App Router;
- React `19.2.8`;
- TypeScript strict;
- Tailwind CSS v4 com tokens OKLCH;
- Supabase SSR (`@supabase/ssr`) e Supabase JS;
- PostgreSQL 15+;
- Zod `4.4.3`;
- Playwright para E2E mobile;
- Supabase Edge Functions em Deno.

### Limites de camada

- Server Components fazem leituras e protegem páginas.
- Server Actions e Route Handlers fazem mutações e integrações.
- O browser nunca recebe service role, secrets ou decisão final de entitlement.
- `proxy.ts` atualiza/valida contexto de sessão de forma otimista; não é a autoridade completa.
- RPCs PostgreSQL são a fronteira forte para ownership, transições e cálculos críticos.
- Funções privilegiadas usam `SECURITY DEFINER` e `set search_path = pg_catalog, public`.
- O cliente público de booking chama RPC; não grava `appointments` diretamente.

### Cliente Supabase

`lib/supabase/server.ts` cria cliente SSR com cookies e `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `lib/supabase/client.ts` é o cliente browser. `lib/supabase/admin.ts` é reservado para operações privilegiadas server-side.

Autorização server-side usa `auth.getClaims()`, não `getSession()` como decisão de acesso. `lib/supabase/access.ts` chama `can_access_agenda` e retorna falso em erro.

### Segurança e multitenancy

- RLS habilitado nas tabelas públicas.
- Acesso de workspace usa `private.workspace_access(workspace_id, user_id)`, baseado em `workspace_members`.
- RLS deve impedir leitura/escrita entre workspaces inclusive por RPC e exportação.
- Catálogos editoriais ativos são somente leitura para usuários autenticados.
- Conteúdo publicado é imutável; alterações criam nova versão.
- Admin usa RPCs com verificação de role e registra `admin_audit_logs`.
- Webhooks usam segredo compartilhado, payload mínimo, idempotência e logs sem PII sensível.
- Rate limit usa hash SHA-256 do sujeito; não salvar IP bruto no banco.
- Analytics client-side não deve levar PII, credenciais ou dados financeiros.

## 7. Modelo de dados

### Identidade e acesso

- `profiles`: nome, locale, timezone; criado por trigger após `auth.users`.
- `user_roles`: `user`, `content_editor`, `support`, `admin`.
- `entitlements`: um registro por usuário/produto, status `active`, `revoked` ou `expired`, datas de vigência.

Produto de acesso canônico: `agenda_8020`.

### Commerce

- `commerce_products`: mapping de provider/produto/oferta para código interno, dias de acesso e benefício.
- `purchases`: compra Cakto, order, comprador, valor e status `paid`, `refunded`, `chargedback`, `ignored`.
- `payment_webhook_events`: idempotência, hash, tipo e status do evento.
- `entitlement_grants`: grant originado de compra.
- `email_outbox`: fila de e-mails com idempotência, tentativas e estado.

Regras comerciais atuais:

- plano anual: pagamento único de R$147, 365 dias de Agenda;
- plano semestral/downsell: pagamento único de R$97, 180 dias de Agenda;
- benefício promocional Belevy: 30 dias, diferido, ativado pela usuária e não cumulativo;
- extensões pagas de Belevy devem ser mappings separados e não podem ser confundidas com o trial gratuito;
- order bump de copy atual: +30 dias por R$19,90, totalizando 60 dias, sujeito à configuração real da Cakto.

### Growth Coach

- `business_profiles`: perfil/contexto atual do usuário, ainda contém campos legados como `profession`, `has_real_portfolio` e `has_booking_path`.
- `context_checkins`: snapshots de contexto, com gatilho `onboarding`, `fortnight`, `manual` ou `engine`.
- `action_protocols`: identidade do protocolo, tipo `foundation`/`acquisition`, categoria e classe de medição.
- `action_versions`: conteúdo versionado, elegibilidade, requisitos, duração, maturação, cooldown, prior editorial, guardrail e template.
- `recommendation_policy_versions`: pesos/parâmetros versionados do motor.
- `recommendations`: snapshot da ação apresentada, score, componentes, contexto, policy e timestamps.
- `action_swaps`: motivo de troca e eventual recomendação substituta.
- `user_action_preferences`: bloqueios, pesos e histórico de trocas.
- `action_executions`: execução única por recommendation, incluindo exposição.
- `action_outcomes`: resultado posterior com maturação/finalização.
- `opportunity_signal_catalog` e `action_signal_requirements`: sinais disponíveis e requisitos de ações.

### Scheduling horizontal

- `service_niche_catalog`: catálogo amplo de nichos.
- `workspaces`: tenant, dono, nome, slug, locale e timezone.
- `workspace_members`: relação usuário/workspace com `owner`, `manager` ou `provider`.
- `providers`: profissionais ativos do workspace.
- `services`: nome, nicho, descrição, duração, buffer, preço em minor units, moeda e ativo.
- `service_providers`: relação serviço–provider.
- `customers`: nome, contato opcional e consentimento `provided`, `withdrawn`, `unknown`.
- `availability_rules`: dia da semana, janela local e vigência.
- `availability_exceptions`: bloqueio ou janela extra em intervalo timezone-aware.
- `appointments`: serviço, customer, provider, intervalo, status e fonte.
- `appointment_events`: `created`, `held`, `confirmed`, `cancelled`, `completed`, `no_show`, `rescheduled`.

Status de appointment: `held`, `confirmed`, `cancelled`, `completed`, `no_show`.

Invariantes:

- `ends_at > starts_at`;
- entidades relacionadas pertencem ao mesmo workspace;
- duração efetiva inclui serviço + buffer;
- appointment ativo não pode sobrepor outro do mesmo provider;
- appointment confirmado exige disponibilidade válida;
- booking público nunca revela customer de outro workspace.

Proteção contra dupla reserva: índice/constraint PostgreSQL `EXCLUDE USING gist` sobre `provider_id` + `tstzrange(starts_at, ends_at, '[)')` para status `held`/`confirmed`.

### Copilot e Retenção

- `copilot_templates`: templates centralizados de objeção em texto/áudio.
- `objection_interactions`: uso por workspace/user, modo, resolução e customer opcional.
- `services.recurrence_cycle_days`: ciclo de retorno do serviço.
- `v_due_retentions`: view do último atendimento concluído e janela de retorno.

### Diagnóstico de Valor

- `diagnostic_questions`: questões e opções JSONB.
- `value_diagnostics`: resultado ativo por workspace, IVP, arquétipo, vazamento e gap de percepção.
- `diagnostic_results`: resposta individual e pontos.
- `value_playbooks`: planos de 48h.
- `value_actions`: missões editoriais de 10 minutos.
- `workspace_value_action_progress`: status das missões por diagnóstico/workspace.
- `micro_learning_pills`: áudio/cards de aprendizagem.
- `workspace_learning_progress`: consumo diário da pílula.

### Operação, privacidade e e-mail

- `message_templates`/`message_versions`: conteúdo operacional versionado.
- `analytics_events`: eventos server-side com allowlist.
- `feature_flags`: flags e config JSONB.
- `admin_audit_logs`: antes/depois de mutações administrativas.
- `notification_preferences`: e-mails diários, semanais, outcome e marketing.
- `email_delivery_events`: delivered/bounced/complained.
- `weekly_summaries`: resumo semanal.
- `privacy_requests`: export/delete e status.
- `privacy_retention_config`: retenção de analytics, e-mail e check-ins.
- `analytics_event_allowlist`: chaves permitidas por evento.
- `rate_limit_buckets`: contadores hashados por escopo.

## 8. Motor de recomendação

`generate_next_recommendation()` é a função canônica do Growth Coach.

Comportamento:

1. exige autenticação e entitlement;
2. usa lock transacional por usuário;
3. devolve recomendação aberta existente, se houver;
4. aplica limite diário conforme tempo disponível;
5. cria contexto se necessário;
6. calcula se há gap de prontidão (`can_serve_next_7_days`, prova, booking path);
7. filtra conteúdo publicado por profissão/nicho legado, estágio, gargalo, canais, duração, requisitos, sinais, cooldown e swaps;
8. separa ações de fundação de ações de aquisição;
9. ranqueia por fit, canal, prior editorial, evidência, viabilidade e ajustes pessoais;
10. aplica exploração controlada com seed determinística e policy versionada;
11. persiste snapshot da recomendação e score components;
12. devolve uma única ação ou um estado explicativo.

Estados importantes retornados: `onboarding_required`, `existing`, `created`, `daily_limit_reached`, `no_eligible_action`.

Regras de confiança:

- `learning`: ainda conhecendo o contexto;
- `signal`: algumas tentativas tiveram sinais positivos;
- `strong_signal`: esse tipo de ação mostrou resultado melhor nas tentativas anteriores.

Ações para pessoas sem clientes e sem `opportunity_signals` estão previstas na migration `20260903000000_zero_clients_cold_outreach_protocols.sql`:

- `COLD_01_CLOSE_CIRCLES`: convidar pessoas próximas para modelo;
- `COLD_02_LOCAL_SHOWCASE`: propor parceria local;
- `COLD_03_PORTFOLIO_LAUNCH`: avisar a rede sobre abertura de agenda.

Estas ações exigem transparência, não permitem escassez falsa e não devem ser usadas para recomendar spam.

## 9. RPCs e contratos relevantes

### Acesso e contexto

`can_access_agenda`, `save_onboarding`, `save_onboarding_v2`, `get_today_plan`, `get_recommendation_detail`, `start_recommendation`, `generate_next_recommendation`, `swap_recommendation`, `complete_recommendation`, `mark_recommendation_not_completed`, `record_outcome`, `get_progress`, `get_checkin`, `save_checkin`, `save_checkin_v2`, `save_opportunity_signals`.

### Agenda e booking

`get_agenda_snapshot`, `get_public_booking_context`, `create_public_booking`.

`get_public_booking_context` é público para leitura; `create_public_booking` é público para criação controlada. Ambos devem permanecer protegidos contra abuso, dados fora do escopo, datas fora da janela e slots bloqueados.

### Copilot e retenção

`get_copilot_templates`, `get_due_retentions`, `check_readiness_lock`, `track_objection_interaction`.

### Diagnóstico de valor

`calculate_value_diagnostic`, `get_active_value_diagnostic`, `complete_value_action`, `get_daily_micro_learning_pill`, `mark_micro_learning_consumed`.

### Commerce e acesso operacional

`lookup_cakto_user_id`, `process_cakto_webhook_event`, `claim_email_outbox`, `mark_email_outbox_sent`, `mark_email_outbox_failed`, `expire_entitlements`, `enqueue_email` e funções de admin de entitlement.

### Admin

RPCs de lista/mutação para ações, mensagens, policies, users, commerce, feature flags, métricas e audit logs. Mutação administrativa exige role e grava auditoria.

### Privacidade

`request_privacy_export`, `request_privacy_deletion`, `get_privacy_export`, `process_privacy_deletion`, aliases `request_data_export` e `request_account_deletion`, além de `enforce_privacy_retention`.

## 10. Integração com Belevy

O Belevy é uma camada operacional opcional. A separação de responsabilidades é obrigatória:

- Agenda 80/20: contexto, recomendação, diagnóstico, relacionamento e método;
- Belevy: agenda oficial, clientes, disponibilidade detalhada, confirmações, lembretes, financeiro, calendário externo e CRM.

Estados da integração: `not_configured`, `not_connected`, `connected`, `expired`, `unavailable`.

Quando conectado:

- Belevy é a fonte canônica de appointments;
- `/book/[slug]` redireciona para a URL pública do Belevy;
- Agenda consulta apenas slug, próximos horários e contagens agregadas;
- eventos mínimos podem ser recebidos pelo endpoint do Agenda;
- nenhum nome, telefone, customer, conversa ou dado financeiro do Belevy é copiado;
- Agenda não cria, edita, cancela ou conclui appointment no Belevy.

Quando ausente, expirado ou indisponível:

- o Agenda continua ativo;
- Growth Coach, ações, check-ins, progresso e booking local continuam independentes;
- falha externa não apaga histórico nem bloqueia acesso.

### Ativação do benefício

O fluxo usa `benefit_entitlements` e a Edge Function `activate-belevy-benefit`:

1. usuário autenticado pede ativação;
2. flag `belevy_activation_enabled` é consultada;
3. rate limit por usuário é aplicado;
4. banco inicia estado local `available`/`activating`;
5. função chama endpoint HTTPS externo com segredo server-only;
6. qualquer 2xx aceito conclui a ativação;
7. timeout de 10s, HTTP não-2xx ou JSON inválido falha a ativação;
8. retry é permitido dentro da elegibilidade;
9. segunda tentativa do mesmo benefit deve ser idempotente.

Segredos: `BELEVY_ACTIVATION_ENDPOINT`, `BELEVY_SHARED_SECRET`, `BELEVY_EVENTS_SHARED_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` — nunca usar `NEXT_PUBLIC_`, nunca logar segredo ou payload completo.

## 11. E-mail, analytics e privacidade

### E-mail

Edge Functions existentes:

- `cakto-webhook`: recebe eventos Cakto e provisiona compra/acesso;
- `send-email-worker`: envia e-mails da outbox via Resend;
- `resend-webhook`: registra entrega, bounce e complaint;
- `generate-weekly-summaries`: gera resumos;
- `process-checkins`: processa lembretes/check-ins;
- `process-outcome-reminders`: processa lembretes de resultado.

E-mails comportamentais e marketing devem respeitar preferências. O worker usa supressão para endereços problemáticos e não deve enviar conteúdo comercial quando não autorizado.

### Analytics

Eventos de funil atualmente tratados no cliente incluem `landing_page_view`, `hero_cta_clicked`, `pricing_viewed`, `checkout_redirect_clicked`, `downsell_modal_opened` e `downsell_checkout_clicked`. A camada usa `dataLayer`/GTM e `CustomEvent("agenda8020:analytics")` quando disponível.

Eventos de produto devem ser allowlisted, idempotentes e sem CPF, cartão, senha, telefone ou payloads de customer quando não necessários.

### Privacidade/LGPD

O Agenda trata dados de conta, contexto comercial, dados mínimos de customer e appointments. No booking público, nome é obrigatório e contato é opcional para operar a reserva.

Direitos disponíveis no Settings: solicitar exportação e solicitar exclusão. A exclusão operacional anonimiza dados pessoais e mantém registros financeiros quando necessário para obrigação legal/auditoria. Antes do beta, definir e testar retenção de customers, appointments, appointment events, analytics, check-ins e e-mails.

## 12. Monetização e oferta atual

Configuração em `lib/checkout.ts` e componentes de pricing:

| Oferta | Preço exibido | Acesso Agenda | Belevy |
| --- | ---: | ---: | --- |
| Anual Completo | R$147 à vista ou copy de 12x R$15,19 | 365 dias | 30 dias promocionais |
| Semestral/downsell | R$97 pagamento único | 180 dias | 30 dias promocionais |

A Cakto é externa ao app. URLs públicas são obtidas de `NEXT_PUBLIC_CAKTO_CHECKOUT_URL_ANNUAL` e `NEXT_PUBLIC_CAKTO_CHECKOUT_URL_SEMIANNUAL`; somente parâmetros de tracking allowlisted são propagados.

Claims que precisam de validação operacional antes de tráfego: quantidade/forma de parcelas, funcionamento do order bump, garantia de reembolso, duração final de benefícios e existência real do endpoint Belevy.

## 13. Estado de implementação observado

### Funcionalidades existentes no código

- landing page e pricing;
- demo local com mocks;
- login por magic link e callback;
- controle de entitlement;
- onboarding horizontal com contexto comercial;
- Growth Coach e próxima recomendação;
- detalhe, execução, troca e resultado de recomendação;
- check-in e progresso;
- admin editorial/operacional;
- privacy export/deletion requests;
- workspaces de um prestador, provider e service inicial;
- regras de disponibilidade padrão e snapshot da agenda;
- booking público básico com proteção transacional contra overlap;
- Copiloto de Vendas em texto/áudio;
- retenção biológica;
- Diagnóstico de Valor, plano 48h, missões e Pílula de Café;
- benefício/integração Belevy e eventos mínimos server-to-server;
- Edge Functions de commerce e e-mail.

### Funcionalidades ainda incompletas ou deliberadamente fora do MVP

- UI autenticada completa para criar/editar múltiplos serviços, duração, buffer, preço e regras;
- gestão manual completa de appointments e transições pelo provider;
- cancelamento e remarcação públicos com política configurável;
- múltiplos providers/resources com seleção pública;
- notificações de confirmação e lembrete no booking local;
- rate limit específico do booking público;
- validação ampla de `availability_exceptions` no contexto e na criação;
- retenção/exclusão completa de customers, appointments e appointment events;
- sincronização operacional bidirecional com Belevy — não faz parte do contrato;
- marketplace, chat, recorrência, pagamentos internos, estoque, comissão e calendário externo.

### Divergências que o próximo agente deve conhecer

1. Documentos iniciais da Fase 0 dizem “Fase 0 em andamento”, mas o repositório já possui migrations das fases 1–11 e módulos posteriores. Use o código/migrations atuais para o estado real.
2. O domínio legado ainda chama o tipo de serviço de `profession` e aceita default `nail_design`; o domínio horizontal usa `service_niche`, `service_name` e catálogo neutro.
3. `/demo` usa dados mockados e pode ter textos/questões diferentes dos seeds de produção. Não usar demo como contrato do banco.
4. O drawer atual expõe quatro objeções, embora o enum/schema aceite cinco incluindo `schedule_friction`.
5. A página pública exibe preço quando o dado chega, mas a implementação atual de `get_public_booking_context` deve ser revisada para confirmar que `price_minor` e `currency` são retornados no RPC.
6. A agenda local cria defaults no trigger de workspace: atendimento 09:00–18:00, segunda a sábado. Isso é seed operacional, não uma UI final de disponibilidade.
7. O booking público é funcional, mas o audit técnico classificou rate limit, exceções, retenção e concorrência pública como itens a validar antes de tráfego amplo.
8. Alguns textos comerciais falam em “agenda oficial” e automações que pertencem ao Belevy. Não apresentar isso como capacidade nativa do Agenda.

## 14. Backlog recomendado por prioridade

### Antes de tráfego em escala

- testar duas reservas simultâneas para o mesmo provider/slot;
- testar data fora da janela, slot bloqueado, janela extra, contato inválido e retry;
- adicionar rate limit/perímetro para `create_public_booking`;
- garantir que confirmação pública e erro de conflito sejam claros;
- revisar Privacy/Terms e retenção de dados de booking;
- configurar e testar Resend webhook;
- promover conta de suporte/admin de forma segura;
- confirmar mappings Cakto em ambiente não produtivo e nunca testar commerce contra produção.

### Próxima entrega de produto

- CRUD de serviços e horários;
- exceções de disponibilidade;
- gestão de appointment pelo provider;
- cancelamento/remarcação e políticas;
- múltiplos providers/resources;
- notificações de confirmação/lembrete;
- integrar as ações de Growth Coach com dados reais do booking sem criar reservas automaticamente.

### Depois de validar o beta

- expandir nichos e conteúdo localizado;
- dual-read/dual-write e migração mensurável do legado;
- dashboards de eficácia do Copilot/Retenção/Diagnóstico;
- ativar Belevy somente após homologar endpoint, idempotência, timeout, retry e secrets;
- revisar claims, métricas e preço com dados reais.

## 15. Testes e operação

Comandos principais:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Supabase local:

```bash
supabase start
supabase db reset
supabase migration list --local
supabase db lint --local
```

E2E: Playwright roda em Mobile Chrome, usa `http://localhost:3000`, inicia `npm run start` e cobre a jornada mock de Copilot, retenção, Diagnóstico de Valor e Pílula de Café em `/demo`.

Scripts auxiliares em `scripts/` auditam engine/zero clientes, integração Belevy e CRO/frontend. Eles fazem validações estáticas e, em alguns casos, simulam runtime; não substituem testes de banco real, concorrência e staging.

### Ambientes

Manter projetos Supabase separados para development, staging e production. Variáveis públicas e server-only devem ser configuradas por ambiente. Não versionar segredos e não apontar testes de commerce para produção.

Variáveis relevantes, sem valores secretos:

- `NEXT_PUBLIC_APP_URL`;
- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `NEXT_PUBLIC_CAKTO_CHECKOUT_URL_ANNUAL`;
- `NEXT_PUBLIC_CAKTO_CHECKOUT_URL_SEMIANNUAL`;
- `BELEVY_PUBLIC_URL`;
- `BELEVY_AGENDA_SUMMARY_ENDPOINT`;
- `BELEVY_SHARED_SECRET`;
- `BELEVY_EVENTS_SHARED_SECRET`;
- `SUPABASE_SERVICE_ROLE_KEY` apenas server-side/endpoint autorizado.

Edge Functions usam também secrets próprios, incluindo Cakto, Resend, worker e ativação Belevy. Nunca copiar `.env.local` para outro agente; exportar apenas nomes, contratos e instruções.

## 16. Migrations canônicas

As migrations são a história evolutiva do banco. As mais importantes são:

- `20260827202600_phase_0_schema.sql` e `20260827202805_phase_0_security_hardening.sql`: identidade, roles, entitlement e segurança inicial;
- `20260827220141_phase_1_commerce.sql`, `20260827220351_phase_1_security_lints.sql`, `20260827222715_phase_1_email_worker.sql`: Cakto, compras, grants, outbox;
- `20260828001835_phase_2_core_experience.sql` e ajustes seguintes: onboarding, ações, policy, recommendation;
- `20260828035239_phase_3_evidence.sql` e ajustes: execução, outcome, maturação e progresso;
- `20260828044811_phase_4_operations_db.sql` e hardening: admin, conteúdo versionado, flags, métricas e auditoria;
- `20260828110909_phase_5_email_retention.sql` e `20260828112648_phase_5_pg_net_schema_hardening.sql`: preferências, e-mail e resumos;
- `20260828130000_phase_6_belevy_benefits.sql` e `20260828133000_phase_6_belevy_rls_deny.sql`: benefício Belevy;
- `20260828150000_phase_7_critical_remediations.sql` e `20260828150100_phase_7_opportunity_none_signal.sql`: guardrails, privacidade, rate limit e sinais;
- `20260828180952_phase_8_agenda_commercial_benefit_rules.sql`, `20260828184000_phase_8_agenda_downsell_mapping.sql`, `20260829090100_phase_8_belevy_paid_extension_bump.sql`, `20260829090200_phase_8_belevy_bundle_activation.sql`: regras comerciais e benefícios;
- `20260828200000_phase_9_multi_niche_service_domain.sql`: nichos, serviço e contexto horizontal;
- `20260828210000_phase_10_scheduling_core.sql`, `20260829100000_phase_11_booking_input_guardrails.sql`: workspace, disponibilidade, appointment e booking público;
- `20260829111000_belevy_activation_retry.sql`, `20260829170000_belevy_connection_and_booking_redirect.sql`, `20260829171000_belevy_appointment_events.sql`, `20260829173000_belevy_events_deny_clients.sql`: conexão e eventos mínimos Belevy;
- `20260901000000_copilot_and_biological_retention.sql`: Copilot, retenção e readiness;
- `20260902000000_value_perception_diagnostic_engine.sql`: Diagnóstico de Valor e microaprendizagem;
- `20260903000000_zero_clients_cold_outreach_protocols.sql`: protocolos para zero clientes e sinais vazios.

Não reordenar migrations aplicadas. Alterações de schema devem ser novas migrations, com RLS, grants, RPC e testes.

## 17. Prompt curto para iniciar outro agente

```text
Você está trabalhando no Agenda 80/20, um produto mobile-first de apoio à decisão, aquisição, relacionamento e agendamento para prestadores autônomos. O sistema tem dois bounded contexts: (1) Growth Coach legado, que coleta contexto e gera uma única próxima ação elegível com evidência/check-in; (2) domínio horizontal de scheduling, com workspace, provider, services, availability, customers e appointments, incluindo booking público básico.

Stack: Next.js 16.3.3 App Router, React 19, TypeScript strict, Tailwind v4/OKLCH, Supabase/Postgres/RLS, Server Components para leitura e Server Actions/RPCs para mutação. A autorização real é server-side por sessão + entitlement `agenda_8020`; nunca confiar no client/JWT sozinho. Antes de escrever Next.js, leia `AGENTS.md` e a documentação local de `node_modules/next/dist/docs/`.

O produto não promete agenda cheia, renda ou conversão. Não coletar/inferir gênero. Preservar compatibilidade com tabelas/RPCs legados. Belevy é opcional: quando conectado, é a fonte canônica da operação e o Agenda apenas consulta resumo/encaminha booking; quando ausente, o Agenda continua funcionando.

Leia primeiro `docs/agenda8020-context-export.md`, depois `docs/product-architecture-spec.md`, as migrations relevantes e os arquivos diretamente envolvidos na tarefa. Classifique toda mudança como: comportamento confirmado atual, gap/bug, ou feature planejada. Não expor secrets de `.env.local`.
```

## 18. Arquivos de entrada mais importantes

- Produto/arquitetura: `README.md`, `DESIGN.md`, `docs/product-architecture-spec.md`, `docs/product-communication-brief.md`.
- Contexto e motor: `app/onboarding/`, `app/today/`, `app/action/`, `app/checkin/`, `app/progress/`, `supabase/migrations/20260828001835_phase_2_core_experience.sql` e `20260903000000_zero_clients_cold_outreach_protocols.sql`.
- Booking: `app/agenda/page.tsx`, `app/book/[slug]/`, `supabase/migrations/20260828210000_phase_10_scheduling_core.sql` e `20260829100000_phase_11_booking_input_guardrails.sql`.
- Copilot/Retenção: `components/copilot/`, `app/action/copilot-actions.ts`, `lib/copilot-types.ts`, `supabase/migrations/20260901000000_copilot_and_biological_retention.sql`.
- Diagnóstico: `components/diagnostic/`, `app/diagnostic/`, `lib/value-diagnostic-types.ts`, `supabase/migrations/20260902000000_value_perception_diagnostic_engine.sql`.
- Integração: `lib/belevy-integration.ts`, `app/belevy/`, `app/api/integrations/belevy/events/`, `supabase/functions/activate-belevy-benefit/`.
- Segurança/infra: `lib/supabase/`, `proxy.ts`, `next.config.ts`, `supabase/functions/`, `supabase/migrations/`.
- QA: `e2e/user-journey.spec.ts`, `scripts/`, `docs/technical-saas-audit-2026-08.md`, `docs/operational-pending.md`.

