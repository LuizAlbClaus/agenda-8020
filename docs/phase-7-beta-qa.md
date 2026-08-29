# Fase 7 — QA beta

## Estado de entrada

O smoke test de produção passou em 28/08/2026 para login, privacidade, termos e rotas protegidas. As rotas protegidas redirecionam usuários sem sessão para o bloqueio de acesso.

Baseline sem dados pessoais:

- 1 entitlement ativo de QA;
- 0 onboarding concluído;
- 0 recomendações e 0 execuções;
- 0 usuários com duas recomendações ativas;
- 18 protocolos editoriais ativos;
- flag Belevy desativada.

## Condições antes da coorte interna

- Concluir e aprovar as páginas de Termos e Política de Privacidade. O texto atual declara explicitamente que ainda será atualizado antes do beta.
- Promover uma conta nominada a `admin` ou `support` pela operação segura já existente, para que suporte e auditoria estejam disponíveis.
- Configurar o webhook Resend descrito em `operational-pending.md`, antes de usar emails comportamentais como sinal de QA.
- Confirmar que as ofertas Cakto de produção são pagamentos únicos: R$147 com 365 dias de acesso e R$97 com 180 dias de acesso. O benefício promocional do Agenda é de 30 dias, diferido e não cumulativo.

## Coorte interna

Executar com contas de QA, sem testar Cakto de produção contra outro banco:

1. Entrar pelo magic link e concluir onboarding em menos de cinco minutos.
2. Confirmar que Hoje mostra uma única ação e que seus passos não excedem três.
3. Executar a ação, registrar resultado e confirmar o check-in/resultados tardios quando aplicáveis.
4. Testar troca controlada e conferir que a ação substituta é elegível.
5. Testar preferências de email e suporte administrativo auditado.
6. Confirmar que Belevy permanece indisponível enquanto a flag estiver desligada.

## Coorte beta (10–15 alunas)

Revisar semanalmente recomendações, trocas, reclamações, ações impossíveis, mensagens, resultados e suporte. Investigar — sem tratar como promessa comercial — os seguintes sinais:

- onboarding concluído: pelo menos 70%;
- primeiro plano no P90: até cinco minutos;
- primeira ação em 72 horas: pelo menos 50%;
- recomendações inelegíveis: 0%;
- retenção na semana 2: pelo menos 35%; semana 4: pelo menos 25%.

Qualquer recomendação inelegível interrompe a expansão da coorte até revisão editorial e correção do guardrail.
