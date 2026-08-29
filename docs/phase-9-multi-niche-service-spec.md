# Agenda 80/20 — domínio horizontal de serviços

## Objetivo

O Agenda 80/20 atende profissionais autônomos e pequenos negócios que dependem de atendimento, relacionamento e agendamento. Beleza é o primeiro foco editorial, mas não é o limite do produto.

A promessa do produto é ajudar a transformar tempo disponível em conversas qualificadas, clientes e agendamentos por meio de uma próxima ação simples e contextual.

## Nichos suportados

O cadastro trabalha com dois níveis:

- **Nicho amplo:** beleza, saúde e bem-estar, serviços locais, educação, serviços profissionais e outro.
- **Tipo de serviço:** unhas, cabelo, sobrancelhas e cílios, estética, maquiagem, saúde/bem-estar, serviço local, aulas, consultoria ou outro.

O tipo de serviço pode ser ampliado sem alterar o motor de recomendação. Conteúdo editorial pode ser universal (`all_services`) ou específico para um tipo de serviço.

`nail_design` continua válido como código legado para não quebrar perfis e conteúdos existentes.

## Modelo de contexto

Cada perfil deve guardar:

- tipo de serviço (`profession`);
- nicho amplo (`service_niche`);
- nome comercial do serviço (`service_name`);
- formato de atendimento (`in_person`, `online`, `hybrid`, `home_visit`);
- estágio do negócio;
- gargalo atual;
- canais disponíveis;
- disponibilidade nos próximos sete dias;
- existência de uma prova do serviço;
- caminho claro para receber agendamentos;
- sinais de oportunidade.

`has_real_portfolio` permanece como alias de compatibilidade. O conceito operacional é `has_service_proof`, que inclui portfólio, avaliações, depoimentos, resultados e cases.

## Workflow principal

1. A pessoa escolhe o tipo de serviço e descreve o serviço que quer movimentar.
2. Informa como atende e em que momento comercial está.
3. Identifica o gargalo: primeiros clientes, visibilidade, conversão, horários vazios ou retorno.
4. Registra disponibilidade, prova do serviço, caminho de agendamento, canais e sinais existentes.
5. O motor escolhe uma ação de preparação ou aquisição compatível com o contexto.
6. A pessoa executa, registra conclusão e informa se houve interesse ou agendamento.
7. Check-ins periódicos atualizam o contexto sem pedir dados pessoais de clientes.

O fluxo deve falar em serviço, atendimento e agendamento. Exemplos de beleza podem aparecer como exemplos, nunca como requisito.

## Regras editoriais

- Preferir “pessoa”, “cliente” e “serviço” quando o texto for horizontal.
- Usar “prova do serviço” em vez de “fotos do trabalho” quando o conceito aceitar serviços não visuais.
- Usar “agendamento” ou “horário” em vez de pressupor um procedimento específico.
- Mensagens podem conter variáveis ou exemplos específicos, mas não devem assumir Soft Gel, unhas ou uma profissão única.
- Ações universais devem ser elegíveis para `all_services`.
- Ações de nicho devem declarar explicitamente seu tipo de serviço elegível.

## Compatibilidade e migração

- RPCs antigos permanecem disponíveis para clientes antigos.
- O aplicativo usa `save_onboarding_v2` e `save_checkin_v2`.
- Perfis existentes recebem `service_niche=beauty` por padrão e preservam `nail_design` quando esse era o tipo original.
- `has_real_portfolio` é sincronizado com `has_service_proof`.
- Ações e mensagens legadas que eram restritas a `nail_design` passam a ser universais quando não contêm regra de nicho.
- O motor reconhece `all_services` como wildcard.

## Critérios de aceite

- É possível concluir onboarding para pelo menos unhas, cabelo, estética, maquiagem, saúde/bem-estar, serviço local, aulas e consultoria.
- Nenhum novo cadastro é rejeitado por não ser `nail_design`.
- Um usuário existente de nail design continua acessando seu plano e suas recomendações.
- Uma ação universal pode ser recomendada para qualquer tipo de serviço suportado.
- O check-in permite atualizar prova do serviço e caminho de agendamento.
- A home, onboarding, Hoje, progresso, termos, privacidade e administração não posicionam o produto exclusivamente para unhas.
- O produto deixa explícito que aquisição e agendamento são o foco; ele não promete resultado financeiro nem agenda cheia.
- Lint, typecheck/build e busca final por termos específicos devem passar ou ter falhas documentadas.
