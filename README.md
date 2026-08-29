# Agenda 80/20

Produto de aquisição, relacionamento e agendamento para profissionais autônomos e prestadores de serviço. O foco editorial inicial é beleza, com suporte a saúde e bem-estar, serviços locais, educação e serviços profissionais.

O domínio e o workflow horizontal estão documentados em [`docs/phase-9-multi-niche-service-spec.md`](docs/phase-9-multi-niche-service-spec.md).

Fundação técnica da Fase 0: Next.js App Router, TypeScript strict, Tailwind e Supabase Auth com SSR.

## Ambientes

Mantenha configurações e projetos Supabase separados para `development`, `staging` e `production`. Cada ambiente deve fornecer suas próprias variáveis a partir de `.env.example`; nenhum segredo é versionado. Nunca aponte testes de commerce para o banco de produção.

## Desenvolvimento

```bash
npm install
npm run dev
```

Sem as variáveis públicas do Supabase, o login informa que a configuração está ausente e a verificação de acesso protegido falha fechando.
