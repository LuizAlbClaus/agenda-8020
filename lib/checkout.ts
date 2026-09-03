export type PlanType = "annual" | "semiannual";

export interface CheckoutPlanConfig {
  id: PlanType;
  name: string;
  durationLabel: string;
  badgeLabel?: string;
  priceFormatted: string;
  installmentCount?: number;
  installmentPriceFormatted?: string;
  cashPriceFormatted?: string;
  dailyEquivalentLabel?: string;
  billingFrequency: string;
  periodDays: number;
  belevyBenefitDays: number;
  highlighted?: boolean;
  features: string[];
}

export const CHECKOUT_PLANS: Record<PlanType, CheckoutPlanConfig> = {
  annual: {
    id: "annual",
    name: "Plano Anual Completo",
    durationLabel: "12 meses",
    badgeLabel: "Melhor Custo-Benefício",
    priceFormatted: "12x de R$ 15,19",
    installmentCount: 12,
    installmentPriceFormatted: "R$ 15,19",
    cashPriceFormatted: "R$ 147",
    dailyEquivalentLabel: "Menos de R$ 0,50 por dia",
    billingFrequency: "ou R$ 147 à vista com desconto",
    periodDays: 365,
    belevyBenefitDays: 30,
    highlighted: true,
    features: [
      "365 dias de acesso irrestrito ao Agenda 80/20",
      "SOS Copiloto de Fechamento: respostas em áudio e texto para WhatsApp",
      "Teleprompter de voz com ritmo e entonação para soar especialista",
      "Radar de Retenção Biológica: convite na janela exata dos 21-28 dias",
      "Bússola Diária 80/20: 1 micro-ação em 3 minutos para trazer clientes",
      "Diagnóstico de Valor: blindagem contra quem pede desconto",
      "30 dias de Belevy Pro inclusos com lembretes anti-falta automáticos",
      "Acesso imediato no celular sem senhas para decorar",
    ],
  },
  semiannual: {
    id: "semiannual",
    name: "Plano Semestral",
    durationLabel: "6 meses",
    priceFormatted: "R$ 97",
    billingFrequency: "/semestre (pagamento único)",
    periodDays: 180,
    belevyBenefitDays: 30,
    highlighted: false,
    features: [
      "180 dias de acesso contínuo ao Agenda 80/20",
      "1 recomendação diária acionável (2 a 5 min)",
      "Mensagens prontas para WhatsApp e canais",
      "Link público de agendamento ilimitado",
      "Histórico de ações e sinais de clientes",
      "30 dias de cortesia no Belevy (CRM e lembretes)",
      "Acesso imediato via link mágico por e-mail",
    ],
  },
};

const ALLOWED_TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "src",
  "sck",
  "email",
  "name",
  "phone",
] as const;

/**
 * Retorna a URL de checkout correspondente ao plano, propagando parâmetros
 * de rastreamento (UTMs) se fornecidos. Se a variável de ambiente não estiver
 * configurada, faz fallback seguro para a âncora de planos ou login.
 */
export function getCheckoutUrl(
  plan: PlanType,
  searchParams?: Record<string, string | string[] | undefined>
): string {
  const envUrl =
    plan === "annual"
      ? process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL_ANNUAL
      : process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL_SEMIANNUAL;

  if (!envUrl || typeof envUrl !== "string" || !envUrl.startsWith("http")) {
    // Fallback: se não houver URL externa configurada, direciona para a seção #planos ou /login
    return "#planos";
  }

  try {
    const url = new URL(envUrl);
    if (searchParams) {
      for (const key of ALLOWED_TRACKING_KEYS) {
        const val = searchParams[key];
        if (typeof val === "string" && val.trim().length > 0) {
          url.searchParams.set(key, val.trim());
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string" && val[0].trim().length > 0) {
          url.searchParams.set(key, val[0].trim());
        }
      }
    }
    return url.toString();
  } catch {
    return envUrl;
  }
}
