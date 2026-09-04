import { getCheckoutUrl } from "@/lib/checkout";
import { UpsellTracker } from "./upsell-tracker";
import { UpsellProgressHeader } from "./upsell-progress-header";
import { UpsellStickyCta } from "./upsell-sticky-cta";
import { UpsellHero } from "./upsell-hero";
import { UpsellGap } from "./upsell-gap";
import { UpsellBridge } from "./upsell-bridge";
import { UpsellPhases } from "./upsell-phases";
import { UpsellInteractiveDemo } from "./upsell-interactive-demo";
import { UpsellConcreteAction } from "./upsell-concrete-action";
import { UpsellSystemHub } from "./upsell-system-hub";
import { UpsellRealLife } from "./upsell-real-life";
import { UpsellJourneyBooking } from "./upsell-journey-booking";
import { UpsellOfferClosing } from "./upsell-offer-closing";
import { LandingFooter } from "@/components/landing/landing-footer";

interface UpsellViewProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export function UpsellView({ searchParams }: UpsellViewProps) {
  // Resolve Cakto annual checkout URL with UTM preservation
  const checkoutUrl = getCheckoutUrl("annual", searchParams);

  // Build decline URL preserving query strings
  let declineUrl = "/checkout/sucesso";
  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams)) {
      if (typeof val === "string") {
        params.set(key, val);
      } else if (Array.isArray(val) && typeof val[0] === "string") {
        params.set(key, val[0]);
      }
    }
    declineUrl = `/checkout/sucesso?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-[#FBF9F5] text-slate-900 selection:bg-[#FEECE6] selection:text-[#0C2A26]">
      {/* Telemetry on mount */}
      <UpsellTracker source="soft-gel-post-purchase" variant="soft-gel" />

      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl overflow-hidden shadow-2xl bg-[#FBF9F5]">
        {/* BARRA DE PROGRESSO & TIMER OTO REGRESSIVO */}
        <UpsellProgressHeader />

        {/* SEÇÃO 1 — HERO DE INTERRUPÇÃO PÓS-COMPRA (1.png) */}
        <UpsellHero checkoutUrl={checkoutUrl} />

        {/* SEÇÃO 2 — A LACUNA ENTRE APRENDER E COMEÇAR (2.png) */}
        <UpsellGap />

        {/* SEÇÃO 3 — A PONTE ENTRE OS DOIS PRODUTOS (3.png) */}
        <UpsellBridge />

        {/* SEÇÃO 4 — O AGENDA ACOMPANHA A FASE DA PROFISSIONAL (4.png) */}
        <UpsellPhases />

        {/* SEÇÃO 5 — DEMONSTRAÇÃO INTERATIVA DO ONBOARDING (5.png) */}
        <UpsellInteractiveDemo checkoutUrl={checkoutUrl} />

        {/* SEÇÃO 6 — UMA PRIMEIRA AÇÃO CONCRETA (6.png) */}
        <UpsellConcreteAction />

        {/* SEÇÃO 7 — O QUE ACONTECE QUANDO NOVAS SITUAÇÕES APARECEM (7.png) */}
        <UpsellSystemHub />

        {/* SEÇÃO 8 — USO NA VIDA REAL (8.png) */}
        <UpsellRealLife />

        {/* SEÇÃO 9 — DA TÉCNICA À PRIMEIRA OPORTUNIDADE (9.png) */}
        <UpsellJourneyBooking />

        {/* SEÇÃO 10 — OFERTA, BELEVY, FAQ E FECHAMENTO (10.png) */}
        <UpsellOfferClosing checkoutUrl={checkoutUrl} declineUrl={declineUrl} />

        {/* Legal & Brand Footer */}
        <div className="bg-[#0C2A26] px-4 pb-12 pt-2 border-t border-white/10 text-white">
          <LandingFooter />
        </div>
      </div>

      {/* BARRA FLUTUANTE DE CHECKOUT MOBILE (STICKY BOTTOM) */}
      <UpsellStickyCta checkoutUrl={checkoutUrl} />
    </main>
  );
}
