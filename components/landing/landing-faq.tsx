"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { STRATEGIC_FAQS } from "./types";
import { trackFunnelEvent } from "@/lib/client-analytics";
import { cn } from "@/lib/utils";

export function LandingFaq() {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleFaq = (index: number, question: string) => {
    setOpenIndexes((prev) => {
      const nextState = !prev[index];
      if (nextState) {
        trackFunnelEvent("faq_item_toggled", { question });
      }
      return { ...prev, [index]: nextState };
    });
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-12 border-t border-[var(--color-border-subtle)] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-bold text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
          Dúvidas Comuns
        </span>
        <h2
          id="faq-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Perguntas Frequentes
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--color-ink-muted)] text-pretty">
          Tudo o que você precisa saber antes de dar seu próximo passo:
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-3xl space-y-3">
        {STRATEGIC_FAQS.map((faq, index) => {
          const isOpen = Boolean(openIndexes[index]);

          return (
            <div
              key={index}
              className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-xs overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(index, faq.q)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-[var(--color-surface-muted)]/50 transition-colors min-h-[52px]"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-action-primary)]" />
                  <span className="text-sm sm:text-base font-bold text-[var(--color-ink-solid)] leading-snug">
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-[var(--color-ink-muted)] transition-transform duration-200 mt-1",
                    isOpen && "rotate-180 text-[var(--color-action-primary)]"
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/30">
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
