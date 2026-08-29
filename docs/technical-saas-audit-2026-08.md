# Auditoria técnica orientada ao produto — Agenda 80/20

## Resumo

O build atual passa e o produto já contém autenticação, onboarding contextual, motor de próxima ação, evidência de execução, administração e um núcleo inicial de agendamento público. A principal pendência de confiança encontrada foi documental: a Política de Privacidade não descrevia os dados mínimos gravados pelo agendamento público.

## Achados priorizados

### P0 — corrigido nesta revisão: privacidade inconsistente

`app/privacy/page.tsx` dizia que o produto não armazenava cadastro individual de clientes, mas `customers` e `appointments` são criados por `create_public_booking`. Isso podia gerar surpresa para a pessoa que marca e fragilizar a comunicação de consentimento.

**Correção:** a política agora declara nome e contato opcional usados para operar a reserva, distingue dados da profissional e do cliente final e mantém os direitos de acesso/exclusão.

### P1 — recomendado antes de tráfego em escala: proteção do RPC público

`create_public_booking` é executável por `anon`. A função valida serviço, disponibilidade e conflito transacional, mas o caminho público ainda precisa de uma política explícita contra abuso, especialmente rate limit por origem e janela máxima de reserva.

**Próximo passo:** adicionar rate limiting no perímetro/Edge Function ou no RPC com origem confiável. Não mascarar isso como segurança resolvida apenas pelo índice de exclusão.

### P1 — validar antes de beta amplo: exceções de disponibilidade

O schema possui `availability_exceptions`, mas a consulta do contexto público e a criação da reserva devem ser testadas para bloqueios e janelas extraordinárias. A experiência não pode oferecer horário bloqueado nem aceitar por chamada direta um intervalo que a interface não mostrou.

### P1 — validar com dados: retenção e solicitações de privacidade

O produto registra reservas, eventos e dados de contato. A operação precisa definir prazo de retenção, resposta ao pedido de exportação e tratamento de exclusão/anonymização para `customers`, `appointments` e `appointment_events`, além das tabelas do Growth Coach.

### P2 — experiência: estados vazios e feedback público

O fluxo já trata ausência de serviços, mas a página pública deve continuar clara quando não houver horários para um dia, quando a reserva falhar por concorrência e quando o contato opcional for usado apenas para confirmação. A melhoria de copy nesta revisão cobre parte da confiança; o beta deve observar o restante.

## Cobertura existente

- auth SSR e `getClaims()` para autorização server-side;
- entitlement para acesso ao Agenda;
- RLS explícito nas tabelas do núcleo;
- constraint transacional contra sobreposição de reservas;
- link público por workspace;
- páginas legais e pedidos de privacidade;
- documentação de pendências operacionais de Resend e Belevy.

## Verificações executadas

- `npm run build`: passou em 29/08/2026.
- `npm run lint`: interrompido após não produzir saída por tempo prolongado; repetir isoladamente com diagnóstico se necessário.
- busca estática dos fluxos de booking, auth, RLS e funções `SECURITY DEFINER`.

## Critério para liberar aquisição

Antes de anunciar em volume: testar uma reserva pública concorrente, uma data fora da janela exibida, bloqueio de disponibilidade, contato inválido, tentativa repetida e pedido de exclusão/exportação. Registrar evidências sem usar dados reais de clientes.

