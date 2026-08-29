# Agenda 80/20 — Plano de implementação orientado à spec

**Fonte de verdade:** `# AGENDA 80/20 — SPEC TÉCNICA DEFINITIVA v1.0` (27/08/2026)  
**Status:** Fase 0 em andamento  
**Produto inicial:** `agenda_8020` · `pt-BR` · `America/Sao_Paulo`

## Regras de execução

- Cada ciclo entrega somente o escopo da fase abaixo, executa migrations e testes, valida RLS e registra divergências antes da fase seguinte.
- O cliente nunca recebe service role, segredos, tokens ou decisões de entitlement baseadas apenas no JWT.
- A recomendação permanece uma única ação elegível; não serão introduzidas funções fora do escopo explícito do MVP.
- Protocolos e mensagens de seed podem existir, mas não serão apresentados como dados de produção fictícios.

## Entregas por fase

| Fase | Entrega verificável | Critério de saída |
| --- | --- | --- |
| 0 — Foundation | Next.js, ambiente, Auth SSR, rotas base, schema de identidade e acesso, RLS | Login e proteção de rota compilam; RLS e advisors revisados |
| 1 — Commerce | Cakto webhook, compras, grants individuais, entitlement, outbox de acesso | TC-C01 a TC-C10 passam |
| 2 — Core | Onboarding, perfil/contexto, seeds de protocolos, motor, Hoje, detalhe e troca | Ação única e elegível para cada cenário O/M |
| 3 — Evidência | Execução, pendência, resultado tardio, check-in, progresso | TC-R01 a TC-R06 passam |
| 4 — Operação | Admin, versões imutáveis, políticas, métricas e auditoria | Alterações administrativas são auditáveis |
| 5 — Email | Resend hook/worker/webhook, cron e preferências | Emails essenciais e opt-ins seguem as regras |
| 6 — Belevy | Benefit entitlement, adapter e tracking de ativação | Falha externa não altera o acesso ao Agenda |
| 7 — QA beta | Coorte interna e 10–15 alunas beta | Guardrail de recomendação inelegível permanece 0% |

## Decisões da Fase 0

- O projeto remoto vinculado é `sepgbhztpktstzsgxvqk` (Agenda 80/20, região `sa-east-1`). Ele estava sem tabelas e sem migrations no início deste ciclo.
- O acesso terá `entitlements` como fonte de verdade e a RPC `can_access_agenda(user_id)`. `/today` exige sessão autenticada e entitlement `agenda_8020` ativo, ainda não expirado.
- RLS e grants serão explícitos. O acesso público não terá escrita sobre roles, entitlements, compras, conteúdo versionado ou políticas.
- A criação de `profiles` ocorrerá por trigger de `auth.users`; qualquer função com privilégio de trigger ficará no schema privado e não será exposta à Data API.
- Auth usa magic link e clientes Supabase separados para browser e servidor. A validação da sessão server-side usa `getClaims()`; `getSession()` não é usado como autorização.

## Divergência técnica registrada

A spec enumera `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A documentação atual do Supabase recomenda chaves **publishable** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) e mantém a chave anon legada apenas por compatibilidade até o fim de 2026. A base adotará a chave publishable, que é igualmente pública e não concede privilégios de service role. Esta mudança é apenas de nomenclatura/rotação de chave, não altera o modelo de segurança nem o escopo do produto.

## Fora da Fase 0

Não serão criados nesta fase: checkout Cakto, grants de compra, emails Resend, onboarding, dados de protocolos, motor, analytics, admin, PWA ou integração Belevy. Eles têm migrations e testes próprios nas fases definidas pela spec.
