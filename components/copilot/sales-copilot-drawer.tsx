"use client";

import * as React from "react";
import { ShieldAlert, X, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScriptModeToggle, type ScriptMode } from "./script-mode-toggle";
import { AudioTeleprompter } from "./audio-teleprompter";
import { PsychologicalRationaleCard } from "./psychological-rationale-card";
import type { CopilotTemplate } from "@/lib/copilot-types";

interface SalesCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CopilotTemplate[];
  onTrackUse?: (templateId: string, mode: ScriptMode) => void;
  onOpenDiagnostic?: () => void;
  initialCategory?: string;
}

export function SalesCopilotDrawer({
  isOpen,
  onClose,
  templates,
  onTrackUse,
  onOpenDiagnostic,
  initialCategory = "price_too_high",
}: SalesCopilotDrawerProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(() => {
    const initial = templates.find((t) => t.objection_category === initialCategory);
    return initial ? initial.id : null;
  });
  const [mode, setMode] = React.useState<ScriptMode>("text");
  const [copied, setCopied] = React.useState(false);

  // Filtra templates pela categoria selecionada
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => t.objection_category === selectedCategory);
  }, [templates, selectedCategory]);

  const activeTemplate = React.useMemo(() => {
    if (selectedTemplateId) {
      const found = filteredTemplates.find((t) => t.id === selectedTemplateId);
      if (found) return found;
    }
    return filteredTemplates[0] || null;
  }, [filteredTemplates, selectedTemplateId]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyText = async () => {
    if (!activeTemplate) return;
    try {
      await navigator.clipboard.writeText(activeTemplate.script_text);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(25);
        } catch {}
      }
      setCopied(true);
      onTrackUse?.(activeTemplate.id, "text");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl mx-auto rounded-t-[20px] bg-[var(--color-surface-card)] border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-card-elevated)] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="copilot-drawer-title"
      >
        {/* Handle / Grab Bar */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[var(--color-border-strong)] opacity-60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-[var(--radius-sm)] bg-[var(--color-action-subtle)] flex items-center justify-center text-[var(--color-action-primary)]">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <h2 id="copilot-drawer-title" className="text-base font-bold text-[var(--color-ink-solid)] leading-tight">
                SOS Copiloto de Vendas
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Destrave objeções no WhatsApp sem medo de vender
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar copiloto"
            className="size-10 rounded-full flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Categorias de Objeção (Pills horizontais) */}
        <div
          role="tablist"
          aria-label="Categorias de Objeção"
          className="flex items-center gap-2 px-5 py-3 overflow-x-auto border-b border-[var(--color-border-subtle)] scrollbar-none"
        >
          {[
            { id: "price_too_high", label: "Achei Caro" },
            { id: "procrastination", label: "Vou Ver e Te Aviso" },
            { id: "third_party_decision", label: "Ver com Marido" },
            { id: "just_browsing", label: "Só o Preço" },
          ].map((cat) => (
            <button
              key={cat.id}
              role="tab"
              id={`tab-${cat.id}`}
              aria-selected={selectedCategory === cat.id}
              aria-controls="copilot-tab-content"
              onClick={() => {
                setSelectedCategory(cat.id);
                const next = templates.find((t) => t.objection_category === cat.id);
                setSelectedTemplateId(next ? next.id : null);
              }}
              className={cn(
                "min-h-[44px] px-4 py-2 rounded-[var(--radius-pill)] text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)]",
                selectedCategory === cat.id
                  ? "bg-[var(--color-action-primary)] text-white border-[var(--color-action-primary)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div
          id="copilot-tab-content"
          role="tabpanel"
          aria-labelledby={`tab-${selectedCategory}`}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {selectedCategory === "price_too_high" && onOpenDiagnostic && (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/40 bg-[var(--color-opportunity-subtle)] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--color-opportunity-primary)] shrink-0" />
                <p className="text-xs text-[var(--color-ink-solid)] font-medium leading-tight">
                  Clientes achando caro com frequência?
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDiagnostic();
                }}
                className="shrink-0 px-3 py-1.5 rounded-[var(--radius-pill)] bg-white text-[var(--color-opportunity-primary)] border border-[var(--color-opportunity-primary)]/40 text-xs font-bold shadow-xs hover:bg-[var(--color-opportunity-primary)] hover:text-white transition-colors cursor-pointer"
              >
                Micro-Auditoria 45s
              </button>
            </div>
          )}

          {activeTemplate ? (
            <>
              {/* Card de Desconstrução Psicológica */}
              <PsychologicalRationaleCard
                clientSubtext={activeTemplate.client_subtext}
                rationale={activeTemplate.psychological_rationale}
              />

              {/* Segmented Control: Texto vs Áudio */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                  Como você quer enviar?
                </span>
                <ScriptModeToggle mode={mode} onChange={setMode} />
              </div>

              {/* Conteúdo do Roteiro */}
              {mode === "text" ? (
                <div className="space-y-3">
                  <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-4 text-sm font-mono leading-relaxed text-[var(--color-ink-solid)] select-all">
                    &ldquo;{activeTemplate.script_text}&rdquo;
                  </div>

                  <Button
                    onClick={handleCopyText}
                    variant={copied ? "revenue" : "primary"}
                    fullWidth
                    className="min-h-[48px] text-sm font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        <span>Copiado com sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        <span>Copiar Mensagem Pronta</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <AudioTeleprompter
                  script={activeTemplate.script_audio}
                  durationSeconds={activeTemplate.audio_duration_seconds}
                  toneGuide={activeTemplate.audio_tone_guide}
                  onDone={() => onTrackUse?.(activeTemplate.id, "audio")}
                />
              )}
            </>
          ) : (
            <p className="text-center text-sm text-[var(--color-ink-muted)] py-8">
              Nenhum template disponível para esta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
