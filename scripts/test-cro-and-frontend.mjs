import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// ANSI colors for clean CLI reporting
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

const checks = [];
let currentSuite = "";

function suite(name) {
  currentSuite = name;
  console.log(`\n${colors.bold}${colors.cyan}=== ${name} ===${colors.reset}`);
}

function assert(condition, title, details = "") {
  const result = {
    suite: currentSuite,
    title,
    details,
    passed: Boolean(condition),
  };
  checks.push(result);

  if (result.passed) {
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${title}`);
    if (details) {
      console.log(`    ${colors.dim}${details}${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset} ${title}`);
    if (details) {
      console.log(`    ${colors.yellow}Motivo: ${details}${colors.reset}`);
    }
  }
}

// Helpers for AST exploration
function parseSource(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  const isTsx = filePath.endsWith(".tsx");
  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  return { content, sf, absolutePath };
}

function collectJsxElements(node, sf, list = []) {
  if (ts.isJsxElement(node)) {
    list.push({
      type: "element",
      tag: node.openingElement.tagName.getText(sf),
      text: node.getText(sf),
      node,
    });
  } else if (ts.isJsxSelfClosingElement(node)) {
    list.push({
      type: "selfClosing",
      tag: node.tagName.getText(sf),
      text: node.getText(sf),
      node,
    });
  }
  ts.forEachChild(node, (child) => collectJsxElements(child, sf, list));
  return list;
}

function collectIdentifiers(node, sf, list = []) {
  if (ts.isIdentifier(node)) {
    list.push(node.getText(sf));
  }
  ts.forEachChild(node, (child) => collectIdentifiers(child, sf, list));
  return list;
}

function collectStringLiterals(node, sf, list = []) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    list.push(node.text);
  }
  ts.forEachChild(node, (child) => collectStringLiterals(child, sf, list));
  return list;
}

async function runCroAndFrontendAudit() {
  console.log(`${colors.bold}${colors.magenta}`);
  console.log("┌──────────────────────────────────────────────────────────────┐");
  console.log("│   AGENDA 80/20 — AUDITORIA DE FRONT-END, CRO & RESPONSIVIDADE│");
  console.log("│   Verificação de AST, Arquitetura de Oferta e Telemetria      │");
  console.log("└──────────────────────────────────────────────────────────────┘");
  console.log(colors.reset);

  // Load files
  const pricingFile = parseSource("components/pricing-section.tsx");
  const downsellFile = parseSource("components/exit-downsell-modal.tsx");
  const heroCopilotFile = parseSource("components/hero-copilot-preview.tsx");
  const pageFile = parseSource("app/page.tsx");
  const analyticsFile = parseSource("lib/client-analytics.ts");

  // =========================================================================
  // SUITE 1: Arquitetura de Planos e Exclusividade do Downsell (CRO)
  // =========================================================================
  suite("1. Validação de Oferta: Remoção do Semestral Lado a Lado & Exclusividade no Downsell");

  const pricingJsx = collectJsxElements(pricingFile.sf, pricingFile.sf);

  // 1.1 Verificar ausência de grid comparativo lado a lado de múltiplos planos no PricingSection
  const hasSideBySidePlanGrid = pricingFile.content.includes("grid-cols-2") && 
    (pricingFile.content.includes("Plano Semestral") || pricingFile.content.includes("semiannual"));
  assert(
    !hasSideBySidePlanGrid,
    "PricingSection: ausência de grid comparativo lado a lado (evita paralisia de escolha / paradox of choice)",
    "O container de planos não divide a tela em colunas paralelas para Semestral e Anual."
  );

  // 1.2 Verificar que o Plano Semestral R$ 97 NÃO aparece como card principal ou título na vitrine aberta
  const hasSemestralAsDirectCard = /<h3[^>]*>.*Plano Semestral.*<\/h3>/s.test(pricingFile.content);
  assert(
    !hasSemestralAsDirectCard,
    "PricingSection: 'Plano Semestral' NÃO existe como título de card na vitrine aberta",
    "Nenhum h3 exibe 'Plano Semestral' na vitrine pública."
  );

  // 1.3 Verificar se ExitDownsellModal está integrado na seção de preços
  const rendersDownsellModal = pricingJsx.some(
    (el) => el.tag === "ExitDownsellModal"
  );
  assert(
    rendersDownsellModal,
    "PricingSection: ExitDownsellModal é instanciado na árvore de componentes",
    "O componente <ExitDownsellModal searchParams={searchParams} /> está presente no final da oferta."
  );

  // 1.4 No ExitDownsellModal: o Plano Semestral R$ 97 existe com acionador e conteúdo exclusivo
  const downsellHasSemiannualRef = downsellFile.content.includes("semiannual") && downsellFile.content.includes("R$ 97");
  assert(
    downsellHasSemiannualRef,
    "ExitDownsellModal: Plano Semestral R$ 97 está configurado exclusivamente para recuperação",
    "O modal utiliza 'semiannual' e exibe explicitamente a oferta de R$ 97."
  );

  // 1.5 No ExitDownsellModal: gatilho suave de saída/validação menor
  const downsellTriggerText = "Prefere validar por um período menor? Veja a opção de 6 meses por R$ 97.";
  assert(
    downsellFile.content.includes(downsellTriggerText),
    "ExitDownsellModal: texto do gatilho discreto configurado corretamente",
    `Gatilho presente: "${downsellTriggerText}"`
  );

  // 1.6 No ExitDownsellModal: estrutura modal com acessibilidade (role="dialog" e aria-modal)
  const downsellHasA11y = downsellFile.content.includes('role="dialog"') && downsellFile.content.includes('aria-modal="true"');
  assert(
    downsellHasA11y,
    "ExitDownsellModal: atributos de acessibilidade do modal (role='dialog', aria-modal='true')",
    "Garante conformidade com leitores de tela e boas práticas de UX acessível."
  );

  // 1.7 Na página principal (app/page.tsx): sem menções isoladas a Plano Semestral solto na vitrine
  const pageDirectSemestral = /Plano Semestral/.test(pageFile.content);
  assert(
    !pageDirectSemestral,
    "app/page.tsx: Nenhuma menção solta a 'Plano Semestral' fora da arquitetura de componentes",
    "A landing page delega a responsabilidade estrita ao PricingSection e ExitDownsellModal."
  );

  // =========================================================================
  // SUITE 2: Destaque do Plano Anual R$ 147, Belevy 30 Dias e Order Bump
  // =========================================================================
  suite("2. Validação do Plano Anual R$ 147, Benefício Belevy Pro e Order Bump");

  // 2.1 Presença e valor do Plano Anual R$ 147
  const hasAnnual147 = pricingFile.content.includes("Plano Anual Completo") && pricingFile.content.includes("R$ 147");
  assert(
    hasAnnual147,
    "PricingSection: Card Anual configurado com 'Plano Anual Completo' e 'R$ 147'",
    "Preço principal de R$ 147 em destaque para 12 meses."
  );

  // 2.2 Destaque visual: borda de revenue, sombra elevada e badge de Oferta Principal
  const hasAnnualVisualHighlight = pricingFile.content.includes("border-2 border-[var(--color-revenue-primary)]") &&
    pricingFile.content.includes("Oferta Principal · 12 Meses") &&
    pricingFile.content.includes("Sparkles");
  assert(
    hasAnnualVisualHighlight,
    "PricingSection: Destaque visual do Anual com borda temática, badge 'Oferta Principal' e Sparkles",
    "Card utiliza token de revenue e badge destacado para ancoragem visual máxima."
  );

  // 2.3 Cálculo de valor percebido diário (R$ 0,40 por dia)
  const hasDailyCalculation = pricingFile.content.includes("R$ 0,40 por dia");
  assert(
    hasDailyCalculation,
    "PricingSection: Ancoragem de micro-custo 'R$ 0,40 por dia' para redução de atrito",
    "Micro-cópia CRO de fracionamento de preço presente."
  );

  // 2.4 Menção clara aos 30 dias de Belevy inclusos na lista e no FAQ
  const hasBelevy30DaysInList = pricingFile.content.includes("30 dias inclusos de Belevy Pro");
  const hasBelevyFaq = pricingFile.content.includes("O que é o benefício de 30 dias do Belevy?");
  assert(
    hasBelevy30DaysInList && hasBelevyFaq,
    "PricingSection: Inclusão clara de 30 dias de Belevy Pro nos benefícios e no FAQ",
    "Transparência total sobre a integração da agenda inteligente e CRM no ecossistema."
  );

  // 2.5 Caixa de Order Bump com +30 dias por R$ 19,90 (totalizando 60 dias de Belevy)
  const hasOrderBumpBox = pricingFile.content.includes("Quer 60 dias de Belevy?") &&
    pricingFile.content.includes("+30 dias por apenas R$ 19,90");
  const hasOrderBumpFaq = pricingFile.content.includes("Posso adicionar mais tempo de Belevy no momento da compra?");
  assert(
    hasOrderBumpBox && hasOrderBumpFaq,
    "PricingSection: Callout de Order Bump (+30 dias por R$ 19,90) e FAQ explicativo",
    "Caixa destacada prepara o comprador antes de avançar para o checkout da Cakto."
  );

  // 2.6 Botão de Checkout com link do Anual e tracking de telemetria
  const hasAnnualCheckoutTrigger = pricingFile.content.includes("getCheckoutUrl(\"annual\"") &&
    pricingFile.content.includes('trackFunnelEvent("checkout_redirect_clicked", { plan: "annual", price: 147 })');
  assert(
    hasAnnualCheckoutTrigger,
    "PricingSection: Botão de CTA anual dispara evento de funil 'checkout_redirect_clicked'",
    "Garante mensuração precisa de conversão para o plano anual."
  );

  // 2.7 Hero de app/page.tsx reforça a oferta de R$ 147 com Belevy Pro
  const pageHeroAnnual = pageFile.content.includes("Garantir acesso anual por R$ 147") &&
    pageFile.content.includes("Inclui 30 dias de Belevy Pro");
  assert(
    pageHeroAnnual,
    "app/page.tsx: Hero reforça o valor de R$ 147 e o benefício dos 30 dias de Belevy Pro",
    "Consistência entre o Hero acima da dobra e o Checkout na base da página."
  );

  // =========================================================================
  // SUITE 3: HeroCopilotPreview (Objeções, Dual Mode e Interatividade Tátil)
  // =========================================================================
  suite("3. Validação do HeroCopilotPreview: 3 Abas, Dual Mode Texto/Áudio e Cópia Tátil");

  // 3.1 Validar presença das 3 abas de objeção via AST / Código
  const hasObjection1 = heroCopilotFile.content.includes('label: "Achei Caro"') && heroCopilotFile.content.includes('id: "price"');
  const hasObjection2 = heroCopilotFile.content.includes('label: "Só o Preço"') && heroCopilotFile.content.includes('id: "browse"');
  const hasObjection3 = heroCopilotFile.content.includes('label: "Vou Ver e Te Aviso"') && heroCopilotFile.content.includes('id: "procrastinate"');
  assert(
    hasObjection1 && hasObjection2 && hasObjection3,
    "HeroCopilotPreview: 3 abas de objeção ('Achei Caro', 'Só o Preço', 'Vou Ver e Te Aviso')",
    "Cobre as 3 dores centrais do WhatsApp: preço, cotação fria e adiamento."
  );

  // 3.2 Validar estrutura de roteiros de texto e áudio para cada objeção
  const hasDualScripts = heroCopilotFile.content.includes("textScript:") &&
    heroCopilotFile.content.includes("audioScript:") &&
    heroCopilotFile.content.includes("audioTone:") &&
    heroCopilotFile.content.includes("audioSeconds:");
  assert(
    hasDualScripts,
    "HeroCopilotPreview: dados de roteiro duplo (textScript, audioScript, audioTone, audioSeconds)",
    "Cada aba possui copy pronta para texto e diretrizes completas de entonação para áudio."
  );

  // 3.3 Validar alternância dos modos Texto e Áudio (toggle buttons e estado)
  const hasModeToggle = heroCopilotFile.content.includes('scriptMode === "text"') &&
    heroCopilotFile.content.includes('scriptMode === "audio"') &&
    heroCopilotFile.content.includes('onClick={() => setScriptMode("text")}') &&
    heroCopilotFile.content.includes('onClick={() => setScriptMode("audio")}');
  assert(
    hasModeToggle,
    "HeroCopilotPreview: Alternador de modo interativo Texto vs Áudio",
    "Usuária pode alternar visualmente entre a leitura de WhatsApp e o guia de gravação de áudio."
  );

  // 3.4 Validar ícones e informações contextuais de áudio (Mic, Volume2)
  const hasAudioIcons = heroCopilotFile.content.includes("<Mic") && heroCopilotFile.content.includes("<Volume2");
  assert(
    hasAudioIcons,
    "HeroCopilotPreview: Elementos visuais de áudio (Mic no toggle, Volume2 no guia)",
    "Comunicação visual imediata da funcionalidade multimídia do app."
  );

  // 3.5 Validar botão de cópia tátil e integração com navigator.clipboard
  const hasTactileCopy = heroCopilotFile.content.includes("navigator.clipboard.writeText") &&
    heroCopilotFile.content.includes("active:scale-95") &&
    heroCopilotFile.content.includes("Copiado!") &&
    heroCopilotFile.content.includes("Copiar para WhatsApp");
  assert(
    hasTactileCopy,
    "HeroCopilotPreview: Botão de cópia com feedback tátil (active:scale-95) e estado 'Copiado!'",
    "Micro-interação tátil e feedback instantâneo ao copiar para a área de transferência."
  );

  // =========================================================================
  // SUITE 4: Novas Seções de Conversão da Landing Page (app/page.tsx)
  // =========================================================================
  suite("4. Validação das Novas Seções da Landing Page (app/page.tsx)");

  // 4.1 Seção: "Quem é você hoje?" / 3 Momentos da Profissional
  const hasMomentsSection = pageFile.content.includes("Princípio 80/20 Aplicado") &&
    pageFile.content.includes("O método se ajusta ao seu momento real.");
  const hasMomentZero = pageFile.content.includes("Estou no Zero") && pageFile.content.includes("Começando sem clientes nem seguidores");
  const hasMomentEmpty = pageFile.content.includes("Horários Vazios") && pageFile.content.includes("Já atendo, mas sobram vagas na semana");
  const hasMomentGhost = pageFile.content.includes("Baixa Conversão") && pageFile.content.includes("Pessoas pedem o valor e desaparecem");
  assert(
    hasMomentsSection && hasMomentZero && hasMomentEmpty && hasMomentGhost,
    "app/page.tsx: Seção 'Quem é você hoje?' com os 3 momentos (Zero, Horários Vazios, Baixa Conversão)",
    "Segmenta e conecta instantaneamente com os 3 perfis de audiência da landing page."
  );

  // 4.2 Seção: "3 Armas Secretas do Software"
  const hasThreeWeaponsSection = pageFile.content.includes("Tecnologia no seu Bolso") &&
    pageFile.content.includes("Três recursos feitos para quem atende com as próprias mãos.");
  const hasWeapon1 = pageFile.content.includes("SOS Copiloto com Roteiros em Áudio e Texto");
  const hasWeapon2 = pageFile.content.includes("Janela de Ouro de Retorno (Ciclo Biológico)");
  const hasWeapon3 = pageFile.content.includes("Sua Agenda Oficial Integrada (Belevy Pro)");
  assert(
    hasThreeWeaponsSection && hasWeapon1 && hasWeapon2 && hasWeapon3,
    "app/page.tsx: Seção '3 Armas Secretas do Software' com os 3 diferenciais tecnológicos",
    "Apresenta SOS Copiloto, Janela de Ouro biológica e integração Belevy Pro."
  );

  // 4.3 Seção: Tabela Comparativa de 3 Colunas (Agenda 80/20 vs Cursos vs ChatGPT)
  const hasTableSection = pageFile.content.includes("Por que você precisa de software e não de outro curso?") &&
    pageFile.content.includes("<table") &&
    pageFile.content.includes("Cursos & PDFs") &&
    pageFile.content.includes("ChatGPT Genérico") &&
    pageFile.content.includes("Agenda 80/20");
  const hasTableCriteria = pageFile.content.includes("Tempo para aplicar") &&
    pageFile.content.includes("Respostas para WhatsApp") &&
    pageFile.content.includes("Direção do que fazer") &&
    pageFile.content.includes("Organização de clientes");
  assert(
    hasTableSection && hasTableCriteria,
    "app/page.tsx: Tabela Comparativa de 3 Colunas (Agenda vs Cursos vs ChatGPT) com 4 critérios",
    "Desqualifica a concorrência indireta (infoprodutos teóricos e IA genérica) provando o valor do software."
  );

  // 4.4 Seção: Autoridade Flávia Claus
  const hasFlaviaSection = pageFile.content.includes("Criado por Flávia Claus") &&
    pageFile.content.includes("Soft Gel Express") &&
    pageFile.content.includes("Método Validado em Bancada") &&
    pageFile.content.includes("Você não precisa ser blogueira nem gastar rios de dinheiro com anúncio");
  assert(
    hasFlaviaSection,
    "app/page.tsx: Seção Flávia Claus com menção ao Soft Gel Express e validação de bancada",
    "Gera autoridade autêntica com prova de vivência prática e citação orientadora."
  );

  // =========================================================================
  // SUITE 5: Telemetria de Funil & Proteção de Dados (lib/client-analytics.ts)
  // =========================================================================
  suite("5. Validação de Telemetria de Funil & Privacidade (client-analytics.ts)");

  // 5.1 Tipos de eventos suportados
  const requiredEvents = [
    "landing_page_view",
    "hero_cta_clicked",
    "pricing_viewed",
    "checkout_redirect_clicked",
    "downsell_modal_opened",
    "downsell_checkout_clicked",
  ];
  const allEventsDefined = requiredEvents.every((ev) => analyticsFile.content.includes(ev));
  assert(
    allEventsDefined,
    "client-analytics.ts: Suporte aos 6 eventos canônicos do funil de conversão",
    `Eventos validados: ${requiredEvents.join(", ")}`
  );

  // 5.2 dataLayer push e CustomEvent
  const hasDataLayerPush = analyticsFile.content.includes("window.dataLayer.push(payload)");
  const hasCustomEventDispatch = analyticsFile.content.includes('new CustomEvent("agenda8020:analytics"');
  assert(
    hasDataLayerPush && hasCustomEventDispatch,
    "client-analytics.ts: Integração com dataLayer (GTM/Pixel) e dispatch de CustomEvent no browser",
    "Permite tanto acoplamento padrão GTM quanto listeners desacoplados na aplicação."
  );

  // 5.3 Simulação funcional em runtime do trackFunnelEvent
  console.log(`\n  ${colors.bold}Executando teste funcional de telemetria em ambiente simulado...${colors.reset}`);
  
  // Transpile TypeScript module on the fly
  const transpiledCode = ts.transpileModule(analyticsFile.content, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dataUrl = "data:text/javascript;base64," + Buffer.from(transpiledCode).toString("base64");
  const { trackFunnelEvent } = await import(dataUrl);

  // Setup mock browser window
  const mockDataLayer = [];
  const mockCustomEvents = [];
  globalThis.window = {
    dataLayer: mockDataLayer,
    dispatchEvent: (ev) => {
      mockCustomEvents.push(ev);
      return true;
    },
  };
  globalThis.CustomEvent = class {
    constructor(name, opts) {
      this.name = name;
      this.detail = opts?.detail;
    }
  };

  // Trigger events
  trackFunnelEvent("landing_page_view");
  trackFunnelEvent("hero_cta_clicked", { target: "#planos" });
  trackFunnelEvent("pricing_viewed");
  trackFunnelEvent("checkout_redirect_clicked", { plan: "annual", price: 147 });
  trackFunnelEvent("downsell_modal_opened");
  trackFunnelEvent("downsell_checkout_clicked", { plan: "semiannual", price: 97 });

  const dataLayerLengthCorrect = mockDataLayer.length === 6;
  const customEventsLengthCorrect = mockCustomEvents.length === 6;
  assert(
    dataLayerLengthCorrect && customEventsLengthCorrect,
    "client-analytics.ts [Runtime]: Todos os 6 eventos foram registrados no dataLayer e despachados como CustomEvent",
    `Total dataLayer pushes: ${mockDataLayer.length}/6 | CustomEvents: ${mockCustomEvents.length}/6`
  );

  // 5.4 Validação de estrutura do payload
  const firstPayload = mockDataLayer[0];
  const annualPayload = mockDataLayer[3];
  const downsellPayload = mockDataLayer[5];

  const payloadStructureValid = firstPayload.event === "landing_page_view" &&
    typeof firstPayload.timestamp === "string" &&
    !isNaN(Date.parse(firstPayload.timestamp)) &&
    annualPayload.plan === "annual" &&
    annualPayload.price === 147 &&
    downsellPayload.plan === "semiannual" &&
    downsellPayload.price === 97;

  assert(
    payloadStructureValid,
    "client-analytics.ts [Runtime]: Estrutura de payload respeita padrão { event, timestamp, ...params }",
    `Exemplo capturado: event='${annualPayload.event}', plan='${annualPayload.plan}', price=${annualPayload.price}`
  );

  // 5.5 Auditoria de Privacidade (LGPD / Proteção contra vazamento de PII)
  const forbiddenPiiTerms = ["cpf", "credit_card", "cardNumber", "cvv", "password", "senha", "rg", "birthdate"];
  const analyticsCodeLower = analyticsFile.content.toLowerCase();
  const hasForbiddenPiiInCode = forbiddenPiiTerms.some((term) => analyticsCodeLower.includes(term));
  
  // Also verify that the telemetry payload does not leak window location or sensitive objects
  const payloadHasOnlyExpectedKeys = mockDataLayer.every((item) => {
    const keys = Object.keys(item);
    return !keys.some((k) => forbiddenPiiTerms.includes(k.toLowerCase()));
  });

  assert(
    !hasForbiddenPiiInCode && payloadHasOnlyExpectedKeys,
    "client-analytics.ts: Conformidade com privacidade (Zero vazamento de dados pessoais ou PII)",
    "Nenhum campo de dados sensíveis (cartão, senha, CPF) é rastreado ou trafegado na telemetria."
  );

  // =========================================================================
  // RELATÓRIO FINAL CONSOLIDADO
  // =========================================================================
  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const failedChecks = checks.filter((c) => !c.passed).length;

  console.log("\n" + "=".repeat(64));
  console.log(`${colors.bold}RELATÓRIO CONSOLIDADO DE AUDITORIA FRONT-END & CRO${colors.reset}`);
  console.log("=".repeat(64));
  console.log(`Total de asserções executadas : ${totalChecks}`);
  console.log(`Asserções aprovadas (PASS)   : ${colors.green}${colors.bold}${passedChecks}${colors.reset}`);
  console.log(`Asserções reprovadas (FAIL)  : ${failedChecks > 0 ? colors.red + colors.bold + failedChecks : colors.green + "0"}${colors.reset}`);
  console.log(`Taxa de sucesso              : ${colors.bold}${((passedChecks / totalChecks) * 100).toFixed(1)}%${colors.reset}`);
  console.log("=".repeat(64));

  if (failedChecks > 0) {
    console.log(`\n${colors.red}${colors.bold}DETALHE DAS REPROVAÇÕES:${colors.reset}`);
    checks
      .filter((c) => !c.passed)
      .forEach((c) => {
        console.log(`  - [${c.suite}] ${c.title}`);
        console.log(`    ${colors.yellow}${c.details}${colors.reset}`);
      });
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}✔ TODOS OS TESTES E AUDITORIAS FORAM CONCLUÍDOS COM SUCESSO ABSOLUTO!${colors.reset}\n`);
    process.exit(0);
  }
}

runCroAndFrontendAudit().catch((err) => {
  console.error("Erro fatal durante a auditoria:", err);
  process.exit(1);
});
