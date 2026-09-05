"use client";

import { useState } from "react";
import { getCheckoutUrl } from "@/lib/checkout";
import { UpsellTracker } from "./upsell-tracker";
import { UpsellProgressHeader } from "./upsell-progress-header";
import { UpsellStickyCta } from "./upsell-sticky-cta";
import { UpsellHero } from "./upsell-hero";
import { UpsellGap } from "./upsell-gap";
import { UpsellMechanismDemo } from "./upsell-mechanism-demo";
import { UpsellPsychologyPlan } from "./upsell-psychology-plan";
import { UpsellOffer } from "./upsell-offer";
import { UpsellFaq } from "./upsell-faq";
import { UpsellClosing } from "./upsell-closing";
import { UpsellDownsellBottomSheet } from "./upsell-downsell-bottom-sheet";
import { LandingFooter } from "@/components/landing/landing-footer";

interface UpsellViewProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export function UpsellView({ searchParams }: UpsellViewProps) {
  // Resolve Cakto annual checkout URL (Upsell) and semiannual checkout URL (Downsell) with UTMs
  const checkoutUrl = getCheckoutUrl("annual", searchParams);
  const semiannualCheckoutUrl = getCheckoutUrl("semiannual", searchParams);

  // Build decline URL preserving query strings pointing to Flavia Claus official thank you page
  const BASE_THANK_YOU_URL =
    process.env.NEXT_PUBLIC_SOFT_GEL_THANK_YOU_URL ||
    "https://flaviaclaus.com.br/obrigado-soft-gel";

  const declineParams = new URLSearchParams();
  if (searchParams && Object.keys(searchParams).length > 0) {
    for (const [key, val] of Object.entries(searchParams)) {
      if (typeof val === "string" && val.trim().length > 0) {
        declineParams.set(key, val.trim());
      } else if (
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === "string" &&
        val[0].trim().length > 0
      ) {
        declineParams.set(key, val[0].trim());
      }
    }
  }
  const queryString = declineParams.toString();
  const declineUrl = queryString ? `${BASE_THANK_YOU_URL}?${queryString}` : BASE_THANK_YOU_URL;

  const [isDownsellOpen, setIsDownsellOpen] = useState(false);

  // Extract buyer's first name if available to personalize experience
  const rawName =
    typeof searchParams?.name === "string"
      ? searchParams.name
      : Array.isArray(searchParams?.name) && typeof searchParams.name[0] === "string"
      ? searchParams.name[0]
      : undefined;
  const userName = rawName ? rawName.trim().split(" ")[0] : undefined;

  return (
    <main className="min-h-screen bg-[#FBF9F5] text-slate-900 selection:bg-[#FEECE6] selection:text-[#0C2A26]">
      {/* Telemetry on mount */}
      <UpsellTracker source="soft-gel-post-purchase" variant="soft-gel" />

      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl overflow-hidden shadow-2xl bg-[#FBF9F5]">
        {/* PROGRESS HEADER — STATUS DO PEDIDO CONFIRMADO & ETAPA PÓS-COMPRA */}
        <UpsellProgressHeader />

        {/* SEÇÃO 1 — HERO DE INTERRUPÇÃO PÓS-COMPRA & CTA PRIMÁRIO */}
        <UpsellHero checkoutUrl={checkoutUrl} />

        {/* SEÇÃO 2 — O GAP: TÉCNICA (SGE) + DIREÇÃO (AGENDA 80/20) */}
        <UpsellGap />

        {/* SEÇÃO 3 — DEMONSTRAÇÃO DO MECANISMO: 1 MOCKUP GRANDE DA EXPERIÊNCIA */}
        <UpsellMechanismDemo userName={userName} />

        {/* SEÇÃO 4 — DO 'DEPOIS EU VEJO' PARA UM PLANO: PSICOLOGIA DA DECISÃO */}
        <UpsellPsychologyPlan />

        {/* SEÇÃO 5 — OFERTA: CARD ÚNICO CONCENTRADO, PREÇO REAL E 7 DIAS DE GARANTIA */}
        <UpsellOffer checkoutUrl={checkoutUrl} />

        {/* SEÇÃO 6 — AS 4 OBJEÇÕES ESSENCIAIS */}
        <UpsellFaq />

        {/* SEÇÃO 7 — FECHAMENTO DA JORNADA, CTA FINAL E LINK DE RECUSA COM DOWNSELL */}
        <UpsellClosing
          checkoutUrl={checkoutUrl}
          declineUrl={declineUrl}
          onOpenDownsell={() => setIsDownsellOpen(true)}
        />

        {/* Rodapé Institucional */}
        <div className="bg-[#0C2A26] px-4 pb-16 pt-2 border-t border-white/10 text-white">
          <LandingFooter />
        </div>
      </div>

      {/* BARRA FLUTUANTE DE CHECKOUT MOBILE (STICKY BOTTOM ERGONÔMICA) */}
      <UpsellStickyCta checkoutUrl={checkoutUrl} isHidden={isDownsellOpen} />

      {/* BOTTOM SHEET MOBILE DE DOWNSELL (R$ 97 / 6 MESES) */}
      <UpsellDownsellBottomSheet
        isOpen={isDownsellOpen}
        onClose={() => setIsDownsellOpen(false)}
        checkoutUrl={semiannualCheckoutUrl}
        finalAccessUrl={declineUrl}
      />
    </main>
  );
}
