"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Sparkles, ArrowRight, Brain, RefreshCw } from "lucide-react";
import { SalesCopilotDrawer } from "@/components/copilot/sales-copilot-drawer";
import { RetentionOpportunityCard } from "@/components/copilot/retention-opportunity-card";
import { MicroLearningPill } from "@/components/diagnostic/micro-learning-pill";
import { ValueDiagnosticModal } from "@/components/diagnostic/value-diagnostic-modal";
import { ValueDiagnosticResult } from "@/components/diagnostic/value-diagnostic-result";
import { trackCopilotUsage } from "@/app/action/copilot-actions";
import type { CopilotTemplate, DueRetentionItem } from "@/lib/copilot-types";
import type {
  MicroLearningPillUI,
  DiagnosticQuestionUI,
  ActiveValueDiagnosticUI,
} from "@/lib/value-diagnostic-types";

interface TodayInteractiveHubProps {
  workspaceId: string;
  dueRetentions: DueRetentionItem[];
  copilotTemplates: CopilotTemplate[];
  dailyPill: MicroLearningPillUI | null;
  diagnosticQuestions: DiagnosticQuestionUI[];
  activeDiagnostic: ActiveValueDiagnosticUI | null;
}

export function TodayInteractiveHub({
  workspaceId,
  dueRetentions,
  copilotTemplates,
  dailyPill,
  diagnosticQuestions,
  activeDiagnostic: initialDiagnostic,
}: TodayInteractiveHubProps) {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotCategory, setCopilotCategory] = useState<string>("price_too_high");
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [activeDiagnostic, setActiveDiagnostic] = useState<ActiveValueDiagnosticUI | null>(
    initialDiagnostic
  );

  const handleOpenCopilot = (category = "price_too_high") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    setCopilotCategory(category);
    setCopilotOpen(true);
  };

  const handleTrackCopilot = async (templateId: string, mode: "text" | "audio") => {
    const template = copilotTemplates.find((t) => t.id === templateId);
    if (!template) return;
    await trackCopilotUsage({
      templateId,
      category: template.objection_category,
      mode,
    });
  };

  return (
    <div className="space-y-6 mt-6">
      {/* 1. Seção: Retenção Biológica (Janela de Ouro D-5 a D-3) */}
      {dueRetentions.length > 0 && (
        <section aria-labelledby="retention-heading" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]">
                <RefreshCw className="size-3.5" />
              </span>
              <h2 id="retention-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                Janela de Ouro de Retorno ({dueRetentions.length})
              </h2>
            </div>
            <span className="text-xs text-[var(--color-ink-muted)]">
              Ciclo Biológico
            </span>
          </div>

          <div className="space-y-3">
            {dueRetentions.map((item) => (
              <RetentionOpportunityCard
                key={item.appointment_id}
                item={item}
                onOpenCopilot={handleOpenCopilot}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Seção: Diagnóstico de Percepção de Valor / Plano de 48 Horas */}
      {activeDiagnostic ? (
        <section aria-labelledby="diagnostic-active-heading" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
                <Brain className="size-3.5" />
              </span>
              <h2 id="diagnostic-active-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                Seu Plano de Alto Valor (48h)
              </h2>
            </div>
            <Link
              href="/diagnostic"
              className="text-xs font-bold text-[var(--color-action-primary)] hover:underline"
            >
              Ver detalhes
            </Link>
          </div>

          <ValueDiagnosticResult
            diagnostic={activeDiagnostic}
            workspaceId={workspaceId}
          />
        </section>
      ) : (
        <section aria-labelledby="diagnostic-cta-heading">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-[var(--shadow-card-resting)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-action-primary)]">
                <Brain className="size-3.5" />
                Diagnóstico de Valor
              </span>
              <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
                45 segundos
              </span>
            </div>

            <div>
              <h3 id="diagnostic-cta-heading" className="text-base font-bold text-[var(--color-ink-solid)]">
                Suas clientes estão achando seu serviço caro?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Descubra em 3 perguntas rápidas onde o seu valor está vazando e ative as 3 missões de 10 minutos para dobrar a percepção do seu trabalho sem dar desconto.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDiagnosticModalOpen(true)}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs hover:bg-[var(--color-action-hover)] transition-colors cursor-pointer"
            >
              <Sparkles className="size-4" />
              <span>Fazer Micro-Auditoria em 45s</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      )}

      {/* 3. Seção: Pílula de Café (Micro-Estudo de 1 minuto) */}
      {dailyPill && (
        <section aria-labelledby="coffee-pill-heading">
          <MicroLearningPill
            pill={dailyPill}
            workspaceId={workspaceId}
          />
        </section>
      )}

      {/* 4. Botão Flutuante Ergonômico: SOS Copiloto de Vendas */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => handleOpenCopilot("price_too_high")}
          aria-label="Abrir SOS Copiloto de Vendas"
          className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-[var(--color-action-primary)] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-action-hover)] transition-all active:scale-95 cursor-pointer border border-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-action-primary)] focus-visible:outline-none"
        >
          <ShieldAlert className="size-5" />
          <span>SOS Copiloto</span>
        </button>
      </div>

      {/* Modais e Drawers */}
      <SalesCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        templates={copilotTemplates}
        initialCategory={copilotCategory}
        onTrackUse={handleTrackCopilot}
        onOpenDiagnostic={() => setDiagnosticModalOpen(true)}
      />

      {diagnosticQuestions.length > 0 && (
        <ValueDiagnosticModal
          isOpen={diagnosticModalOpen}
          onClose={() => setDiagnosticModalOpen(false)}
          workspaceId={workspaceId}
          questions={diagnosticQuestions}
          onDiagnosticComplete={(data) => {
            setActiveDiagnostic(data);
          }}
        />
      )}
    </div>
  );
}
