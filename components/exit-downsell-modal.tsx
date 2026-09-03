"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { CHECKOUT_PLANS, getCheckoutUrl } from "@/lib/checkout";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface ExitDownsellModalProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export function ExitDownsellModal({ searchParams }: ExitDownsellModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const semiannualUrl = getCheckoutUrl("semiannual", searchParams);
  const semiannualPlan = CHECKOUT_PLANS.semiannual;

  const handleOpen = () => {
    trackFunnelEvent("downsell_modal_opened");
    setIsOpen(true);
  };

  const handleCheckoutClick = () => {
    trackFunnelEvent("downsell_checkout_clicked", { plan: "semiannual", price: 97 });
  };

  return (
    <>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleOpen}
          className="text-xs font-semibold text-[var(--color-ink-muted)] underline decoration-[var(--color-border-strong)] underline-offset-4 hover:text-[var(--color-ink-solid)] transition-colors cursor-pointer"
        >
          Prefere validar por um período menor? Veja a opção de 6 meses por R$ 97.
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="downsell-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-8 shadow-[var(--shadow-card-elevated)]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar modal"
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-solid)] transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-action-primary)]">
                <Sparkles className="size-3.5" />
                Opção de Entrada
              </span>
            </div>

            <h3
              id="downsell-modal-title"
              className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ink-solid)]"
            >
              Comece com o Plano Semestral
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              180 dias de acesso com todas as ferramentas de priorização diária, scripts de WhatsApp e 30 dias de Belevy inclusos para validar no seu ritmo.
            </p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-ink-solid)]">
                {semiannualPlan.priceFormatted}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] font-medium">
                {semiannualPlan.billingFrequency}
              </span>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-[var(--color-border-subtle)] pt-4 text-xs sm:text-sm text-[var(--color-ink-solid)]">
              {semiannualPlan.features.slice(0, 5).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <Check className="size-4 text-[var(--color-revenue-primary)] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href={semiannualUrl}
                onClick={handleCheckoutClick}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
              >
                <span>Aproveitar Plano Semestral por R$ 97</span>
                <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] py-1 cursor-pointer"
              >
                Voltar para o Plano Anual (mais econômico)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
