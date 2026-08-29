# Pendências operacionais

## Resend webhook — Fase 5

Antes de receber eventos de entrega em produção, configurar no Resend o endpoint:

`https://sepgbhztpktstzsgxvqk.supabase.co/functions/v1/resend-webhook`

Assinar os eventos `email.delivered`, `email.bounced` e `email.complained`. Armazenar o segredo de assinatura fornecido pelo Resend nos Edge Secrets do Supabase como `RESEND_WEBHOOK_SECRET`.

Enquanto esse segredo não estiver configurado, a função falha fechada e não aceita eventos sem assinatura verificável.

## Belevy activation — Fase 6

O adapter de ativação já está implantado, mas a flag `belevy_activation_enabled` permanece desativada até existir o endpoint do Belevy. Antes de ativá-la, configurar os Edge Secrets `BELEVY_ACTIVATION_ENDPOINT` e `BELEVY_SHARED_SECRET`, validar o contrato de ativação e então habilitar a flag pelo Admin.

O Agenda não é uma assinatura: o produto principal é um pagamento único de
R$147 com 12 meses de acesso; o downsell é um pagamento único de R$97 com 6
meses. Os campos `access_days` e `belevy_benefit_days` são independentes.
Compras Agenda geram um benefício promocional diferido de 30 dias, ativado
somente quando a usuária escolher. Extensões pagas de Belevy podem usar uma
mapping separada com `belevy_benefit_type = paid_extension`; nenhum ID de
produto/oferta é criado por código.

Benefícios promocionais gratuitos não acumulam. O registro fica disponível e
auditável para que a política do ecossistema (incluindo a campanha de
ex-alunas, 60 dias) escolha o melhor benefício; o Agenda não soma trials.

Enquanto a flag estiver desativada, nenhuma chamada externa é feita e a usuária vê uma mensagem honesta de indisponibilidade.

### Contrato necessário para ativar o Belevy

O adapter espera um endpoint HTTPS configurado em `BELEVY_ACTIVATION_ENDPOINT` e
um segredo compartilhado em `BELEVY_SHARED_SECRET`. O endpoint deve:

- aceitar `POST` com `Content-Type: application/json`;
- autenticar o valor enviado no header `Authorization` com o segredo compartilhado;
- receber `{ email, name, benefit_id, duration_days }`;
- retornar qualquer status `2xx` quando a ativação for aceita, inclusive `204`;
- opcionalmente retornar JSON com `external_reference`, `reference_id` ou `id`;
- não registrar o segredo, o payload completo ou dados de clientes em logs.

O endpoint deve ser idempotente para a mesma ativação. A função já mantém a
máquina de estados local e considera a ativação local concluída somente depois
de uma resposta `2xx`; respostas não-2xx, timeout de 10 segundos e respostas
JSON inválidas marcam a ativação como falha. Não há callback externo exigido
pelo contrato atual.

Checklist antes de habilitar:

1. disponibilizar endpoint HTTPS de homologação com o contrato acima;
2. configurar os dois secrets nos Edge Functions do Supabase, sem colocá-los no
   repositório, no frontend ou em logs;
3. testar uma ativação com uma conta de QA e confirmar a concessão no Belevy,
   a transição local para `active` e a idempotência de uma segunda tentativa;
4. testar timeout, resposta `4xx/5xx` e JSON inválido, confirmando estado
   `failed` e nenhuma ativação parcial;
5. somente após esses testes, habilitar `belevy_activation_enabled` pelo Admin;
6. em qualquer incidente, desabilitar a flag e rotacionar o segredo se houver
   suspeita de exposição.

### Rate limit

O RPC versionado `public.consume_rate_limit` já é usado pelo webhook Cakto e
pela ativação Belevy. O Cakto aplica 120 requisições por IP hashado a cada 60
segundos; a ativação aplica 5 tentativas por usuária hashada a cada hora. O
hash SHA-256 é calculado na Edge Function e somente o hash é enviado ao banco.
Ao atingir o limite, ambas retornam `429` com `Retry-After`; se o RPC ficar
indisponível, falham fechadas com resposta controlada `503`.

Login/magic link e mutações Admin devem usar o mesmo RPC quando as respectivas
rotas forem ajustadas. As Edge Functions não mantêm contadores locais nem
inventam uma política divergente.
