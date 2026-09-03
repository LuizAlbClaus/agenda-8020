"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react";
import { type LandingVariant, VARIANT_HERO_DATA } from "./types";
import { trackFunnelEvent } from "@/lib/client-analytics";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  variant: LandingVariant;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LandingHero({ variant }: LandingHeroProps) {
  const config = VARIANT_HERO_DATA[variant] ?? VARIANT_HERO_DATA.cold;
  const [scriptMode, setScriptMode] = useState<"text" | "audio">("text");
  const [copied, setCopied] = useState(false);

  const handleCtaClick = () => {
    trackFunnelEvent("hero_cta_clicked", { variant });
  };

  const handleCopyScript = () => {
    const textToCopy =
      scriptMode === "text" ? config.heroMockupTextScript : config.heroMockupAudioScript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    trackFunnelEvent("demo_script_copied", { source: "hero_mockup", mode: scriptMode });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="grid gap-10 pb-16 pt-8 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
      {/* Left Column: Core Positioning Copy & Primary CTA */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--color-action-primary)] border border-[var(--color-action-primary)]/20">
          <Zap className="size-3.5 fill-current" aria-hidden="true" />
          <span>{config.eyebrow}</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] text-balance text-[var(--color-ink-solid)] sm:text-5xl lg:text-6xl">
          {config.headline}
        </h1>

        <p className="mt-4 text-xl font-bold tracking-tight text-[var(--color-action-primary)] sm:text-2xl text-balance">
          {config.supportingHeadline}
        </p>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg sm:leading-8">
          {config.subheadline}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="#oferta"
            onClick={handleCtaClick}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-8 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] active:scale-98"
          >
            <span>{config.primaryCta}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)] sm:text-sm">
            <span className="size-2 shrink-0 rounded-full bg-[var(--color-revenue-primary)]" />
            <span>{config.microcopy}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Realistic Interface Representation of "Próximo Movimento" */}
      <div className="w-full">
        <div
          aria-label="Interface do Agenda 80/20 em funcionamento"
          className="overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-card)] shadow-[var(--shadow-card-elevated)]"
        >
          {/* Top Status Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-2 rounded-full bg-[var(--color-action-primary)] animate-pulse" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-[var(--color-ink-solid)]">
                  Seu próximo movimento está pronto
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)]">
                  Calibrado para o seu momento real
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-revenue-primary)]">
              <Sparkles className="size-3" aria-hidden="true" />
              Decisão Tomada
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Box: Seu Foco Agora */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-3.5 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Seu foco agora
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-[var(--color-ink-solid)] leading-snug">
                {config.heroMockupFocus}
              </p>
            </div>

            {/* Main Action Block */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-ink-solid)]">
                  <Clock3 className="size-3.5 text-[var(--color-action-primary)]" aria-hidden="true" />
                  <span>{config.heroMockupDuration} min estimados</span>
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-revenue-primary)]">
                  ✓ 1 ação de alto impacto
                </span>
              </div>

              <h2 className="mt-3 text-base sm:text-lg font-bold text-[var(--color-ink-solid)] leading-snug text-balance">
                {config.heroMockupTitle}
              </h2>

              {/* Por que agora */}
              <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3 text-xs leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[var(--color-action-primary)] text-[10px]">
                  Por que agora?
                </p>
                <p className="mt-1 text-[var(--color-ink-muted)]">
                  {config.heroMockupWhyNow}
                </p>
              </div>

              {/* 3 Passos */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                  Como executar:
                </p>
                <ol className="space-y-1.5 text-xs text-[var(--color-ink-solid)]">
                  {config.heroMockupSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-[10px] font-bold text-white mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-tight">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Roteiro de WhatsApp com abas Texto / Áudio */}
              <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Roteiro pronto para WhatsApp:
                  </p>
                  <div className="inline-flex p-0.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setScriptMode("text")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold transition-all cursor-pointer",
                        scriptMode === "text"
                          ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                          : "text-[var(--color-ink-muted)]"
                      )}
                    >
                      Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptMode("audio")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                        scriptMode === "audio"
                          ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                          : "text-[var(--color-ink-muted)]"
                      )}
                    >
                      <Mic className="size-2.5" />
                      <span>Áudio</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-2.5 text-xs text-[var(--color-ink-solid)] leading-relaxed font-sans">
                  {scriptMode === "text" ? (
                    <p className="italic select-all">“{config.heroMockupTextScript}”</p>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-action-primary)] mb-1">
                        🎙️ Guia de Áudio (~20s) · Fale com voz calorosa e sem afobação:
                      </p>
                      <p className="italic select-all">“{config.heroMockupAudioScript}”</p>
                    </div>
                  )}
                </div>

                {/* Micro Action Buttons */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-3.5 text-xs font-bold text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-[var(--color-revenue-primary)]" />
                        <span className="text-[var(--color-revenue-primary)]">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 text-[var(--color-ink-muted)]" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>

                  <span className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-4 text-xs font-bold text-white shadow-xs">
                    <span>Fazer essa ação</span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
