"use client";

import { useEffect } from "react";
import type { LandingVariant } from "./types";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingProblem } from "./landing-problem";
import { LandingMechanism } from "./landing-mechanism";
import { LandingScenarios } from "./landing-scenarios";
import { LandingDemo } from "./landing-demo";
import { LandingSoftGelBridge } from "./landing-softgel-bridge";
import { LandingModules } from "./landing-modules";
import { LandingJourney } from "./landing-journey";
import { LandingPositioning } from "./landing-positioning";
import { LandingAudienceFit } from "./landing-audience-fit";
import { LandingOffer } from "./landing-offer";
import { LandingBelevy } from "./landing-belevy";
import { LandingFaq } from "./landing-faq";
import { LandingClosing } from "./landing-closing";
import { LandingFooter } from "./landing-footer";
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

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink-solid)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10">
        <LandingHeader />

        {/* Hero Section — Core protagonista do Próximo Movimento */}
        <LandingHero variant={variant} searchParams={searchParams} />

        {/* 1. Variante COLD (Direct Response / Tráfego Frio) — Versão mais completa */}
        {variant === "cold" && (
          <>
            <LandingProblem />
            <LandingMechanism />
            <LandingScenarios />
            <LandingDemo />
            <LandingModules />
            <LandingJourney />
            <LandingPositioning />
            <LandingAudienceFit />
            <LandingOffer searchParams={searchParams} />
            <LandingBelevy />
            <LandingFaq />
            <LandingClosing variant="cold" />
          </>
        )}

        {/* 2. Variante SOFT-GEL (Upsell Soft Gel Express) — Foco em continuidade técnica */}
        {variant === "soft-gel" && (
          <>
            <LandingSoftGelBridge />
            <LandingMechanism />
            <LandingDemo />
            <LandingModules />
            <LandingOffer searchParams={searchParams} />
            <LandingFaq />
            <LandingClosing variant="soft-gel" />
          </>
        )}

        {/* 3. Variante ORGANIC (Audiência Aquecida) — Foco direto no app e decisão */}
        {variant === "organic" && (
          <>
            <LandingMechanism />
            <LandingScenarios />
            <LandingDemo />
            <LandingModules />
            <LandingPositioning />
            <LandingOffer searchParams={searchParams} />
            <LandingFaq />
            <LandingClosing variant="organic" />
          </>
        )}

        <LandingFooter />
      </div>
    </main>
  );
}
