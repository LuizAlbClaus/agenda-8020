"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Mic,
  Zap,
} from "lucide-react";
import { DEMO_SITUATIONS, type DemoSituation } from "./types";
import { trackFunnelEvent } from "@/lib/client-analytics";
import { cn } from "@/lib/utils";

export function LandingDemo() {
  const [selectedId, setSelectedId] = useState<string>("first_clients");
  const [scriptMode, setScriptMode] = useState<"text" | "audio">("text");
  const [copied, setCopied] = useState(false);

  const current: DemoSituation =
    DEMO_SITUATIONS.find((s) => s.id === selectedId) ?? DEMO_SITUATIONS[0];

  const handleSelectSituation = (id: string) => {
    setSelectedId(id);
    trackFunnelEvent("demo_situation_changed", { situation_id: id });
  };

  const handleCopy = () => {
    const content = scriptMode === "text" ? current.textScript : current.audioScript;
    navigator.clipboard.writeText(content);
    setCopied(true);
    trackFunnelEvent("demo_script_copied", {
      source: "interactive_demo",
      situation_id: current.id,
      mode: scriptMode,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="demonstracao"
      aria-labelledby="demo-heading"
      className="scroll-mt-12 border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
          Demonstração Interativa
        </span>
        <h2
          id="demo-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Veja como seriam seus primeiros minutos no Agenda 80/20.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Selecione a sua situação atual e veja como o sistema reorganiza a prioridade, explica o motivo e entrega os passos práticos:
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-5xl grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        {/* Left Column: Situation Selector */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] px-1">
            Qual dessas situações mais parece com você hoje?
          </p>

          <div className="space-y-2.5" role="radiogroup" aria-label="Situações do seu negócio">
            {DEMO_SITUATIONS.map((situation) => {
              const isSelected = situation.id === current.id;
              return (
                <button
                  key={situation.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectSituation(situation.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-[var(--radius-card)] border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[52px]",
                    isSelected
                      ? "border-2 border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] shadow-xs"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] hover:border-[var(--color-border-strong)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                        isSelected
                          ? "border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-white"
                          : "border-[var(--color-border-strong)] bg-white text-transparent"
                      )}
                    >
                      ✓
                    </span>
                    <div>
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-bold",
                          isSelected
                            ? "text-[var(--color-action-primary)]"
                            : "text-[var(--color-ink-solid)]"
                        )}
                      >
                        {situation.label}
                      </p>
                      <span className="text-[10px] text-[var(--color-ink-muted)]">
                        {situation.badge}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      isSelected
                        ? "text-[var(--color-action-primary)] translate-x-1"
                        : "text-[var(--color-ink-muted)] opacity-50"
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-3.5 border border-[var(--color-border-subtle)] text-xs text-[var(--color-ink-muted)]">
            💡 <strong>Sem adivinhação:</strong> Na vida real, o Agenda 80/20 aprende suas respostas no primeiro check-in rápido de 2 minutos.
          </div>
        </div>

        {/* Right Column: Reactive Product Interface Showcase */}
        <div className="overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-card)] shadow-[var(--shadow-card-elevated)]">
          {/* Top Bar of the App Mockup */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-[var(--color-revenue-primary)]" />
              <span className="text-xs font-bold text-[var(--color-ink-solid)]">
                Painel Hoje · Simulação
              </span>
            </div>
            <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-white px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-action-primary)] border border-[var(--color-border-subtle)] shadow-xs">
              {current.serviceExample}
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Focus Card */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-3 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Seu foco agora
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-[var(--color-ink-solid)] leading-snug">
                {current.currentFocus}
              </p>
            </div>

            {/* Action Card */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                  <Zap className="size-3" />
                  Próxima ação recomendada
                </span>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-ink-muted)]">
                  <Clock3 className="size-3" />
                  {current.durationMinutes} min
                </span>
              </div>

              <h3 className="mt-3 text-base sm:text-lg font-bold text-[var(--color-ink-solid)] leading-snug">
                {current.actionTitle}
              </h3>

              {/* Por que agora */}
              <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3 text-xs leading-relaxed">
                <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--color-action-primary)]">
                  Por que agora:
                </p>
                <p className="mt-0.5 text-[var(--color-ink-muted)]">
                  {current.whyNow}
                </p>
              </div>

              {/* 3 Passos */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                  Passo a passo recomendado:
                </p>
                <ol className="space-y-1.5 text-xs text-[var(--color-ink-solid)]">
                  {current.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-[10px] font-bold text-white mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Roteiro com abas Texto / Áudio */}
              <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Sugestão de mensagem para WhatsApp:
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

                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3 text-xs leading-relaxed font-sans">
                  {scriptMode === "text" ? (
                    <p className="italic text-[var(--color-ink-solid)] select-all">
                      “{current.textScript}”
                    </p>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-action-primary)] mb-1">
                        🎙️ Roteiro de Áudio (~{current.audioSeconds}s) · Tom: {current.audioTone}
                      </p>
                      <p className="italic text-[var(--color-ink-solid)] select-all">
                        “{current.audioScript}”
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--color-revenue-primary)] font-medium truncate">
                    ✓ {current.outcomeNote}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-4 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-action-hover)] transition-all cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-white" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
