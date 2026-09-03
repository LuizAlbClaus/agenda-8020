export type LandingVariant = "cold" | "soft-gel" | "organic";

export interface DemoSituation {
  id: string;
  label: string;
  badge: string;
  serviceExample: string;
  currentFocus: string;
  actionTitle: string;
  durationMinutes: number;
  whyNow: string;
  steps: [string, string, string];
  textScript: string;
  audioScript: string;
  audioSeconds: number;
  audioTone: string;
  outcomeNote: string;
}

export interface ScenarioItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  movementTitle: string;
  movementRationale: string;
  durationMinutes: number;
}

export interface SupportModuleItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  benefit: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface VariantHeroConfig {
  eyebrow: string;
  headline: string;
  supportingHeadline: string;
  subheadline: string;
  primaryCta: string;
  microcopy: string;
  heroMockupFocus: string;
  heroMockupTitle: string;
  heroMockupDuration: number;
  heroMockupWhyNow: string;
  heroMockupSteps: [string, string, string];
  heroMockupTextScript: string;
  heroMockupAudioScript: string;
}

export const VARIANT_HERO_DATA: Record<LandingVariant, VariantHeroConfig> = {
  cold: {
    eyebrow: "1 ação de cada vez · feita para o seu momento",
    headline: "Pare de tentar fazer tudo para movimentar seu serviço.",
    supportingHeadline: "Descubra qual é a próxima ação que realmente faz sentido fazer agora.",
    subheadline:
      "Conte ao Agenda 80/20 como está seu negócio, quanto tempo você tem e onde está travando. Ele entende seu momento, escolhe uma única próxima ação e mostra como colocar esse movimento em prática.",
    primaryCta: "Montar meu primeiro plano",
    microcopy: "Leva poucos minutos para começar · Sem teorias complicadas.",
    heroMockupFocus: "Ativar clientes que já tiveram contato com você antes de abrir novos horários.",
    heroMockupTitle: "Reative algumas clientes que já tiveram contato com seu serviço",
    heroMockupDuration: 10,
    heroMockupWhyNow:
      "Reabrir conversa com quem já conhece seu trabalho custa menos esforço e tem maior probabilidade de resposta imediata nesta semana.",
    heroMockupSteps: [
      "Abra seu WhatsApp e identifique 3 clientes que foram atendidas há cerca de 3 a 4 semanas.",
      "Envie a mensagem de cortesia perguntando como está o resultado e se gostariam de reservar horário.",
      "Quando responderem, ofereça duas opções de horário para facilitar a escolha.",
    ],
    heroMockupTextScript:
      "Oi Ju! Tudo bem? Lembrei de você hoje. Como está seu procedimento? Já estamos chegando no período ideal para manutenção para manter impecável. Separei quinta às 14h ou sexta às 10h para você. Qual fica melhor na sua rotina?",
    heroMockupAudioScript:
      "Oi Ju, tudo bem? Tô passando rapidinho porque lembrei de você! Como tá o resultado do seu procedimento? Já tá chegando naquela janelinha perfeita de manutenção. Separei dois horários aqui: quinta às 14h ou sexta às 10h. Qual dos dois cabe melhor no seu dia?",
  },
  "soft-gel": {
    eyebrow: "Seu próximo passo depois do Soft Gel Express",
    headline:
      "Aprender a técnica resolve uma parte do problema. Agora é hora de colocar seu trabalho em movimento.",
    supportingHeadline:
      "Você já sabe o que fazer na bancada. Agora precisa saber o que fazer para movimentar sua clientela.",
    subheadline:
      "O Agenda 80/20 entende onde você está hoje e transforma seu momento em uma próxima ação prática — desde criar as primeiras oportunidades até conduzir conversas e estimular o retorno de clientes.",
    primaryCta: "Montar meu primeiro plano",
    microcopy: "Criado especificamente para a realidade de quem atende com as próprias mãos.",
    heroMockupFocus: "Convidar as primeiras 3 modelos com data marcada para fotos de portfólio.",
    heroMockupTitle: "Convide 3 pessoas próximas para modelo com condição de inauguração",
    heroMockupDuration: 10,
    heroMockupWhyNow:
      "Você domina o método técnico e agora precisa de atendimentos reais para gerar registros fotográficos, segurança e indicações espontâneas.",
    heroMockupSteps: [
      "Escolha 3 pessoas próximas (amigas ou familiares) com quem você tem bom diálogo.",
      "Explique com transparência que está aperfeiçoando o portfólio e ofereça a condição especial de modelo.",
      "Defina o dia e o horário exato antes de encerrar a conversa no WhatsApp.",
    ],
    heroMockupTextScript:
      "Oi Mari! Estou organizando meus atendimentos com a técnica Soft Gel Express e separei 3 vagas especiais para modelos esta semana para o meu portfólio. Lembrei de você na hora! Consigo fazer por uma condição super especial de modelo. Tenho quinta às 14h ou sexta às 10h. Qual fica mais tranquilo para você?",
    heroMockupAudioScript:
      "Oi Mari, tudo bem? Menina, tô organizando meus atendimentos com o método Soft Gel Express e separei três horários especiais de modelo essa semana pras fotos de portfólio. Lembrei de você na hora! Consigo fazer uma condição bem bacana de modelo. Tenho quinta às duas ou sexta às dez. Qual fica mais fácil pra você?",
  },
  organic: {
    eyebrow: "Decisão rápida · 2 a 5 minutos no seu dia",
    headline: "Um aplicativo que te ajuda a decidir o que fazer hoje para movimentar seu serviço.",
    supportingHeadline:
      "Não mais uma lista de estratégias. Uma próxima ação para o momento em que você realmente está.",
    subheadline:
      "Você não precisa de 20 ideias soltas de marketing. Você precisa abrir o celular, entender qual movimento merece sua atenção agora, executar e seguir o seu dia.",
    primaryCta: "Montar meu primeiro plano",
    microcopy: "Acesso imediato · Funciona no celular direto no navegador.",
    heroMockupFocus: "Conduzir com postura consultiva quem pediu orçamento no WhatsApp.",
    heroMockupTitle: "Retome conversas de orçamento que esfriaram esta semana",
    heroMockupDuration: 10,
    heroMockupWhyNow:
      "Quem pediu valor nos últimos dias já tem interesse no serviço. Uma pergunta de alinhamento reabre a oportunidade sem parecer insistente.",
    heroMockupSteps: [
      "Abra a conversa de quem perguntou o preço e ainda não confirmou.",
      "Faça uma pergunta sobre o objetivo dela antes de insistir no agendamento.",
      "Ofereça uma reserva de cortesia com prazo curto de resposta.",
    ],
    heroMockupTextScript:
      "Olá! Tudo bem? Fica entre R$ 120 e R$ 150 dependendo do estado atual e do efeito que você deseja. Me conta rapidinho: você já fez esse procedimento antes ou seria a sua primeira vez?",
    heroMockupAudioScript:
      "Oi, tudo bem? O valor varia entre R$ 120 e R$ 150, depende bastante do resultado que você tá buscando. Me conta uma coisa rapidinho: você já fez esse procedimento antes ou seria a primeira vez aqui comigo?",
  },
};

export const DEMO_SITUATIONS: DemoSituation[] = [
  {
    id: "first_clients",
    label: "Estou começando e não tenho clientes",
    badge: "Fase Inicial",
    serviceExample: "Nail Designer / Estética",
    currentFocus: "Construir as primeiras 3 a 5 clientes reais para gerar fotos de portfólio e prova.",
    actionTitle: "Convide 3 pessoas próximas para modelo com data marcada",
    durationMinutes: 10,
    whyNow:
      "Você está no início da jornada. O movimento prioritário não é postar no vazio, e sim colocar pessoas reais na cadeira para gerar segurança e primeiros registros.",
    steps: [
      "Escolha 3 pessoas próximas com quem você já tem boa relação e confiança.",
      "Explique com transparência que está aperfeiçoando o atendimento e ofereça condição especial de modelo.",
      "Defina dia e horário fixos antes de encerrar o contato no WhatsApp.",
    ],
    textScript:
      "Oi Ju! Estou organizando meus atendimentos e reservei 3 vagas especiais para modelos esta semana para montar meu portfólio oficial. Lembrei de você! Se você topar vir, faço por uma condição super especial de modelo. Tenho quinta às 14h ou sexta às 10h. Qual dia fica mais fácil?",
    audioScript:
      "Oi Ju, tudo bem? Tô organizando meus atendimentos e separei três vagas bem especiais de modelo essa semana pras fotos de portfólio. Lembrei de você na hora! Se você topar, consigo fazer por um valor bem simbólico de modelo. Separei quinta às 14h ou sexta às 10h. Qual cabe melhor na sua rotina?",
    audioSeconds: 22,
    audioTone: "Calma, calorosa e transparente, sem pressão.",
    outcomeNote: "Gera as primeiras clientes na grade e material fotográfico real.",
  },
  {
    id: "low_visibility",
    label: "Pouca gente conhece meu trabalho",
    badge: "Visibilidade Local",
    serviceExample: "Serviço no Bairro / Espaço Próprio",
    currentFocus: "Apresentar seu atendimento para o público que já frequenta comércios da vizinhança.",
    actionTitle: "Proponha uma parceria de cortesia com comércio vizinho",
    durationMinutes: 15,
    whyNow:
      "Lojas de roupas, salões parceiros e cafeterias próximas já atendem pessoas que moram perto e compram serviços de cuidado pessoal.",
    steps: [
      "Identifique 1 comércio complementar vizinho (ex: loja feminina ou estética parceira).",
      "Proponha presentear 5 das melhores clientes deles com um voucher de cortesia de cuidado.",
      "Troquem contatos de WhatsApp para acompanhar quem manifestar interesse.",
    ],
    textScript:
      "Olá! Tudo bem? Sou profissional aqui no bairro e atendo com alongamento e cuidado. Sei que você tem clientes incríveis aqui na loja e gostaria de presentear 5 delas com um voucher especial de cortesia para conhecerem meu trabalho. Podemos conversar 2 minutos no WhatsApp?",
    audioScript:
      "Olá, tudo bem? Sou profissional aqui pertinho e atendo com cuidados estéticos. Sei que sua loja tem clientes super fiéis e eu gostaria de presentear cinco delas com um voucher especial de cortesia pra conhecerem meu espaço. Podemos falar dois minutinhos no WhatsApp pra eu te explicar?",
    audioSeconds: 24,
    audioTone: "Profissional, colaborativa e gentil.",
    outcomeNote: "Acesso a clientes qualificadas da sua região sem gastar com anúncios.",
  },
  {
    id: "low_conversion",
    label: "As pessoas perguntam o preço, mas somem",
    badge: "Conversão & Copiloto",
    serviceExample: "Atendimento no WhatsApp",
    currentFocus: "Assumir postura de especialista antes de apenas disparar o número da tabela.",
    actionTitle: "Retome orçamentos pausados com pergunta consultiva",
    durationMinutes: 10,
    whyNow:
      "Enviar apenas o preço isolado faz a cliente comparar você com a opção mais barata da cidade. Fazer uma pergunta diagnóstica eleva o valor percebido na hora.",
    steps: [
      "Abra a conversa de quem pediu o valor nas últimas 48 horas e não respondeu mais.",
      "Envie a pergunta de contexto para entender o que ela busca antes de insistir em data.",
      "Apresente a solução com a garantia e ofereça 2 opções claras de horário.",
    ],
    textScript:
      "Olá! Tudo bem? O valor varia entre R$ 120 e R$ 150 dependendo do estado atual e do efeito que você deseja. Me conta uma coisa rapidinho: você já fez esse procedimento antes ou seria a sua primeira vez?",
    audioScript:
      "Oi, tudo bem? O valor fica entre 120 e 150, varia conforme o efeito que você prefere. Mas me conta uma coisinha antes: você já fez esse procedimento alguma vez ou seria a primeira vez comigo?",
    audioSeconds: 18,
    audioTone: "Interessada, atenciosa e segura, sem soar vendedora chata.",
    outcomeNote: "Destrava orçamentos congelados e transforma curiosas em agendamentos.",
  },
  {
    id: "empty_slots",
    label: "Tenho horários vazios na semana",
    badge: "Ocupação Rápida",
    serviceExample: "Grade Semanal",
    currentFocus: "Divulgar disponibilidades específicas sem queimar preço com promoções desesperadas.",
    actionTitle: "Divulgue 2 horários prioritários para sua rede",
    durationMinutes: 10,
    whyNow:
      "Dizer 'agenda aberta para a semana toda' passa a sensação de que ninguém quer marcar. Divulgar 2 horários pontuais gera decisão imediata.",
    steps: [
      "Escolha exatamente 2 horários críticos da sua grade (ex: quinta às 15h e sexta às 10h).",
      "Comunique nos seus Stories ou lista próxima que abriu essas duas vagas específicas.",
      "Deixe o link direto ou WhatsApp para quem responder primeiro.",
    ],
    textScript:
      "Meninas, consegui reorganizar minha grade e surgiram 2 horários especiais para esta semana: quinta às 15h e sexta às 10h. Quem tiver precisando de atendimento impecável, me dá um toque por aqui para garantir antes que preencham!",
    audioScript:
      "Gente, passei rapidinho pra avisar: consegui ajustar a grade e abriram duas vagas pontuais essa semana, quinta às 15h e sexta às 10h. Se alguém tiver precisando arrumar o horário, me manda um oi aqui agora pra eu segurar!",
    audioSeconds: 16,
    audioTone: "Direta, solícita e desapegada.",
    outcomeNote: "Preenchimento de horários ociosos com postura de autoridade.",
  },
  {
    id: "low_return",
    label: "Quero que minhas clientes voltem mais",
    badge: "Retenção Inteligente",
    serviceExample: "Clientes Antigas",
    currentFocus: "Identificar clientes que estão completando a janela de retorno de 21 a 28 dias.",
    actionTitle: "Reative 2 clientes que já estão na janela de retorno",
    durationMinutes: 10,
    whyNow:
      "A cliente que já foi bem atendida quer voltar, mas a rotina corrida faz ela esquecer até o procedimento lascar. Chamar no momento certo parece carinho, não venda.",
    steps: [
      "Abra sua lista e veja quem foi atendida há cerca de 3 a 4 semanas.",
      "Envie uma mensagem carinhosa perguntando sobre a durabilidade e o estado do serviço.",
      "Ofereça reservar o horário com antecedência para que ela não fique sem vaga.",
    ],
    textScript:
      "Oi Mari! Tudo bem com você? Lembrei de você hoje. Como está seu procedimento da última vez? Como já se passaram 24 dias, queria ver se você quer já deixar o seu horário pré-garantido para a próxima semana antes de fechar a grade!",
    audioScript:
      "Oi Mari, tudo bem querida? Tava organizando minha agenda da semana que vem e lembrei de você. Como tão as coisas por aí? Já faz uns 24 dias do nosso atendimento, então queria ver se você já quer garantir seu horário antes que a grade aperte!",
    audioSeconds: 20,
    audioTone: "Acolhedora, próxima e preventiva.",
    outcomeNote: "Receita recorrente e previsível sem precisar caçar clientes novas.",
  },
];

export const SCENARIOS_DATA: ScenarioItem[] = [
  {
    id: "sc-1",
    tag: "Cenário 1 · Zero Clientes",
    title: "“Estou começando e ainda não tenho clientes.”",
    description:
      "Você acabou de se formar ou mudou de cidade. Postar dancinhas no Instagram para 50 seguidores não vai encher sua grade.",
    movementTitle: "Movimento de ativação inicial:",
    movementRationale:
      "Construir a primeira prova com pessoas próximas, gerar fotos reais do seu serviço e convidar 3 modelos com data marcada.",
    durationMinutes: 10,
  },
  {
    id: "sc-2",
    tag: "Cenário 2 · Visibilidade Local",
    title: "“Pouca gente na minha região conhece meu serviço.”",
    description:
      "Você já tem o espaço pronto, mas as pessoas do seu bairro não sabem que você existe ou acham que você está fechada.",
    movementTitle: "Movimento de visibilidade sem anúncio caro:",
    movementRationale:
      "Parcerias de cortesia com pequenos comércios vizinhos e avisos objetivos de horário para contatos locais.",
    durationMinutes: 15,
  },
  {
    id: "sc-3",
    tag: "Cenário 3 · Baixa Conversão",
    title: "“As pessoas pedem a tabela de preço e nunca mais respondem.”",
    description:
      "O tráfego existe, as perguntas chegam, mas o dinheiro não entra porque a conversa morre no primeiro valor enviado.",
    movementTitle: "Movimento de condução de conversa:",
    movementRationale:
      "Aplicar postura consultiva com apoio do SOS Copiloto para responder objeções em áudio ou texto sem baixar o valor.",
    durationMinutes: 10,
  },
  {
    id: "sc-4",
    tag: "Cenário 4 · Horários Vagos",
    title: "“Tenho horários disponíveis esta semana e preciso preencher.”",
    description:
      "Você tem vagas na terça ou quinta-feira e não quer ficar ociosa na cadeira esperando alguém adivinhar.",
    movementTitle: "Movimento de ocupação pontual:",
    movementRationale:
      "Divulgação estratégica de 2 vagas específicas sem passar a impressão de agenda vazia ou desespero.",
    durationMinutes: 10,
  },
  {
    id: "sc-5",
    tag: "Cenário 5 · Retenção",
    title: "“Minhas clientes vêm uma vez e depois somem por meses.”",
    description:
      "Você trabalha duro para conseguir uma cliente, ela elogia o serviço, mas você só volta a falar com ela se ela lembrar de procurar.",
    movementTitle: "Movimento de retorno na janela adequada:",
    movementRationale:
      "Acompanhar o tempo de manutenção e reabrir o diálogo no dia ideal com roteiro pronto de WhatsApp.",
    durationMinutes: 10,
  },
];

export const SUPPORT_MODULES: SupportModuleItem[] = [
  {
    id: "growth-coach",
    tag: "Núcleo Principal",
    title: "Growth Coach · Próximo Movimento",
    description:
      "Entende onde seu negócio está travando hoje, quanto tempo você tem e escolhe uma única próxima ação com passo a passo e roteiro pronto.",
    benefit: "Menos opções na cabeça, mais foco e clareza na execução.",
  },
  {
    id: "copilot",
    tag: "Camada de Fechamento",
    title: "SOS Copiloto de Conversas",
    description:
      "A cliente mandou 'achei caro', 'vou ver e te aviso' ou sumiu após o preço? Tenha um ponto de partida em texto e áudio guiado para responder com segurança.",
    benefit: "Postura de especialista para fechar horários sem dar desconto.",
  },
  {
    id: "retention",
    tag: "Camada de Recorrência",
    title: "Radar de Retenção",
    description:
      "Identifica quais clientes estão chegando à janela provável de manutenção (21 a 28 dias) e entrega a mensagem exata para reabrir contato.",
    benefit: "Mais receita recorrente de quem já confia no seu trabalho.",
  },
  {
    id: "diagnostic",
    tag: "Camada de Percepção",
    title: "Diagnóstico de Percepção de Valor",
    description:
      "Responda a perguntas rápidas sobre ritual de chegada, biossegurança e pós-atendimento para descobrir vazamentos de valor e receber pequenas missões práticas.",
    benefit: "Blindagem contra pedidos de desconto e valorização do seu trabalho.",
  },
  {
    id: "booking",
    tag: "Camada de Agendamento",
    title: "Caminho Simples de Booking",
    description:
      "Quando uma pessoa decidir marcar, ofereça um link público limpo e sem atrito para ela escolher serviço e horário.",
    benefit: "Facilidade para a cliente sem exigir aplicativos pesados.",
  },
  {
    id: "progress",
    tag: "Camada de Acompanhamento",
    title: "Progresso & Acompanhamento de Sinais",
    description:
      "Visualize quantas ações você concluiu, quantos interessados surgiram e os agendamentos registrados, recalibrando as próximas decisões do aplicativo.",
    benefit: "A sensação real de estar avançando todo dia como dona do seu negócio.",
  },
];

export const STRATEGIC_FAQS: FaqItem[] = [
  {
    q: "O Agenda 80/20 serve para quem ainda não tem nenhuma cliente?",
    a: "Sim. O sistema possui um motor com protocolos específicos para iniciantes. Ao informar que está na fase inicial e sem clientes, o aplicativo prioriza ações de convite de modelos, montagem de portfólio e primeiros contatos locais, respeitando exatamente a sua realidade.",
  },
  {
    q: "Preciso ser blogueira ou postar dancinhas no Instagram para funcionar?",
    a: "Não. O Agenda 80/20 considera os canais que você de fato tem disponíveis. Se você não gosta ou não quer usar redes sociais, o sistema prioriza movimentos de contato direto no WhatsApp, pessoas próximas, parcerias de vizinhança ou clientes antigas.",
  },
  {
    q: "O aplicativo envia mensagens sozinho para as minhas clientes?",
    a: "Não, e isso é proposital. Ninguém gosta de mensagens robóticas e impessoais. O Agenda 80/20 entrega roteiros prontos — em texto para copiar e em guia de áudio com tempo e tom de voz — para que você envie com a sua própria voz e calor humano no WhatsApp.",
  },
  {
    q: "O Agenda 80/20 é apenas uma agenda de horários?",
    a: "Não. Ele possui um caminho simples de booking público para a cliente escolher serviço e horário, mas seu papel principal é ser um sistema de decisão comercial que diz a você qual é o próximo movimento prático que faz sentido fazer para trazer movimento ao seu negócio.",
  },
  {
    q: "Preciso ter o Belevy obrigatoriamente para usar o Agenda 80/20?",
    a: "Não. O Agenda 80/20 funciona de forma 100% autônoma e completa. O Belevy é uma plataforma parceira de agenda e lembretes automáticos por WhatsApp que oferecemos como cortesia de 30 dias para quem quiser adicionar essa infraestrutura quando a operação crescer.",
  },
  {
    q: "Quanto tempo preciso dedicar por dia?",
    a: "De 2 a 10 minutos. O produto foi projetado especificamente para a rotina de quem atende: você abre no intervalo entre procedimentos, entende uma única ação viável para o seu tempo livre, executa e volta a cuidar do seu dia.",
  },
  {
    q: "Existe mensalidade recorrente?",
    a: "Não. O Plano Anual Completo é um pagamento único de R$ 147 (ou parcelado em até 12x de R$ 15,19 no cartão). Não há renovação surpresa nem mensalidade obrigatória durante os 12 meses de acesso.",
  },
  {
    q: "Como recebo o acesso e como funciona a garantia?",
    a: "Assim que o pagamento for aprovado pela Cakto, você recebe um e-mail com seu link mágico para entrar direto no celular ou computador sem senhas complicadas. Você tem 7 dias corridos de garantia incondicional: se achar que não faz sentido para você, basta solicitar e devolveremos 100% do valor.",
  },
];
