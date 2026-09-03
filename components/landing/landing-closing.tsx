"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";
import type { LandingVariant } from "./types";

interface LandingClosingProps {
  variant: LandingVariant;
}

export function LandingClosing({ variant }: LandingClosingProps) {
  const handleClick = () => {
    trackFunnelEvent("closing_cta_clicked", { variant });
  };

  return (
    <section
      aria-labelledby="closing-heading"
      className="border-t border-[var(--color-border-subtle)] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border-2 border-[var(--color-action-primary)]/30 bg-[var(--color-surface-card)] p-8 sm:p-14 text-center shadow-[var(--shadow-card-elevated)]">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-action-primary)]">
          <Sparkles className="size-3.5" />
          Foco Total · 1 Ação de Cada Vez
        </span>

        <p className="mt-4 text-base sm:text-lg font-bold text-[var(--color-ink-muted)]">
          Você não precisa sair daqui com mais 20 coisas para fazer.
        </p>

        <h2
          id="closing-heading"
          className="mt-2 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl lg:text-5xl"
        >
          Precisa sair sabendo qual é a próxima.
        </h2>

        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed text-pretty">
          Chega de paralisia por excesso de ideias. Abra o aplicativo, descubra o movimento prioritário para o seu momento e dê o próximo passo com segurança.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <Link
            href="#oferta"
            onClick={handleClick}
            className="inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-8 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] active:scale-98"
          >
            <span>Montar meu primeiro plano</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Apenas R$ 147 à vista ou 12x de R$ 15,19 · 12 meses de acesso
          </p>
        </div>
      </div>
    </section>
  );
}
