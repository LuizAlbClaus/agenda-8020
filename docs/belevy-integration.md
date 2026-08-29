# Integração opcional Agenda 80/20 → Belevy

O Agenda 80/20 é independente. O Belevy é uma camada operacional opcional para quem quer centralizar agenda, clientes, disponibilidade, confirmações, lembretes, financeiro, calendário e CRM.

## Regras

- `agenda_8020` continua sendo o entitlement do produto principal.
- Benefício ou assinatura do Belevy não controla o acesso ao Agenda.
- Sem Belevy, a pessoa continua usando coach, ações, registros, check-ins, progresso e o modo básico local.
- Com Belevy conectado, o Belevy é a fonte canônica dos agendamentos.
- O Agenda consulta somente um resumo mínimo: slug público, próximos horários e contagens agregadas.
- Depois da ativação, o link público do Agenda encaminha para o link oficial do Belevy enquanto a conexão estiver vigente.
- Eventos mínimos do Belevy podem ser recebidos pelo Agenda com idempotência para alimentar contexto operacional futuro.
- Nenhum nome, telefone, cliente, conversa ou dado financeiro do Belevy é copiado.
- O Agenda nunca cria, edita, cancela ou conclui agendamentos no Belevy.

## Estados da integração

| Estado | Comportamento |
| --- | --- |
| `not_configured` | modo autônomo, sem consulta externa |
| `not_connected` | modo autônomo e convite opcional para ativar/assinar Belevy |
| `connected` | link e resumo oficiais vêm do Belevy |
| `expired` | Agenda permanece ativo; operação externa fica indisponível |
| `unavailable` | Agenda permanece ativo; resumo é temporariamente omitido |

## Configuração server-only

No Agenda:

- `BELEVY_PUBLIC_URL`
- `BELEVY_AGENDA_SUMMARY_ENDPOINT`
- `BELEVY_SHARED_SECRET`
- `BELEVY_EVENTS_SHARED_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (somente para o Route Handler de eventos)

No Belevy:

- `BELEVY_SHARED_SECRET`
- `AGENDA_EVENTS_ENDPOINT`
- `AGENDA_SHARED_SECRET`

O segredo nunca pode usar prefixo `NEXT_PUBLIC_`, aparecer em logs ou ser enviado ao browser.

## Experiência comercial

O modo autônomo não é uma tela quebrada: ele entrega o método do Agenda, suas ações e um booking básico. O trial do Belevy deve mostrar valor operacional real — agenda oficial, clientes, confirmações, lembretes, financeiro, calendário e CRM — e, quando terminar, explicar com clareza o que deixou de estar disponível e como assinar. O retorno ao modo autônomo é automático e não apaga dados do Agenda.
