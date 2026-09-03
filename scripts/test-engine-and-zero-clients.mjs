// ============================================================================
// Agenda 80/20 — Suite de Testes do Motor de Recomendação & Regras de Negócio
// Arquivo: scripts/test-engine-and-zero-clients.mjs
//
// Validações Cobertas:
// 1. Teste ZERO CLIENTES (Iniciante com opportunity_signals = 'none')
//    - Desbloqueio dos protocolos COLD_01, COLD_02 e COLD_03
//    - Eliminação do erro 'no_eligible_action'
//    - Simulação fiel dos filtros SQL e cálculo de pontuação
// 2. Teste PROFISSIONAL ESTABELECIDA (some_clients / irregular_schedule)
//    - Gargalos 'empty_slots' e 'low_return'
//    - Elegibilidade contextual e ranking por editorial prior + evidence
// 3. Teste PRONTIDÃO COM GAPS (can_serve_next_7_days = false)
//    - Isolamento estrito de ações de fundação (FND_01 a FND_05)
//    - Bloqueio completo de aquisição quando v_has_gap = true
//    - Validação das travas de prontidão (check_readiness_lock)
// 4. Teste CÁLCULO DO IVP & 3 ARQUÉTIPOS
//    - Matriz de 0 a 100 pontos e dimensões analíticas
//    - Classificação dos arquétipos: 'commoditizada', 'diferenciada', 'referencia_premium'
//    - Penalidade calibradora por objeções recorrentes
// 5. Teste SOS COPILOTO (4 Categorias de Objeção)
//    - price_too_high, procrastination, third_party_decision, just_browsing
//    - Scripts duplos (texto e áudio) e roteiros psicológicos
// ============================================================================

// --- CORES ANSI PARA FORMATAÇÃO NO TERMINAL ---
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function header(title) {
  console.log(`\n${colors.bright}${colors.blue}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}══════════════════════════════════════════════════════════════════════${colors.reset}`);
}

function subheader(title) {
  console.log(`\n${colors.bright}${colors.yellow}─── [SUITE] ${title} ───${colors.reset}`);
}

let totalAssertions = 0;
let passedAssertions = 0;

function verify(condition, message, details = "") {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${message} ${details ? colors.dim + "(" + details + ")" + colors.reset : ""}`);
  } else {
    console.error(`  ${colors.red}✖ FAIL${colors.reset} ${message} ${details ? "(" + details + ")" : ""}`);
    throw new Error(`Falha na asserção: ${message}`);
  }
}

// ============================================================================
// 1. CATÁLOGOS CANÔNICOS EXTRAÍDOS DAS MIGRATIONS
// ============================================================================

const ACTION_PROTOCOLS = [
  // Foundation (Fase 2)
  { slug: "FND_01_CONFIRM_AVAILABILITY", action_type: "foundation", category: "foundation" },
  { slug: "FND_02_BOOKING_PATH", action_type: "foundation", category: "foundation" },
  { slug: "FND_03_FIRST_MODEL", action_type: "foundation", category: "foundation" },
  { slug: "FND_04_REAL_PORTFOLIO", action_type: "foundation", category: "foundation" },
  { slug: "FND_05_CLEAR_SERVICE", action_type: "foundation", category: "foundation" },

  // Acquisition Legado (Fases 2, 7)
  { slug: "CONV_01_PRICE_REOPEN", action_type: "acquisition", category: "conversations" },
  { slug: "CONV_02_PAUSED_CONVERSATION", action_type: "acquisition", category: "conversations" },
  { slug: "CONV_03_TWO_REAL_SLOTS", action_type: "acquisition", category: "conversations" },
  { slug: "CONV_04_OBJECTION", action_type: "acquisition", category: "conversations" },
  { slug: "REACT_01_PREVIOUS_CLIENT", action_type: "acquisition", category: "return" },
  { slug: "RETURN_01_NEXT_VISIT", action_type: "acquisition", category: "return" },
  { slug: "REF_01_ASK_REFERRAL", action_type: "acquisition", category: "referral" },
  { slug: "PROOF_01_REQUEST_REVIEW", action_type: "acquisition", category: "proof" },
  { slug: "PROOF_02_SHARE_PROOF", action_type: "acquisition", category: "proof" },
  { slug: "AVAIL_01_REAL_SLOT", action_type: "acquisition", category: "availability" },
  { slug: "LOCAL_01_EXISTING_DEMAND", action_type: "acquisition", category: "local" },
  { slug: "LOCAL_02_WARM_NETWORK", action_type: "acquisition", category: "local" },
  { slug: "PARTNER_01_COMPLEMENTARY_BUSINESS", action_type: "acquisition", category: "partnership" },

  // Novos Protocolos de Aquisição Fria / Zero Clientes (Migration 20260903000000)
  { slug: "COLD_01_CLOSE_CIRCLES", action_type: "acquisition", category: "conversations" },
  { slug: "COLD_02_LOCAL_SHOWCASE", action_type: "acquisition", category: "local" },
  { slug: "COLD_03_PORTFOLIO_LAUNCH", action_type: "acquisition", category: "conversations" },
];

const ACTION_VERSIONS = [
  // Foundation
  {
    slug: "FND_01_CONFIRM_AVAILABILITY",
    title: "Defina quando consegue atender",
    action_type: "foundation",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: [],
    required_channels: [],
    requirements: { needs_can_serve_next_7_days: true },
    duration_minutes: 5,
    cooldown_hours: 24,
    editorial_prior: 0.95,
  },
  {
    slug: "FND_02_BOOKING_PATH",
    title: "Deixe claro por onde marcar",
    action_type: "foundation",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: [],
    required_channels: [],
    requirements: { needs_has_booking_path: true },
    duration_minutes: 5,
    cooldown_hours: 24,
    editorial_prior: 0.94,
  },
  {
    slug: "FND_03_FIRST_MODEL",
    title: "Consiga uma primeira oportunidade",
    action_type: "foundation",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["starting"],
    eligible_bottlenecks: ["first_clients"],
    required_channels: ["existing_clients", "local_network"],
    requirements: {},
    duration_minutes: 15,
    cooldown_hours: 72,
    editorial_prior: 0.86,
  },
  {
    slug: "FND_04_REAL_PORTFOLIO",
    title: "Separe três fotos reais",
    action_type: "foundation",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: [],
    required_channels: [],
    requirements: { needs_has_real_portfolio: true },
    duration_minutes: 10,
    cooldown_hours: 24,
    editorial_prior: 0.93,
  },
  {
    slug: "FND_05_CLEAR_SERVICE",
    title: "Deixe seu serviço claro",
    action_type: "foundation",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: [],
    required_channels: [],
    requirements: {},
    duration_minutes: 5,
    cooldown_hours: 24,
    editorial_prior: 0.88,
  },

  // Acquisition Legacy
  {
    slug: "CONV_01_PRICE_REOPEN",
    title: "Retome quem perguntou o preço",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: ["low_conversion"],
    required_channels: ["whatsapp", "existing_clients"],
    requirements: { requires_context_signal: true },
    signal_required: "price_question",
    duration_minutes: 5,
    cooldown_hours: 72,
    editorial_prior: 0.92,
  },
  {
    slug: "CONV_02_PAUSED_CONVERSATION",
    title: "Retome uma conversa legítima",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: ["low_conversion", "first_clients"],
    required_channels: ["whatsapp", "existing_clients"],
    requirements: { requires_context_signal: true },
    signal_required: "conversation_paused",
    duration_minutes: 5,
    cooldown_hours: 72,
    editorial_prior: 0.90,
  },
  {
    slug: "CONV_03_TWO_REAL_SLOTS",
    title: "Ofereça duas opções reais",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["low_conversion", "empty_slots"],
    required_channels: ["whatsapp", "existing_clients"],
    requirements: { requires_context_signal: true },
    signal_required: "price_question",
    duration_minutes: 5,
    cooldown_hours: 48,
    editorial_prior: 0.90,
  },
  {
    slug: "CONV_04_OBJECTION",
    title: "Responda uma dúvida concreta",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: ["low_conversion"],
    required_channels: ["whatsapp", "existing_clients"],
    requirements: { requires_context_signal: true },
    signal_required: "objection_raised",
    duration_minutes: 5,
    cooldown_hours: 72,
    editorial_prior: 0.88,
  },
  {
    slug: "REACT_01_PREVIOUS_CLIENT",
    title: "Convide uma cliente anterior",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["low_return"],
    required_channels: ["existing_clients", "whatsapp"],
    requirements: { requires_context_signal: true },
    signal_required: "previous_client",
    duration_minutes: 5,
    cooldown_hours: 168,
    editorial_prior: 0.86,
  },
  {
    slug: "RETURN_01_NEXT_VISIT",
    title: "Encaminhe o próximo atendimento",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["low_return"],
    required_channels: ["existing_clients", "whatsapp"],
    requirements: { requires_context_signal: true },
    signal_required: "positive_experience",
    duration_minutes: 5,
    cooldown_hours: 168,
    editorial_prior: 0.84,
  },
  {
    slug: "REF_01_ASK_REFERRAL",
    title: "Peça uma indicação",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["low_visibility", "first_clients"],
    required_channels: ["existing_clients", "whatsapp"],
    requirements: { requires_context_signal: true },
    signal_required: "referral_permission",
    duration_minutes: 5,
    cooldown_hours: 168,
    editorial_prior: 0.80,
  },
  {
    slug: "AVAIL_01_REAL_SLOT",
    title: "Divulgue um horário real",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["empty_slots", "low_visibility"],
    required_channels: ["instagram", "whatsapp", "local_network"],
    requirements: {},
    duration_minutes: 10,
    cooldown_hours: 48,
    editorial_prior: 0.86,
  },
  {
    slug: "PROOF_02_SHARE_PROOF",
    title: "Mostre uma prova autorizada",
    action_type: "acquisition",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: [],
    eligible_bottlenecks: ["low_visibility"],
    required_channels: ["instagram", "whatsapp", "local_network"],
    requirements: {},
    duration_minutes: 10,
    cooldown_hours: 72,
    editorial_prior: 0.80,
  },

  // 3 NOVOS PROTOCOLOS DE AQUISIÇÃO FRIA (Migration 20260903000000)
  {
    slug: "COLD_01_CLOSE_CIRCLES",
    title: "Convide 3 pessoas próximas para modelo",
    short_description: "Convide 3 pessoas do seu convívio para servirem de modelo com data marcada.",
    action_type: "acquisition",
    category: "conversations",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["starting", "some_clients"],
    eligible_bottlenecks: ["first_clients", "low_visibility"],
    required_channels: ["whatsapp", "existing_clients", "local_network"],
    requirements: { requires_context_signal: false },
    duration_minutes: 10,
    cooldown_hours: 48,
    editorial_prior: 0.95,
    ethical_guardrail: "Convide com carinho e transparência sobre o valor de modelo ou custo de material, sem pressão.",
  },
  {
    slug: "COLD_02_LOCAL_SHOWCASE",
    title: "Proponha uma parceria de cortesia local",
    short_description: "Apresente seu serviço em um comércio complementar da sua rua ou bairro.",
    action_type: "acquisition",
    category: "local",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["starting", "some_clients"],
    eligible_bottlenecks: ["first_clients", "low_visibility"],
    required_channels: ["partnerships", "local_network", "whatsapp"],
    requirements: { requires_context_signal: false },
    duration_minutes: 15,
    cooldown_hours: 72,
    editorial_prior: 0.90,
    ethical_guardrail: "Proponha uma troca respeitosa que valorize as clientes do comércio parceiro, sem insistência.",
  },
  {
    slug: "COLD_03_PORTFOLIO_LAUNCH",
    title: "Avise sua rede sobre abertura de agenda",
    short_description: "Comunique seus horários nas suas redes pessoais com condição de inauguração.",
    action_type: "acquisition",
    category: "conversations",
    eligible_professions: ["nail_design", "all_services"],
    eligible_stages: ["starting", "some_clients", "irregular_schedule"],
    eligible_bottlenecks: ["first_clients", "low_visibility", "empty_slots"],
    required_channels: ["instagram", "whatsapp"],
    requirements: { requires_context_signal: false },
    duration_minutes: 10,
    cooldown_hours: 48,
    editorial_prior: 0.92,
    ethical_guardrail: "Não anuncie escassez mentirosa. Informe com clareza a disponibilidade real.",
  },
];

// ============================================================================
// 2. SIMULADOR DO MOTOR DE RECOMENDAÇÃO SQL (generate_next_recommendation)
// ============================================================================

const DEFAULT_POLICY = {
  score_weights: {
    fit: 35,
    channel: 20,
    prior: 15,
    evidence: 15,
    exploration: 10,
    viability: 5,
  },
  prior_weight: 8,
  recency_half_life_days: 60,
  daily_limits: { 10: 1, 20: 2, 30: 3, 45: 3 },
  exploration_rate: 0,
};

function hasChannelOverlap(userChannels, actionChannels) {
  if (!actionChannels || actionChannels.length === 0) return true;
  return actionChannels.some((c) => userChannels.includes(c));
}

function simulateRecommendationEngine(profile, context, options = {}) {
  const {
    includeColdProtocols = true,
    priorRecommendations = [],
    policy = DEFAULT_POLICY,
  } = options;

  // Pool de ações ativas
  const activeActions = ACTION_VERSIONS.filter((av) => {
    if (!includeColdProtocols && av.slug.startsWith("COLD_")) return false;
    return true;
  });

  // 1. Verificação de Gap de Prontidão (v_has_gap)
  const v_has_gap = !(
    profile.can_serve_next_7_days &&
    profile.has_real_portfolio &&
    profile.has_booking_path
  );

  // 2. Filtragem de Elegibilidade Rígida (Filtros WHERE no SQL)
  const eligibleActions = activeActions.filter((av) => {
    // Profissão
    const professionMatch =
      av.eligible_professions.includes(profile.profession) ||
      av.eligible_professions.includes("all_services");
    if (!professionMatch) return false;

    // Estágio
    const stageMatch =
      av.eligible_stages.length === 0 ||
      av.eligible_stages.includes(profile.stage);
    if (!stageMatch) return false;

    // Gargalo
    const bottleneckMatch =
      av.eligible_bottlenecks.length === 0 ||
      av.eligible_bottlenecks.includes(profile.current_bottleneck);
    if (!bottleneckMatch) return false;

    // Canais
    const channelMatch =
      av.required_channels.length === 0 ||
      hasChannelOverlap(profile.channels, av.required_channels);
    if (!channelMatch) return false;

    // Duração diária
    if (av.duration_minutes > profile.daily_available_minutes) return false;

    // Regra da Prontidão:
    // ((ap.action_type='foundation' and v_has_gap) or (ap.action_type='acquisition' and not v_has_gap))
    if (v_has_gap && av.action_type !== "foundation") return false;
    if (!v_has_gap && av.action_type !== "acquisition") return false;

    // Pré-requisitos de Gaps Individuais
    if (av.requirements?.needs_can_serve_next_7_days && profile.can_serve_next_7_days)
      return false;
    if (av.requirements?.needs_has_real_portfolio && profile.has_real_portfolio)
      return false;
    if (av.requirements?.needs_has_booking_path && profile.has_booking_path)
      return false;

    // Trava de Sinal de Oportunidade
    const requiresSignal = av.requirements?.requires_context_signal === true;
    if (requiresSignal) {
      const userSignals = context.opportunity_signals || [];
      const hasMatchingSignal = av.signal_required
        ? userSignals.includes(av.signal_required)
        : false;
      if (!hasMatchingSignal) return false;
    }

    // Cooldown
    const inCooldown = priorRecommendations.some((r) => {
      if (r.slug === av.slug && r.hoursAgo < av.cooldown_hours) return true;
      return false;
    });
    if (inCooldown) return false;

    return true;
  });

  if (eligibleActions.length === 0) {
    return {
      status: "no_eligible_action",
      message: "Não conseguimos encontrar uma ação possível agora. Vamos ajustar seu plano.",
      v_has_gap,
      eligibleCount: 0,
      rankedActions: [],
    };
  }

  // 3. Cálculo de Pontuação Matemática (ORDER BY no SQL)
  const ranked = eligibleActions.map((av) => {
    // Fit
    let v_fit = 0;
    if (av.eligible_stages.includes(profile.stage)) v_fit += 20;
    if (av.eligible_bottlenecks.includes(profile.current_bottleneck)) v_fit += 15;

    // Channel
    const v_channel =
      av.required_channels.length === 0 ||
      hasChannelOverlap(profile.channels, av.required_channels)
        ? 20
        : 0;

    // Prior editorial
    const v_prior = av.editorial_prior * (policy.score_weights.prior ?? 15);

    // Evidência Bayesiana posterior (sem observações anteriores, posterior = prior)
    const posterior = av.editorial_prior;
    const v_evidence =
      av.action_type === "acquisition"
        ? posterior * (policy.score_weights.evidence ?? 15)
        : 0;

    // Viabilidade
    const v_viability = policy.score_weights.viability ?? 5;

    // Score total
    const totalScore =
      (v_fit * (policy.score_weights.fit ?? 35)) / 35 +
      (v_channel * (policy.score_weights.channel ?? 20)) / 20 +
      v_prior +
      v_evidence +
      v_viability;

    return {
      ...av,
      score: Number(totalScore.toFixed(2)),
      components: {
        fit: v_fit,
        channel: v_channel,
        prior: Number(v_prior.toFixed(2)),
        evidence: Number(v_evidence.toFixed(2)),
        viability: v_viability,
      },
    };
  });

  ranked.sort((a, b) => b.score - a.score || b.editorial_prior - a.editorial_prior);

  const bestAction = ranked[0];

  // Renderização da mensagem why_now
  let why_now = "Esta é a próxima ação mais simples para o seu momento.";
  if (v_has_gap) {
    why_now = "Vamos preparar o básico para a próxima ação ficar possível.";
  } else {
    switch (profile.current_bottleneck) {
      case "first_clients":
        why_now =
          "Você está começando e precisa de primeiras clientes. Esta ação abre portas e cria oportunidades reais para o seu momento.";
        break;
      case "low_visibility":
        why_now =
          "Pouca gente conhece seu trabalho. Esta ação ajuda a colocar seu serviço diante de pessoas próximas.";
        break;
      case "low_conversion":
        why_now =
          "Você contou que algumas pessoas perguntam, mas muitas não marcam. Vale começar por uma conversa que já existe.";
        break;
      case "empty_slots":
        why_now =
          "Você já atende, mas ainda ficam horários vazios. Esta ação ajuda a mostrar uma disponibilidade real.";
        break;
      case "low_return":
        why_now =
          "Você quer fazer suas clientes voltarem mais. Esta ação retoma uma relação que já existe.";
        break;
    }
  }

  return {
    status: "created",
    v_has_gap,
    eligibleCount: ranked.length,
    recommendation: bestAction,
    why_now,
    rankedActions: ranked,
  };
}

// ============================================================================
// 3. SIMULADOR DO DIAGNÓSTICO DE VALOR (IVP & 3 ARQUÉTIPOS)
// ============================================================================

const DIAGNOSTIC_QUESTIONS = [
  {
    id: "q1_showcase",
    slug: "showcase_first_touch",
    dimension: "positioning_showcase",
    title: "O que a cliente encontra logo de cara?",
    options: [
      { id: "price_flyer", points: 5, leak_flag: "showcase_commodity" },
      { id: "noisy_feed", points: 15, leak_flag: "showcase_commodity" },
      { id: "transformation_showcase", points: 35, leak_flag: null },
    ],
  },
  {
    id: "q2_climax",
    slug: "climax_mirror_ritual",
    dimension: "service_climax_ritual",
    title: "Ritual no momento de ver o resultado?",
    options: [
      { id: "rushed_hand_mirror", points: 5, leak_flag: "climax_rushed" },
      { id: "polite_compliment_only", points: 15, leak_flag: "climax_rushed" },
      { id: "mirror_ceremony", points: 35, leak_flag: null },
    ],
  },
  {
    id: "q3_physical",
    slug: "physical_tangibility_takeaway",
    dimension: "physical_tangibility",
    title: "O que ela leva fisicamente nas mãos?",
    options: [
      { id: "zero_physical", points: 5, leak_flag: "intangible_vacuum" },
      { id: "whatsapp_only", points: 12, leak_flag: "intangible_vacuum" },
      { id: "vip_envelope_and_gift", points: 30, leak_flag: null },
    ],
  },
];

function calculateValueDiagnosticEngine(answers, options = {}) {
  const { recentPriceObjections = 0 } = options;

  let totalScore = 0;
  const dimensionalScores = {
    positioning_showcase: 0,
    service_climax_ritual: 0,
    physical_tangibility: 0,
  };
  let primaryLeak = "showcase_commodity";

  for (const ans of answers) {
    const q = DIAGNOSTIC_QUESTIONS.find((item) => item.id === ans.question_id);
    if (!q) continue;

    const opt = q.options.find((o) => o.id === ans.option_id);
    if (!opt) continue;

    totalScore += opt.points;
    dimensionalScores[q.dimension] += opt.points;

    if (opt.leak_flag) {
      primaryLeak = opt.leak_flag;
    }
  }

  // Fator calibrador por telemetria de objeções 'Achei Caro' (3+ nos últimos 14 dias)
  if (recentPriceObjections >= 3) {
    totalScore = Math.max(5, totalScore - 5);
  }
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Classificação do Arquétipo DB Enum e Mapeamento dos 3 Arquétipos de Negócio:
  // - 0 a 35 pts: 'price_prisoner' -> 'commoditizada'
  // - 36 a 85 pts: 'hidden_artisan' / 'polishing_specialist' -> 'diferenciada'
  // - 86 a 100 pts: 'premium_brand' -> 'referencia_premium'
  let dbArchetype = "price_prisoner";
  let businessArchetype = "commoditizada";
  let headline = "";
  let playbookSlug = "playbook_48h_decommoditize";

  if (totalScore <= 35) {
    dbArchetype = "price_prisoner";
    businessArchetype = "commoditizada";
    headline = 'O Efeito "Serviço Invisível": Você entrega ouro, mas a vitrine parece bijuteria';
    playbookSlug = "playbook_48h_decommoditize";
  } else if (totalScore <= 65) {
    dbArchetype = "hidden_artisan";
    businessArchetype = "diferenciada";
    headline = "A Artesã Oculta: Seu talento é impecável, mas o pós-serviço evapora rápido demais";
    playbookSlug = "playbook_48h_aftercare_tangible";
  } else if (totalScore <= 85) {
    dbArchetype = "polishing_specialist";
    businessArchetype = "diferenciada";
    headline = "Especialista em Lapidação: Você está a 3 ajustes de entrar no Top 10% da sua região";
    playbookSlug = "playbook_48h_top10_polish";
  } else {
    dbArchetype = "premium_brand";
    businessArchetype = "referencia_premium";
    headline = "Marca de Alto Padrão: Seu valor percebido está plenamente instalado";
    playbookSlug = "playbook_48h_premium_scaling";
  }

  return {
    ivp_score: totalScore,
    db_archetype: dbArchetype,
    business_archetype: businessArchetype,
    primary_leak: primaryLeak,
    dimensional_scores: dimensionalScores,
    headline,
    playbook_slug: playbookSlug,
  };
}

// ============================================================================
// 4. SIMULADOR DO SOS COPILOTO (4 Categorias de Objeção)
// ============================================================================

const COPILOT_TEMPLATES = [
  {
    slug: "OBJ_PRICE_DIRECT",
    objection_category: "price_too_high",
    title: "Desarmar Preço com Valor Direto",
    client_subtext: '"Achei que fosse mais em conta. Não sei se posso pagar agora."',
    script_text:
      "Te entendo perfeitamente! O valor reflete o material que uso, que dura muito mais sem danificar sua saúde/unha. Mas para você conhecer meu trabalho, consigo te encaixar em um horário promocional de primeira visita nesta quinta às 15h. Faz sentido para você?",
    script_audio:
      "[Tom acolhedor e seguro] Oi, tudo bem? Olha, super entendo sua preocupação com o valor! O que acontece é que eu trabalho com produtos selecionados que não agridem e duram muito mais tempo...",
    audio_duration_seconds: 28,
    approach_type: "direct",
    active: true,
  },
  {
    slug: "OBJ_PRICE_DOWNSELL",
    objection_category: "price_too_high",
    title: "Opção Acessível (Downsell Educado)",
    client_subtext: '"Ficou acima do que planejei gastar."',
    script_text:
      "Super compreensível! Se o procedimento completo não cabe no momento, podemos fazer a versão essencial que resolve super bem e cabe no seu orçamento hoje. Quer que eu te passe os horários dessa opção?",
    script_audio:
      "[Tom parceiro e empático] Oi, tudo bom? Super compreensível! Olha só, se o pacote completo não cabe no seu orçamento agora, a gente tem a opção básica...",
    audio_duration_seconds: 22,
    approach_type: "downsell",
    active: true,
  },
  {
    slug: "OBJ_PROCRASTINATION_SLOT",
    objection_category: "procrastination",
    title: 'Conduzir o "Vou ver e te aviso"',
    client_subtext: '"Vou ver minha agenda e qualquer coisa te chamo."',
    script_text:
      "Super tranquila! Minha agenda dessa semana está quase fechada, então posso deixar pré-reservado para você até o final da tarde para você não perder o horário. Prefere quinta às 16h ou sexta às 10h?",
    script_audio:
      "[Tom leve e descontraído] Perfeito, sem problema nenhum! Só te aviso porque os horários de fim de semana costumam voar rapidinho...",
    audio_duration_seconds: 20,
    approach_type: "consultative",
    active: true,
  },
  {
    slug: "OBJ_THIRD_PARTY",
    objection_category: "third_party_decision",
    title: 'Decisão Compartilhada ("Ver com Marido/Esposa")',
    client_subtext: '"Preciso ver com meu marido antes de marcar."',
    script_text:
      "Claro, conversa com ele sim! Muitas clientes minhas fazem isso. Se ajudar, me diz qual período fica melhor para você (manhã ou tarde) que já separo as duas melhores opções para quando vocês conversarem.",
    script_audio:
      "[Tom simpático e compreensivo] Ah, com certeza! Conversa com calma sim! [Risos leves] Para facilitar para você, que turno você prefere?",
    audio_duration_seconds: 18,
    approach_type: "consultative",
    active: true,
  },
  {
    slug: "OBJ_JUST_BROWSING",
    objection_category: "just_browsing",
    title: 'Curiosa de Balcão ("Só o preço")',
    client_subtext: '"Quanto custa?"',
    script_text:
      "Oi! O valor do procedimento é R$ [PRECO], já incluindo todo o cuidado inicial e o acabamento duradouro. Você já faz esse tipo de procedimento ou seria sua primeira vez?",
    script_audio:
      "[Tom simpático e acolhedor] Olá, que ótimo falar com você! Nosso procedimento completo fica em R$ [PRECO], e já inclui toda a preparação...",
    audio_duration_seconds: 19,
    approach_type: "consultative",
    active: true,
  },
];

// ============================================================================
// SUÍTES DE TESTES E EXECUÇÃO DETALHADA
// ============================================================================

header("AGENDA 80/20 — VALIDAÇÃO MATEMÁTICA E LÓGICA DO MOTOR DE RECOMENDAÇÃO");

// ----------------------------------------------------------------------------
// SUITE 1: TESTE DO ZERO CLIENTES (Iniciante sem clientes e sem sinais)
// ----------------------------------------------------------------------------
subheader("SUITE 1: TESTE DO ZERO CLIENTES (Cold Outreach & 'no_eligible_action')");

console.log(`${colors.dim}Cenário: Profissional iniciante, pronta para atender, portfólio real pronto, link pronto, gargalo = 'first_clients', opportunity_signals = ['none'].${colors.reset}`);

const profileZeroClients = {
  profession: "nail_design",
  stage: "starting",
  current_bottleneck: "first_clients",
  channels: ["whatsapp", "existing_clients", "local_network", "instagram"],
  daily_available_minutes: 30,
  can_serve_next_7_days: true,
  has_real_portfolio: true,
  has_booking_path: true,
};

const contextZeroClients = {
  opportunity_signals: ["none"],
};

// Teste 1.1: Demonstração da falha histórica sem os protocolos frios (Pre-Migration 20260903)
console.log(`\n  ${colors.yellow}► Subteste 1.1: Simulação Pre-Fix (Sem COLD_01/02/03 com sinal 'none')${colors.reset}`);
const preFixResult = simulateRecommendationEngine(profileZeroClients, contextZeroClients, {
  includeColdProtocols: false,
});
verify(
  preFixResult.status === "no_eligible_action",
  "Sem protocolos frios, o motor falha com 'no_eligible_action' devido à trava de sinal nos protocolos anteriores.",
  `eligibleCount=${preFixResult.eligibleCount}`
);
verify(
  preFixResult.v_has_gap === false,
  "A profissional não possui gap de prontidão (v_has_gap = false).",
  "can_serve=true, portfolio=true, booking=true"
);

// Teste 1.2: Simulação Post-Migration 20260903 (Com COLD_01/02/03 ativos)
console.log(`\n  ${colors.yellow}► Subteste 1.2: Simulação Post-Fix (Com Migration 20260903000000)${colors.reset}`);
const postFixResult = simulateRecommendationEngine(profileZeroClients, contextZeroClients, {
  includeColdProtocols: true,
});

verify(
  postFixResult.status === "created",
  "Com a migration, o status da recomendação gerada é 'created' (desbloqueio total).",
  `status=${postFixResult.status}`
);
verify(
  postFixResult.eligibleCount >= 3,
  "Pelo menos 3 protocolos de aquisição fria são perfeitamente elegíveis.",
  `eligibleCount=${postFixResult.eligibleCount}`
);

const eligibleSlugs = postFixResult.rankedActions.map((a) => a.slug);
verify(
  eligibleSlugs.includes("COLD_01_CLOSE_CIRCLES") &&
    eligibleSlugs.includes("COLD_02_LOCAL_SHOWCASE") &&
    eligibleSlugs.includes("COLD_03_PORTFOLIO_LAUNCH"),
  "Os três protocolos COLD_01, COLD_02 e COLD_03 constam na lista de ações elegíveis.",
  eligibleSlugs.join(", ")
);

// Validação matemática do ranking
const cold01 = postFixResult.rankedActions.find((a) => a.slug === "COLD_01_CLOSE_CIRCLES");
const cold02 = postFixResult.rankedActions.find((a) => a.slug === "COLD_02_LOCAL_SHOWCASE");
const cold03 = postFixResult.rankedActions.find((a) => a.slug === "COLD_03_PORTFOLIO_LAUNCH");

console.log(`\n  ${colors.cyan}Pontuações Matemáticas Calculadas:${colors.reset}`);
console.log(`    1. ${cold01.slug}: Score = ${cold01.score} (Fit=35, Ch=20, Prior=${cold01.components.prior}, Evid=${cold01.components.evidence}, Viab=5)`);
console.log(`    2. ${cold03.slug}: Score = ${cold03.score} (Fit=35, Ch=20, Prior=${cold03.components.prior}, Evid=${cold03.components.evidence}, Viab=5)`);
console.log(`    3. ${cold02.slug}: Score = ${cold02.score} (Fit=35, Ch=20, Prior=${cold02.components.prior}, Evid=${cold02.components.evidence}, Viab=5)`);

verify(
  postFixResult.recommendation.slug === "COLD_01_CLOSE_CIRCLES",
  "COLD_01_CLOSE_CIRCLES vence como 1ª recomendação por ter o maior editorial_prior (0.95 vs 0.92 vs 0.90).",
  `Vencedora: ${postFixResult.recommendation.slug} (Score ${postFixResult.recommendation.score})`
);
verify(
  cold01.score === 88.5,
  "Cálculo exato de pontuação de COLD_01 bate com fórmula SQL (88.50 pts).",
  `Score real: ${cold01.score}`
);
verify(
  cold03.score === 87.6,
  "Cálculo exato de pontuação de COLD_03 bate com fórmula SQL (87.60 pts).",
  `Score real: ${cold03.score}`
);
verify(
  cold02.score === 87.0,
  "Cálculo exato de pontuação de COLD_02 bate com fórmula SQL (87.00 pts).",
  `Score real: ${cold02.score}`
);

// Validação da mensagem empática renderizada
verify(
  postFixResult.why_now.includes("primeiras clientes"),
  "A mensagem why_now acolhe a iniciante com copy específica para 'first_clients'.",
  `why_now: "${postFixResult.why_now}"`
);

// Teste 1.3: Rotação e Cooldown
console.log(`\n  ${colors.yellow}► Subteste 1.3: Rotação sob Cooldown (COLD_01 feito há 12h)${colors.reset}`);
const cooldownResult = simulateRecommendationEngine(profileZeroClients, contextZeroClients, {
  includeColdProtocols: true,
  priorRecommendations: [{ slug: "COLD_01_CLOSE_CIRCLES", hoursAgo: 12 }],
});
verify(
  cooldownResult.recommendation.slug === "COLD_03_PORTFOLIO_LAUNCH",
  "Sob cooldown de COLD_01 (48h), o motor recomenda COLD_03_PORTFOLIO_LAUNCH como 2ª opção.",
  `Nova recomendação: ${cooldownResult.recommendation.slug} (Score ${cooldownResult.recommendation.score})`
);

// Teste 1.4: Rotação sob Cooldown Duplo
console.log(`\n  ${colors.yellow}► Subteste 1.4: Rotação sob Cooldown de COLD_01 e COLD_03${colors.reset}`);
const cooldownDoubleResult = simulateRecommendationEngine(profileZeroClients, contextZeroClients, {
  includeColdProtocols: true,
  priorRecommendations: [
    { slug: "COLD_01_CLOSE_CIRCLES", hoursAgo: 12 },
    { slug: "COLD_03_PORTFOLIO_LAUNCH", hoursAgo: 6 },
  ],
});
verify(
  cooldownDoubleResult.recommendation.slug === "COLD_02_LOCAL_SHOWCASE",
  "Sob cooldown de COLD_01 e COLD_03, o motor recomenda COLD_02_LOCAL_SHOWCASE como 3ª opção.",
  `Nova recomendação: ${cooldownDoubleResult.recommendation.slug} (Score ${cooldownDoubleResult.recommendation.score})`
);

// ----------------------------------------------------------------------------
// SUITE 2: TESTE DA PROFISSIONAL ESTABELECIDA (some_clients / irregular_schedule)
// ----------------------------------------------------------------------------
subheader("SUITE 2: TESTE DA PROFISSIONAL ESTABELECIDA (empty_slots & low_return)");

// Teste 2.1: Estágio some_clients com gargalo empty_slots (Horários Vazios)
console.log(`\n  ${colors.yellow}► Subteste 2.1: some_clients com empty_slots e sinal 'none'${colors.reset}`);
const profileEstablishedEmptySlots = {
  profession: "nail_design",
  stage: "some_clients",
  current_bottleneck: "empty_slots",
  channels: ["whatsapp", "instagram"],
  daily_available_minutes: 30,
  can_serve_next_7_days: true,
  has_real_portfolio: true,
  has_booking_path: true,
};

const resultEstablishedSlots = simulateRecommendationEngine(
  profileEstablishedEmptySlots,
  { opportunity_signals: ["none"] }
);

verify(
  resultEstablishedSlots.status === "created",
  "Profissional com horários vazios recebe recomendação ativa sem erro.",
  `status=${resultEstablishedSlots.status}`
);
const establishedSlugs = resultEstablishedSlots.rankedActions.map((a) => a.slug);
verify(
  establishedSlugs.includes("AVAIL_01_REAL_SLOT") &&
    establishedSlugs.includes("COLD_03_PORTFOLIO_LAUNCH"),
  "AVAIL_01_REAL_SLOT e COLD_03_PORTFOLIO_LAUNCH são elegíveis para preenchimento de horários.",
  establishedSlugs.join(", ")
);
verify(
  resultEstablishedSlots.why_now.includes("horários vazios"),
  "Mensagem why_now reflete com precisão o momento de horários vazios.",
  `why_now: "${resultEstablishedSlots.why_now}"`
);

// Teste 2.2: Estágio some_clients com sinal price_question -> CONV_03 torna-se elegível
console.log(`\n  ${colors.yellow}► Subteste 2.2: some_clients com sinal 'price_question'${colors.reset}`);
const resultWithPriceQuestion = simulateRecommendationEngine(
  profileEstablishedEmptySlots,
  { opportunity_signals: ["price_question"] }
);
const slugsWithPriceQ = resultWithPriceQuestion.rankedActions.map((a) => a.slug);
verify(
  slugsWithPriceQ.includes("CONV_03_TWO_REAL_SLOTS"),
  "CONV_03_TWO_REAL_SLOTS torna-se perfeitamente elegível ao receber o sinal 'price_question'.",
  slugsWithPriceQ.join(", ")
);

// Teste 2.3: Estágio irregular_schedule com gargalo low_return (Retenção e Volta)
console.log(`\n  ${colors.yellow}► Subteste 2.3: irregular_schedule com low_return e sinal 'previous_client'${colors.reset}`);
const profileEstablishedLowReturn = {
  profession: "nail_design",
  stage: "irregular_schedule",
  current_bottleneck: "low_return",
  channels: ["whatsapp", "existing_clients"],
  daily_available_minutes: 20,
  can_serve_next_7_days: true,
  has_real_portfolio: true,
  has_booking_path: true,
};

const resultLowReturn = simulateRecommendationEngine(
  profileEstablishedLowReturn,
  { opportunity_signals: ["previous_client"] }
);

verify(
  resultLowReturn.status === "created",
  "Profissional com gargalo de retorno e sinal de cliente anterior recebe recomendação ativa.",
  `status=${resultLowReturn.status}`
);
verify(
  resultLowReturn.recommendation.slug === "REACT_01_PREVIOUS_CLIENT",
  "REACT_01_PREVIOUS_CLIENT é a recomendação vencedora para reativação de clientes anteriores.",
  `Vencedora: ${resultLowReturn.recommendation.slug} (Score ${resultLowReturn.recommendation.score})`
);
verify(
  resultLowReturn.why_now.includes("clientes voltarem mais"),
  "Mensagem why_now reflete foco em fidelização e reativação.",
  `why_now: "${resultLowReturn.why_now}"`
);

// Teste 2.4: irregular_schedule com sinal 'positive_experience' -> RETURN_01
console.log(`\n  ${colors.yellow}► Subteste 2.4: irregular_schedule com low_return e sinal 'positive_experience'${colors.reset}`);
const resultReturnNextVisit = simulateRecommendationEngine(
  profileEstablishedLowReturn,
  { opportunity_signals: ["positive_experience"] }
);
verify(
  resultReturnNextVisit.recommendation.slug === "RETURN_01_NEXT_VISIT",
  "RETURN_01_NEXT_VISIT vence quando o sinal é experiência positiva recente.",
  `Vencedora: ${resultReturnNextVisit.recommendation.slug}`
);

// ----------------------------------------------------------------------------
// SUITE 3: TESTE DA PRONTIDÃO COM GAPS (can_serve_next_7_days = false)
// ----------------------------------------------------------------------------
subheader("SUITE 3: TESTE DA PRONTIDÃO COM GAPS (can_serve_next_7_days = false)");

console.log(`${colors.dim}Cenário: Autônoma sem disponibilidade confirmada para os próximos 7 dias. O motor DEVE bloquear 100% das ações de aquisição.${colors.reset}`);

const profileWithGap = {
  profession: "nail_design",
  stage: "some_clients",
  current_bottleneck: "empty_slots",
  channels: ["whatsapp", "existing_clients", "instagram"],
  daily_available_minutes: 30,
  can_serve_next_7_days: false, // GAP CRÍTICO!
  has_real_portfolio: true,
  has_booking_path: true,
};

const resultGap = simulateRecommendationEngine(profileWithGap, {
  opportunity_signals: ["none"],
});

verify(
  resultGap.v_has_gap === true,
  "v_has_gap é avaliado como true devido a can_serve_next_7_days = false.",
  "v_has_gap=true"
);

verify(
  resultGap.status === "created",
  "O motor gera com sucesso uma ação corretiva de fundação.",
  `status=${resultGap.status}`
);

// Validação estrita: 100% das ações elegíveis devem ser de fundação (FND_01 a FND_05)
const allAreFoundation = resultGap.rankedActions.every(
  (a) => a.action_type === "foundation" && a.slug.startsWith("FND_")
);
verify(
  allAreFoundation && resultGap.rankedActions.length > 0,
  "SOMENTE ações de fundação (FND_01 a FND_05) podem ser geradas quando can_serve_next_7_days = false.",
  `Ações elegíveis: ${resultGap.rankedActions.map((a) => a.slug).join(", ")}`
);

// Validação de que NENHUMA ação de aquisição passou pelo filtro
const acquisitionInGap = resultGap.rankedActions.filter(
  (a) => a.action_type === "acquisition"
);
verify(
  acquisitionInGap.length === 0,
  "Zero ações de aquisição são elegíveis quando v_has_gap = true (0% vazamento de aquisição).",
  `Ações de aquisição encontradas: ${acquisitionInGap.length}`
);

verify(
  resultGap.recommendation.slug === "FND_01_CONFIRM_AVAILABILITY",
  "FND_01_CONFIRM_AVAILABILITY é a recomendação vencedora para resolver o gap de disponibilidade.",
  `Ação prescrita: ${resultGap.recommendation.slug} (Prior ${resultGap.recommendation.editorial_prior})`
);

verify(
  resultGap.why_now === "Vamos preparar o básico para a próxima ação ficar possível.",
  "A mensagem why_now orienta pedagogicamente sobre a preparação básica.",
  `why_now: "${resultGap.why_now}"`
);

// Subteste 3.2: Gap de Portfólio
console.log(`\n  ${colors.yellow}► Subteste 3.2: Gap de Portfólio (has_real_portfolio = false)${colors.reset}`);
const profileGapPortfolio = {
  ...profileWithGap,
  can_serve_next_7_days: true,
  has_real_portfolio: false, // GAP
};
const resultGapPortfolio = simulateRecommendationEngine(profileGapPortfolio, {
  opportunity_signals: ["none"],
});
verify(
  resultGapPortfolio.recommendation.slug === "FND_04_REAL_PORTFOLIO",
  "FND_04_REAL_PORTFOLIO é prescrita quando o gap é ausência de portfólio real.",
  `Ação: ${resultGapPortfolio.recommendation.slug}`
);

// Subteste 3.3: Gap de Canal de Agendamento
console.log(`\n  ${colors.yellow}► Subteste 3.3: Gap de Caminho de Agendamento (has_booking_path = false)${colors.reset}`);
const profileGapBooking = {
  ...profileWithGap,
  can_serve_next_7_days: true,
  has_booking_path: false, // GAP
};
const resultGapBooking = simulateRecommendationEngine(profileGapBooking, {
  opportunity_signals: ["none"],
});
verify(
  resultGapBooking.recommendation.slug === "FND_02_BOOKING_PATH",
  "FND_02_BOOKING_PATH é prescrita quando o gap é ausência de caminho de marcação.",
  `Ação: ${resultGapBooking.recommendation.slug}`
);

// Subteste 3.4: Trava de Prontidão da Migration 20260901 (check_readiness_lock)
console.log(`\n  ${colors.yellow}► Subteste 3.4: Validação Lógica de check_readiness_lock RPC${colors.reset}`);

function simulateCheckReadinessLock(actionSlug, profile, workspaceRulesCount = 1) {
  if (!profile.can_serve_next_7_days) {
    return {
      locked: true,
      reason: "Você não confirmou disponibilidade para atender nos próximos 7 dias.",
      fix_url: "/onboarding?reason=edit",
    };
  }
  if (!profile.has_real_portfolio) {
    return {
      locked: true,
      reason: "Você ainda não separou fotos ou provas reais do seu serviço.",
      fix_url: "/action/fnd-04-real-portfolio",
    };
  }
  if (["CONV_03_TWO_REAL_SLOTS", "AVAIL_01_REAL_SLOT"].includes(actionSlug)) {
    if (workspaceRulesCount === 0) {
      return {
        locked: true,
        reason: "Você não configurou nenhum dia ou horário de atendimento na sua Agenda.",
        fix_url: "/agenda",
      };
    }
  }
  return { locked: false, reason: null, fix_url: null };
}

const lockResult1 = simulateCheckReadinessLock("CONV_03_TWO_REAL_SLOTS", profileWithGap);
verify(
  lockResult1.locked === true && lockResult1.fix_url === "/onboarding?reason=edit",
  "check_readiness_lock trava ações avançadas quando can_serve_next_7_days = false.",
  lockResult1.reason
);

const lockResult2 = simulateCheckReadinessLock(
  "AVAIL_01_REAL_SLOT",
  profileZeroClients,
  0 // Sem regras na agenda
);
verify(
  lockResult2.locked === true && lockResult2.fix_url === "/agenda",
  "check_readiness_lock trava AVAIL_01 quando não há horários configurados na agenda.",
  lockResult2.reason
);

// ----------------------------------------------------------------------------
// SUITE 4: TESTE DO CÁLCULO DO IVP E CLASSIFICAÇÃO DOS ARQUÉTIPOS
// ----------------------------------------------------------------------------
subheader("SUITE 4: TESTE DO IVP & CLASSIFICAÇÃO DOS ARQUÉTIPOS");

console.log(`${colors.dim}Testando a Matriz de 0 a 100 pontos do Índice de Percepção de Valor e o enquadramento nos 3 arquétipos de negócio.${colors.reset}`);

// Teste 4.1: Arquétipo Commoditizada (0 a 35 pontos)
console.log(`\n  ${colors.yellow}► Subteste 4.1: Arquétipo 'commoditizada' (price_prisoner - IVP <= 35)${colors.reset}`);
const answersCommoditizada = [
  { question_id: "q1_showcase", option_id: "price_flyer" }, // 5 pts, leak: showcase_commodity
  { question_id: "q2_climax", option_id: "rushed_hand_mirror" }, // 5 pts, leak: climax_rushed
  { question_id: "q3_physical", option_id: "zero_physical" }, // 5 pts, leak: intangible_vacuum
];

const diagCommoditizada = calculateValueDiagnosticEngine(answersCommoditizada);
verify(
  diagCommoditizada.ivp_score === 15,
  "Pontuação do IVP calculada com exatidão (5 + 5 + 5 = 15 pontos).",
  `IVP: ${diagCommoditizada.ivp_score}`
);
verify(
  diagCommoditizada.db_archetype === "price_prisoner",
  "Enum no banco de dados classificado como 'price_prisoner'.",
  diagCommoditizada.db_archetype
);
verify(
  diagCommoditizada.business_archetype === "commoditizada",
  "Arquétipo de negócio classificado como 'commoditizada'.",
  diagCommoditizada.business_archetype
);
verify(
  diagCommoditizada.playbook_slug === "playbook_48h_decommoditize",
  "Prescrição imediata do Playbook de Descommoditização de 48 Horas.",
  diagCommoditizada.playbook_slug
);

// Teste 4.2: Arquétipo Diferenciada - Nível Artesã (36 a 65 pontos)
console.log(`\n  ${colors.yellow}► Subteste 4.2: Arquétipo 'diferenciada' (hidden_artisan - 36 a 65 pts)${colors.reset}`);
const answersArtesa = [
  { question_id: "q1_showcase", option_id: "noisy_feed" }, // 15 pts
  { question_id: "q2_climax", option_id: "polite_compliment_only" }, // 15 pts
  { question_id: "q3_physical", option_id: "vip_envelope_and_gift" }, // 30 pts
];
const diagArtesa = calculateValueDiagnosticEngine(answersArtesa);
verify(
  diagArtesa.ivp_score === 60,
  "Pontuação do IVP calculada com exatidão (15 + 15 + 30 = 60 pontos).",
  `IVP: ${diagArtesa.ivp_score}`
);
verify(
  diagArtesa.db_archetype === "hidden_artisan",
  "Enum no banco classificado como 'hidden_artisan'.",
  diagArtesa.db_archetype
);
verify(
  diagArtesa.business_archetype === "diferenciada",
  "Arquétipo de negócio classificado como 'diferenciada'.",
  diagArtesa.business_archetype
);
verify(
  diagArtesa.playbook_slug === "playbook_48h_aftercare_tangible",
  "Playbook prescrito: Tangibilização e Pós-Atendimento.",
  diagArtesa.playbook_slug
);

// Teste 4.3: Arquétipo Diferenciada - Nível Lapidação (66 a 85 pontos)
console.log(`\n  ${colors.yellow}► Subteste 4.3: Arquétipo 'diferenciada' (polishing_specialist - 66 a 85 pts)${colors.reset}`);
const answersLapidacao = [
  { question_id: "q1_showcase", option_id: "transformation_showcase" }, // 35 pts
  { question_id: "q2_climax", option_id: "polite_compliment_only" }, // 15 pts
  { question_id: "q3_physical", option_id: "vip_envelope_and_gift" }, // 30 pts
];
const diagLapidacao = calculateValueDiagnosticEngine(answersLapidacao);
verify(
  diagLapidacao.ivp_score === 80,
  "Pontuação do IVP calculada com exatidão (35 + 15 + 30 = 80 pontos).",
  `IVP: ${diagLapidacao.ivp_score}`
);
verify(
  diagLapidacao.db_archetype === "polishing_specialist",
  "Enum no banco classificado como 'polishing_specialist'.",
  diagLapidacao.db_archetype
);
verify(
  diagLapidacao.business_archetype === "diferenciada",
  "Arquétipo de negócio permanece 'diferenciada' (nível superior).",
  diagLapidacao.business_archetype
);
verify(
  diagLapidacao.playbook_slug === "playbook_48h_top10_polish",
  "Playbook prescrito: Lapidação Top 10%.",
  diagLapidacao.playbook_slug
);

// Teste 4.4: Arquétipo Referência Premium (86 a 100 pontos)
console.log(`\n  ${colors.yellow}► Subteste 4.4: Arquétipo 'referencia_premium' (premium_brand - 86 a 100 pts)${colors.reset}`);
const answersPremium = [
  { question_id: "q1_showcase", option_id: "transformation_showcase" }, // 35 pts
  { question_id: "q2_climax", option_id: "mirror_ceremony" }, // 35 pts
  { question_id: "q3_physical", option_id: "vip_envelope_and_gift" }, // 30 pts
];
const diagPremium = calculateValueDiagnosticEngine(answersPremium);
verify(
  diagPremium.ivp_score === 100,
  "Pontuação máxima de 100 pontos atingida (35 + 35 + 30 = 100 pontos).",
  `IVP: ${diagPremium.ivp_score}`
);
verify(
  diagPremium.db_archetype === "premium_brand",
  "Enum no banco classificado como 'premium_brand'.",
  diagPremium.db_archetype
);
verify(
  diagPremium.business_archetype === "referencia_premium",
  "Arquétipo de negócio classificado como 'referencia_premium'.",
  diagPremium.business_archetype
);

// Teste 4.5: Calibrador de Objeções Recentes de Preço
console.log(`\n  ${colors.yellow}► Subteste 4.5: Fator Calibrador de Objeções de Preço (-5 pts)${colors.reset}`);
const diagCalibrated = calculateValueDiagnosticEngine(answersArtesa, {
  recentPriceObjections: 4,
});
verify(
  diagCalibrated.ivp_score === 55,
  "Usuária com 3+ objeções de 'Achei Caro' recebe calibração matemática de -5 pts (60 -> 55).",
  `IVP Calibrado: ${diagCalibrated.ivp_score}`
);

// ----------------------------------------------------------------------------
// SUITE 5: TESTE DAS 4 CATEGORIAS DE OBJEÇÃO DO SOS COPILOTO
// ----------------------------------------------------------------------------
subheader("SUITE 5: TESTE DAS 4 CATEGORIAS DE OBJEÇÃO DO SOS COPILOTO");

const requiredCategories = [
  "price_too_high",
  "procrastination",
  "third_party_decision",
  "just_browsing",
];

for (const cat of requiredCategories) {
  console.log(`\n  ${colors.yellow}► Validando Categoria de Objeção: '${cat}'${colors.reset}`);
  const templates = COPILOT_TEMPLATES.filter((t) => t.objection_category === cat && t.active);

  verify(
    templates.length > 0,
    `Categoria '${cat}' possui ao menos um template canônico publicado.`,
    `Encontrados: ${templates.length}`
  );

  for (const t of templates) {
    verify(
      Boolean(t.slug && t.title && t.script_text && t.script_audio),
      `Template '${t.slug}' possui todos os campos mandatórios (slug, título, script de texto e áudio).`,
      t.title
    );
    verify(
      t.audio_duration_seconds >= 5 && t.audio_duration_seconds <= 90,
      `Áudio de '${t.slug}' está dentro dos parâmetros de teleprompter (5 a 90s).`,
      `${t.audio_duration_seconds}s`
    );
    verify(
      t.script_audio.startsWith("[Tom "),
      `Script de áudio de '${t.slug}' possui guia de entonação emocional explícito.`,
      t.script_audio.slice(0, 30) + "..."
    );
  }
}

// Subteste 5.2: Validação Específica do Caminho de Downsell em price_too_high
console.log(`\n  ${colors.yellow}► Subteste 5.2: Rota de Downsell para 'price_too_high'${colors.reset}`);
const downsellTemplate = COPILOT_TEMPLATES.find(
  (t) => t.objection_category === "price_too_high" && t.approach_type === "downsell"
);
verify(
  Boolean(downsellTemplate),
  "Categoria 'price_too_high' oferece alternativa estruturada de Downsell Educado.",
  downsellTemplate?.slug
);

// ============================================================================
// RESUMO GERAL DOS TESTES
// ============================================================================

header("RESUMO FINAL DA EXECUÇÃO DE QA");
console.log(`\n  Total de Asserções Executadas: ${colors.bright}${totalAssertions}${colors.reset}`);
console.log(`  Asserções Validadas com Sucesso: ${colors.bright}${colors.green}${passedAssertions}${colors.reset}`);
console.log(`  Taxa de Sucesso: ${colors.bright}${colors.green}${((passedAssertions / totalAssertions) * 100).toFixed(1)}%${colors.reset}`);

console.log(`\n${colors.bright}${colors.green}✔ TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO!${colors.reset}\n`);
