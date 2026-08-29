# Especificação executável — plataforma horizontal de serviços e agendamento

**Status:** implementação incremental iniciada nas fases 9 e 10; o Growth Coach horizontal e o núcleo inicial de agendamento já estão ativos no código.  
**Versão:** 1.0 — 2026-08-28  
**MVP inicial:** serviços de beleza, `pt-BR`, `America/Sao_Paulo`, mantendo compatibilidade com Agenda 80/20.

## 1. Objetivos e não objetivos

### Objetivos

- Permitir que um prestador configure negócio, serviços, duração, preço opcional, profissionais e recursos.
- Publicar disponibilidade derivada de regras de horário, bloqueios e reservas.
- Permitir que um cliente escolha serviço e horário, confirme, cancele ou solicite remarcação.
- Evitar dupla reserva por restrição transacional no servidor.
- Permitir que o primeiro catálogo seja beleza sem codificar gênero, profissão ou técnica no núcleo.
- Preservar o orientador atual como contexto de crescimento, sem obrigar a coleta de dados de clientes finais.

### Fora do MVP

Pagamento online, prontuário, estoque, comissão, marketplace, chat, recorrência, integração com calendários externos e automação de marketing multicanal. Preço e duração podem ser exibidos, mas cobrança é posterior.

## 2. Vocabulário canônico

| Termo | Definição | Não usar como sinônimo |
| --- | --- | --- |
| Workspace | unidade de negócio/tenant que possui configuração e dados | usuário, profissão |
| Provider | pessoa que presta o serviço | gênero, “aluna” |
| Customer | pessoa que agenda/recebe o serviço; dados mínimos e consentidos | cliente usado como segmento de marketing |
| Service | oferta agendável, com nome, duração, buffer e regras | protocolo/ação |
| Resource | pessoa, sala, cadeira ou equipamento necessário | canal social |
| Availability rule | regra recorrente de disponibilidade | horário livre materializado |
| Availability exception | bloqueio ou janela extraordinária | check-in |
| Appointment | reserva de um service para customer, provider/resource e intervalo | recommendation |
| Booking status | `held`, `confirmed`, `cancelled`, `completed`, `no_show` | status editorial |
| Niche | segmento de mercado, ex. `beauty.nails` | profissão rígida |
| Specialty/modality | técnica ou especialidade, ex. `beauty.nails.soft_gel` | regra de autorização |
| Growth context | estágio, gargalo, sinais e prontidão usados pelo coach | estado da agenda |

## 3. Taxonomia de nichos

O catálogo usa códigos estáveis, hierárquicos e traduzíveis. `niche` e `specialty` são dados de catálogo, não enums compilados no motor.

| Código inicial | Nome | Exemplos de especialidade |
| --- | --- | --- |
| `beauty.nails` | Unhas | `soft_gel`, `manicure`, `pedicure`, `nail_art` |
| `beauty.hair` | Cabelos | corte, coloração, escova, tranças |
| `beauty.brows` | Sobrancelhas | design, henna, laminação |
| `beauty.lashes` | Cílios | extensão, lifting |
| `beauty.makeup` | Maquiagem | social, noivas, editorial |
| `beauty.skin` | Pele/estética facial | limpeza, tratamentos |
| `beauty.body` | Estética corporal/massagem | massagem, depilação |
| `beauty.barber` | Barbearia | corte, barba |
| `other.services` | Outros serviços | catálogo futuro |

Não haverá `gender` obrigatório em workspace, provider ou customer. Nome, pronome e forma de tratamento são opcionais, separados e informados pelo próprio titular quando necessários; copy padrão usa linguagem neutra. O sistema nunca inferirá gênero por nome, nicho ou histórico.

## 4. Modelo de domínio alvo

Entidades mínimas: `workspaces(id, name, timezone, locale)`, `workspace_members(workspace_id,user_id,role)`, `providers(workspace_id,display_name,active)`, `customers(workspace_id,display_name,contact,consent_status)`, `niches(code,parent_code,label)`, `services(workspace_id,niche_code,name,description,duration_minutes,buffer_minutes,price_minor,currency,active)`, `service_specialties(service_id,specialty_code)`, `resources(workspace_id,type,name,active)`, `service_resources(service_id,resource_id)`, `availability_rules(resource_id,weekday,starts_at,ends_at,effective_from,effective_until)`, `availability_exceptions(resource_id,starts_at,ends_at,kind)`, `appointments(workspace_id,service_id,customer_id,provider_id,resource_id,starts_at,ends_at,status,source,notes)`, `appointment_events(appointment_id,event_type,payload,created_by)`.

Invariantes executáveis:

- intervalo é timezone-aware, `ends_at > starts_at`, e duração efetiva respeita service + buffer;
- service, provider, resource e customer pertencem ao mesmo workspace;
- appointment confirmado exige service ativo e intervalo dentro da disponibilidade;
- não pode existir sobreposição de appointments ativos para o mesmo provider/resource;
- customer contact é opcional no MVP e sujeito a consentimento/retention;
- alterações de status são transições auditáveis e idempotentes;
- disponibilidade pública não revela dados de outros customers.

O SQL deve impor ownership por RLS, validação por RPC/Server Action autorizada e uma constraint de exclusão ou lock transacional para conflitos. A disponibilidade exibida é calculada no servidor; o cliente não grava `appointments` diretamente.

## 5. Workflow do usuário

### Prestador

1. Autenticar e criar/selecionar workspace.
2. Escolher nicho(s) e especialidade(s), sem campo de gênero obrigatório.
3. Cadastrar provider, serviço (nome/duração/preço opcional) e recurso necessário.
4. Definir regras semanais e exceções de disponibilidade.
5. Publicar serviço e compartilhar link de reserva.
6. Acompanhar agenda; confirmar, concluir, cancelar ou solicitar remarcação.

### Cliente

1. Abrir link público do workspace.
2. Escolher serviço e, quando aplicável, provider.
3. Consultar slots livres no timezone do workspace.
4. Informar apenas dados necessários, aceitar política e confirmar.
5. Receber confirmação; gerenciar cancelamento/remarcação dentro da política.

### Coach legado opcional

O onboarding atual de estágio/gargalo/canais continua como `growth_context` para quem usa o produto Agenda 80/20. Uma recomendação pode apontar para configurar serviço/disponibilidade, mas jamais cria ou confirma appointment sozinha.

## 6. Compatibilidade e migração

Estratégia additive-first em fases:

1. Criar tabelas/catálogos novos sem remover `business_profiles`, `action_protocols`, `action_versions` ou RPCs existentes.
2. Criar catálogo `niches` e alias `nail_design → beauty.nails`; backfill de `business_profiles.profession` em uma tabela de mapeamento, preservando o valor original.
3. Adicionar `niche_codes`/tags a conteúdo editorial; conteúdo antigo recebe `beauty.nails` e indicação de legado. Soft Gel permanece histórico e não vira default global.
4. Manter `agenda_8020` como `product_code`/entitlement durante a transição; novos produtos usam códigos configuráveis.
5. Introduzir `workspace_id` com backfill one-workspace-per-user e views/RPCs compatíveis; somente depois permitir múltiplos membros.
6. Dual-read/dual-write temporário, métricas de divergência e rollback por feature flag. Só remover aliases após export, RLS e coorte de migração validados.
7. Atualizar termos, privacidade, onboarding e admin para linguagem neutra; não migrar ou inventar gênero.

## 7. Arquitetura e limites

- **Web:** Next.js 16 App Router; Server Components para leitura, Server Actions/Route Handlers para mutações. `proxy.ts` apenas para redirect otimista; autorização real no servidor/RPC.
- **Dados:** Supabase/Postgres com RLS por workspace; funções privilegiadas fechadas e `search_path` fixo; migrations versionadas.
- **Domínios:** `identity/access`, `workspace/catalog`, `scheduling`, `growth-coach`, `commerce`, `notifications`, `audit/privacy`.
- **Conteúdo:** catálogo localizado, tags de nicho/especialidade e versões imutáveis; o motor não contém copy de Soft Gel.
- **Privacidade:** separar dados do provider, customer e analytics; minimização, exportação, exclusão/anonymização e retenção explícitas.
- **Eventos:** `appointment_created`, `appointment_confirmed`, `appointment_cancelled`, `appointment_completed`, `appointment_no_show`, `availability_published`; payloads sem email/nome quando não necessários.

## 8. Critérios de aceite

- [ ] Um workspace pode cadastrar pelo menos dois serviços de nichos diferentes sem alteração de código.
- [ ] Um serviço pode ter duração, buffer e preço opcional; duração inválida é rejeitada no servidor.
- [ ] Slots exibidos respeitam timezone, disponibilidade, exceções e appointments ativos.
- [ ] Duas confirmações concorrentes para o mesmo provider/resource deixam exatamente uma confirmada.
- [ ] Cancelamento/remarcação respeitam política configurada, registram evento e são idempotentes.
- [ ] RLS impede leitura/escrita entre workspaces, inclusive por RPC e exportação.
- [ ] Fluxo público não exige gênero e não infere gênero; copy e labels passam revisão de linguagem neutra.
- [ ] `nail_design` legado continua abrindo o produto e seu conteúdo histórico, enquanto o alias aponta para `beauty.nails`.
- [ ] Nenhum novo serviço usa Soft Gel como default; apenas o conteúdo tagged `beauty.nails.soft_gel` o apresenta.
- [ ] Coach legado continua gerando no máximo uma recomendação elegível e não cria reserva automaticamente.
- [ ] Migração é repetível, auditável, mensurável e possui rollback por flag antes da remoção dos campos legados.
- [ ] Termos/privacidade descrevem provider, customer, service e appointment e não prometem resultados de agenda/renda.

## 9. Ordem de execução futura

### Implementado nesta entrega

- Catálogo horizontal de nichos e tipos de serviço, com beleza como foco inicial.
- Perfil de serviço com formato de atendimento, prova do serviço e caminho de agendamento.
- Workspaces de um prestador, provider, service, customer, disponibilidade recorrente e appointments.
- Link público de booking com seleção de serviço, dia, horário e confirmação.
- Proteção contra dupla reserva por exclusão transacional no provider.
- Growth Coach com conteúdo `all_services` e compatibilidade com `nail_design`.

### Lacunas deliberadas para a próxima fase

- Tela autenticada para editar serviços, duração, preços e regras de disponibilidade.
- Cancelamento e remarcação públicos com política configurável.
- Gestão manual de appointments e transições de status pelo provider.
- Múltiplos providers/resources por workspace e seleção pública de provider.
- Notificações de confirmação e lembrete.

1. ADR e catálogo de códigos; testes de contrato e dados de seed.
2. Schema de workspace/catalog e RLS.
3. Disponibilidade e cálculo de slots.
4. Appointment hold/confirm/cancel com teste de concorrência.
5. Fluxos web do provider e booking público.
6. Migração/backfill do legado e dual-read/dual-write.
7. Notificações, privacidade e observabilidade; só então expandir nichos.
