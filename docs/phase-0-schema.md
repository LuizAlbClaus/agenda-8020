# Fase 0 — schema local do Agenda 80/20

Migrations:

- `supabase/migrations/20260827202600_phase_0_schema.sql`
- `supabase/migrations/20260827202805_phase_0_security_hardening.sql`

## Escopo

Implementa os itens 78–80, 99–100 e 108–110 da spec:

- `profiles`: perfil mínimo, com locale `pt-BR` e timezone `America/Sao_Paulo`.
- `user_roles`: papéis `user`, `content_editor`, `support` e `admin`.
- `entitlements`: um registro por usuário/produto, com status `active`, `revoked` ou `expired`.
- Índice parcial para a consulta de acesso ativo.
- Trigger interno para criar o perfil após um novo `auth.users` e triggers de `updated_at`.
- `public.can_access_agenda(user_id)`: só retorna `true` para o próprio `auth.uid()` com entitlement `agenda_8020` ativo e `expires_at > now()`.

Commerce, purchases e `entitlement_grants` permanecem para a Fase 1.

## RLS e privilégios

Todas as tabelas públicas têm RLS habilitado. Usuários autenticados podem apenas ler/atualizar o próprio `profiles` (o update também exige `WITH CHECK`) e ler o próprio `entitlements`. `user_roles` não tem grants e possui policy explícita `USING (false)` para negar SELECT direto ao cliente. A função de trigger `SECURITY DEFINER` fica no schema não exposto `private`, usa `search_path` fixo e não é executável por `PUBLIC`, `anon` ou `authenticated`. A função pública `can_access_agenda` é `SECURITY INVOKER` e só é executável por `authenticated`. A função interna preexistente `public.rls_auto_enable()` também tem EXECUTE revogado para `PUBLIC`, `anon` e `authenticated`.

## Teste local

Com o Supabase CLI disponível:

```text
supabase start
supabase db reset
supabase migration list --local
```

Para validar sem banco remoto, a migration pode ser verificada com `supabase db lint --local` (ou `supabase db query --local` em versões que suportem o comando). Não use `supabase link`, `db push` ou credenciais de service role neste passo.
