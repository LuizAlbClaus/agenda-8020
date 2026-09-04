export interface DemoPhase {
  id: string;
  label: string;
  badge: string;
  actionTitle: string;
  durationMinutes: number;
  whyNow: string;
  steps: [string, string, string];
  suggestedScript: string;
}

export const DEMO_PHASES: DemoPhase[] = [
  {
    id: "learning",
    label: "Ainda estou aprendendo",
    badge: "Fase 1 · Fundação e Preparação",
    actionTitle: "Comece construindo sua primeira prova real",
    durationMinutes: 10,
    whyNow: "Você está começando agora e ainda não possui trabalhos para mostrar. Registrar sua evolução na técnica gera o primeiro material visual para quando abrir horários.",
    steps: [
      "Escolha 1 técnica ou acabamento do Soft Gel Express que você praticou hoje.",
      "Tire uma foto nítida e bem iluminada do resultado na mão de treino ou em você mesma.",
      "Guarde essa foto em uma pasta no celular para montar sua apresentação inicial.",
    ],
    suggestedScript: "Oi! Comecei uma nova fase aprendendo Soft Gel e em breve vou começar a atender. Quando eu estiver pronta, posso te avisar?",
  },
  {
    id: "practicing",
    label: "Estou praticando",
    badge: "Fase 2 · Validação e Portfólio",
    actionTitle: "Convide 2 a 3 pessoas próximas como modelos",
    durationMinutes: 10,
    whyNow: "Praticar em modelos reais dá velocidade, segurança com a cabine e brocas, e gera fotos autênticas com dedos e cutículas reais.",
    steps: [
      "Selecione 2 amigas ou familiares próximas que gostam de unhas feitas.",
      "Explique que você está aperfeiçoando a técnica de Soft Gel e precisa de modelos para portfólio.",
      "Agende um dia com calma para realizar a aplicação sem pressa.",
    ],
    suggestedScript: "Oi Mi! Tô fazendo uma especialização em Soft Gel e separando 3 modelos para aperfeiçoar meu portfólio essa semana. Quer ser uma delas?",
  },
  {
    id: "seeking_clients",
    label: "Procurando minhas primeiras clientes",
    badge: "Fase 3 · Primeiras Oportunidades",
    actionTitle: "Avise sua rede próxima que sua agenda vai abrir",
    durationMinutes: 10,
    whyNow: "Quem já conhece e confia em você tem 5x mais chances de ser sua primeira cliente do que alguém desconhecido na internet.",
    steps: [
      "Abra sua lista de conversas recentes no WhatsApp.",
      "Identifique 5 pessoas que costumam fazer unhas e com quem você tem bom diálogo.",
      "Envie a mensagem de novidade com carinho e sem pressão de venda.",
    ],
    suggestedScript: "Oi Ju! Passei pra te contar uma novidade: acabei de me especializar em Soft Gel e semana que vem vou abrir alguns horários exclusivos. Se quiser garantir um lugar, me avisa!",
  },
  {
    id: "has_some_clients",
    label: "Já tenho algumas clientes",
    badge: "Fase 4 · Relacionamento e Frequência",
    actionTitle: "Reative quem já foi atendida há mais de 3 semanas",
    durationMinutes: 10,
    whyNow: "Soft Gel precisa de manutenção entre 21 e 28 dias. Convidar a cliente nessa janela exata evita que a unha quebre ou que ela vá a outro salão.",
    steps: [
      "Veja quem você atendeu entre 3 e 4 semanas atrás.",
      "Mande uma mensagem perguntando como está a durabilidade e o crescimento.",
      "Ofereça 2 opções de horário já reservadas para manutenção.",
    ],
    suggestedScript: "Oi Cá! Lembrei de você hoje. Como está sua manutenção? Já estamos no período perfeito pra deixar suas unhas impecáveis. Separei quinta às 14h ou sexta às 10h pra você. Qual prefere?",
  },
  {
    id: "irregular_schedule",
    label: "Minha agenda está irregular",
    badge: "Fase 5 · Agenda Firme e Estabilidade",
    actionTitle: "Crie uma oportunidade direta para os horários vagos",
    durationMinutes: 15,
    whyNow: "Ficar esperando as pessoas lembrarem de marcar deixa buracos na semana. Uma comunicação proativa e orientada a benefício preenche esses espaços.",
    steps: [
      "Identifique os 2 dias mais vazios da sua próxima semana.",
      "Envie um convite especial para quem demonstrou interesse recente mas não confirmou.",
      "Facilite a escolha enviando o link direto de horários disponíveis.",
    ],
    suggestedScript: "Oi Lu! Tava organizando minha grade aqui e lembrei que você queria fazer sua aplicação. Tive uma desistência na quarta às 15h. Consigo segurar pra você se quiser aproveitar!",
  },
];

export interface UpsellFaq {
  question: string;
  answer: string;
}

export const UPSELL_FAQS: UpsellFaq[] = [
  {
    question: "Mas eu ainda nem comecei o curso. O Agenda serve para mim?",
    answer:
      "Sim, com certeza. O Agenda 80/20 considera especificamente os momentos de preparação, prática, montagem de apresentação e criação das primeiras oportunidades. Você não precisa já ser experiente para começar a ter direção.",
  },
  {
    question: "Preciso já ter clientes para usar?",
    answer:
      "Não. Existem caminhos e recomendações desenhados especificamente para quem ainda está aprendendo ou praticando em modelos. Você começa a usar justamente para construir o caminho até suas primeiras clientes.",
  },
  {
    question: "Ele garante clientes?",
    answer:
      "Não. O Agenda 80/20 ajuda você a decidir o próximo movimento e fornece passos e mensagens práticas, mas não controla as respostas das pessoas nem faz falsas promessas de resultado financeiro garantido.",
  },
  {
    question: "Ele envia mensagens automaticamente pelo WhatsApp?",
    answer:
      "Não. O Agenda prepara o texto e o áudio recomendados para cada situação. Você copia com um toque, faz os ajustes que quiser no seu estilo e envia diretamente do seu WhatsApp com total segurança.",
  },
  {
    question: "Preciso usar Instagram obrigatoriamente?",
    answer:
      "Não necessariamente. Para quem está começando, ativar contatos próximos e modelos no WhatsApp gera muito mais resultado imediato do que ficar postando para ninguém ver no feed.",
  },
  {
    question: "É uma agenda tradicional de calendário?",
    answer:
      "Não é apenas um calendário. O coração do Agenda 80/20 é o sistema de recomendação de Próximo Movimento: ele diz exatamente qual ação pequena e prática você deve fazer hoje para movimentar seu serviço.",
  },
  {
    question: "O que é o Belevy e o que acontece após os 30 dias grátis?",
    answer:
      "O Belevy é o sistema de agendamento online com confirmações e lembretes automáticos via WhatsApp (sua recepção automática anti-falta). Ao entrar no Agenda 80/20 hoje, você ganha 30 dias de presente para testar. Se gostar e sua rotina crescer, pode continuar assinando por um valor bem acessível. Se não quiser, não há cobrança surpresa nem cartão preso, e seu acesso anual de 12 meses ao Agenda 80/20 continua ativo normalmente.",
  },
  {
    question: "Existe mensalidade?",
    answer:
      "Não há mensalidade no plano de acesso anual oferecido nesta página. O valor de R$ 147 (ou 12x de R$ 15,19) é um pagamento único que garante 12 meses completos de acesso ao Agenda 80/20.",
  },
];
