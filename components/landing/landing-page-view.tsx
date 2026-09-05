"use client";

import { useEffect } from "react";
import type { LandingVariant } from "./types";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingProblem } from "./landing-problem";
import { LandingMechanism } from "./landing-mechanism";
import { LandingScenarios } from "./landing-scenarios";
import { LandingDemo } from "./landing-demo";
import { LandingModules } from "./landing-modules";
import { LandingJourney } from "./landing-journey";
import { LandingPositioning } from "./landing-positioning";
import { LandingAudienceFit } from "./landing-audience-fit";
import { LandingOffer } from "./landing-offer";
import { LandingBelevy } from "./landing-belevy";
import { LandingFaq } from "./landing-faq";
import { LandingClosing } from "./landing-closing";
import { LandingFooter } from "./landing-footer";
import { LandingStickyCta } from "./landing-sticky-cta";
import { UpsellView } from "@/components/upsell/upsell-view";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface LandingPageViewProps {
  variant: LandingVariant;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LandingPageView({ variant, searchParams }: LandingPageViewProps) {
  useEffect(() => {
    trackFunnelEvent("landing_page_view", { variant });
    trackFunnelEvent("landing_variant_viewed", { variant });
  }, [variant]);

  if (variant === "soft-gel") {
    return <UpsellView searchParams={searchParams} />;
  }

  return (
    <main className="min-h-screen bg-[#FBF9F5] text-slate-900 selection:bg-[#FEECE6] selection:text-[#0C2A26]">
      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Top Navigation Bar with Logo & Login */}
        <LandingHeader />

        {/* 01 • Hero Section (1.png) */}
        <LandingHero variant={variant} searchParams={searchParams} />

        {/* 1. Variante COLD (Direct Response / Tráfego Frio) — Sequência canônica idêntica às referências */}
        {variant === "cold" && (
          <>
            {/* 02 • O Problema (2.png) */}
            <LandingProblem />

            {/* 03 • Mecanismo 80/20 (3.png) */}
            <LandingMechanism />

            {/* 04 • Situações Reais (4.png) */}
            <LandingScenarios />

            {/* 05 • Demonstração (5.png) */}
            <LandingDemo />

            {/* 06 • Módulos (6.png) */}
            <LandingModules />

            {/* 07 • Jornada Completa (7.png) */}
            <LandingJourney />

            {/* 08 • Feito para a Vida Real (8.png) */}
            <LandingPositioning />

            {/* 09 • Para Quem É (9.png) */}
            <LandingAudienceFit />

            {/* 10 • Oferta & Belevy (10.png) */}
            <LandingOffer searchParams={searchParams} />
            <LandingBelevy />

            {/* 11 • Dúvidas & Fechamento (11.png) */}
            <LandingFaq />
            <LandingClosing variant="cold" />
          </>
        )}

        {/* 2. Variante ORGANIC (Audiência Aquecida) */}
        {variant === "organic" && (
          <>
            <LandingMechanism />
            <LandingScenarios />
            <LandingDemo />
            <LandingModules />
            <LandingPositioning />
            <LandingOffer searchParams={searchParams} />
            <LandingBelevy />
            <LandingFaq />
            <LandingClosing variant="organic" />
          </>
        )}

        <div className="px-4 pb-12">
          <LandingFooter />
        </div>
      </div>

      {/* Barra flutuante de conversão mobile */}
      <LandingStickyCta />
    </main>
  );
}
