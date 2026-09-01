"use client";

import * as React from "react";
import { Brain, HelpCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PsychologicalRationaleCardProps {
  clientSubtext: string;
  rationale: string;
  defaultOpen?: boolean;
}

export function PsychologicalRationaleCard({
  clientSubtext,
  rationale,
  defaultOpen = false,
}: PsychologicalRationaleCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggleOpen = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] overflow-hidden transition-all duration-200">
      {/* Botão de Revelação Progressiva (Progressive Disclosure) */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="psychological-rationale-body"
        id="psychological-rationale-toggle"
        className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer hover:bg-[var(--color-action-primary)]/5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-card)]"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-action-primary)]/15 text-[var(--color-action-primary)]">
            <Brain className="size-3.5" />
          </span>
          <span className="text-xs font-bold text-[var(--color-action-primary)]">
            {isOpen ? "Ocultar lógica psicológica" : "💡 Por que essa mensagem funciona? (toque para ver)"}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="size-4 text-[var(--color-action-primary)]" />
        ) : (
          <ChevronDown className="size-4 text-[var(--color-action-primary)]" />
        )}
      </button>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <div
          id="psychological-rationale-body"
          role="region"
          aria-labelledby="psychological-rationale-toggle"
          className="px-4 pb-4 pt-1 space-y-3 border-t border-[var(--color-action-primary)]/15 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
              <HelpCircle className="size-3.5" />
              O que a cliente realmente sente
            </span>
            <p className="mt-1 text-xs sm:text-sm font-semibold italic text-[var(--color-ink-solid)]">
              &ldquo;{clientSubtext}&rdquo;
            </p>
          </div>

          <div className="border-t border-[var(--color-action-primary)]/15 pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              <Sparkles className="size-3.5 text-[var(--color-action-primary)]" />
              A psicologia por trás do texto
            </span>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed text-pretty">
              {rationale}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
