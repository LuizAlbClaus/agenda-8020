"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Brain, RotateCcw } from "lucide-react";
import { ValueDiagnosticResult } from "@/components/diagnostic/value-diagnostic-result";
import { ValueDiagnosticModal } from "@/components/diagnostic/value-diagnostic-modal";
import type {
  ActiveValueDiagnosticUI,
  DiagnosticQuestionUI,
} from "@/lib/value-diagnostic-types";

interface DiagnosticClientViewProps {
  workspaceId: string;
  initialDiagnostic: ActiveValueDiagnosticUI | null;
  questions: DiagnosticQuestionUI[];
}

export function DiagnosticClientView({
  workspaceId,
  initialDiagnostic,
  questions,
}: DiagnosticClientViewProps) {
  const [activeDiagnostic, setActiveDiagnostic] = useState<ActiveValueDiagnosticUI | null>(
    initialDiagnostic
  );
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/today"
          className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar para o Hoje</span>
        </Link>

        {activeDiagnostic && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Refazer Auditoria</span>
          </button>
        )}
      </div>

      {activeDiagnostic ? (
        <ValueDiagnosticResult
          diagnostic={activeDiagnostic}
          workspaceId={workspaceId}
        />
      ) : (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-8 text-center space-y-4 shadow-[var(--shadow-card-resting)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
            <Brain className="size-6" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink-solid)]">
              Diagnóstico de Percepção de Valor
            </h1>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Descubra por que as clientes acham seu serviço caro ou hesitam na hora de agendar, e ative as missões de 10 minutos para valorizar seu trabalho.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-sm sm:text-base font-bold text-white shadow-xs hover:bg-[var(--color-action-hover)] transition-colors cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>Iniciar Micro-Auditoria em 45s</span>
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <ValueDiagnosticModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          workspaceId={workspaceId}
          questions={questions}
          onDiagnosticComplete={(data) => {
            setActiveDiagnostic(data);
          }}
        />
      )}
    </div>
  );
}
