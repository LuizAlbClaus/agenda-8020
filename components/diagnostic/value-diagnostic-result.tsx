"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveValueDiagnosticUI } from "@/lib/value-diagnostic-types";
import { completeValueActionMission } from "@/app/diagnostic/actions";

interface ValueDiagnosticResultProps {
  diagnostic: ActiveValueDiagnosticUI;
  workspaceId: string;
}

export function ValueDiagnosticResult({ diagnostic, workspaceId }: ValueDiagnosticResultProps) {
  const [missions, setMissions] = useState(diagnostic.missions);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(
    missions.length > 0 ? missions[0].action_id : null
  );
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleMissionComplete = (actionId: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    startTransition(async () => {
      const res = await completeValueActionMission({
        workspaceId,
        actionId,
      });

      if (res.ok) {
        setMissions((prev) =>
          prev.map((m) =>
            m.action_id === actionId
              ? { ...m, status: m.status === "completed" ? "not_started" : "completed" }
              : m
          )
        );
      }
    });
  };

  const handleCopyScript = async (actionId: string, scriptText: string) => {
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopiedScriptId(actionId);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setTimeout(() => setCopiedScriptId(null), 3000);
    } catch {}
  };

  const completedCount = missions.filter((m) => m.status === "completed").length;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* 1. Card de Boas-Vindas Empáticas (Zero Culpa) */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]">
            <CheckCircle2 className="size-4" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Diagnóstico de Valor Concluído
          </p>
        </div>

        <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] text-balance">
          {diagnostic.headline}
        </h1>

        <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
          {diagnostic.empathic_rationale}
        </p>

        {/* 2. O Contraste Perceptivo: Como ela enxerga hoje vs Amanhã */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3.5 border border-[var(--color-border-subtle)]">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-1">
              <AlertCircle className="size-3.5 text-[var(--color-opportunity-primary)]" />
              Como a cliente enxerga hoje
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-ink-solid)] leading-snug">
              {diagnostic.client_perception_gap.sees_today}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-revenue-subtle)] p-3.5 border border-[var(--color-revenue-primary)]/20">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)] flex items-center gap-1">
              <Sparkles className="size-3.5" />
              Como ela vai enxergar em 48h
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-ink-solid)] font-semibold leading-snug">
              {diagnostic.client_perception_gap.will_see_after}
            </p>
          </div>
        </div>
      </div>

      {/* 3. O Acordo Sagrado de 48 Horas */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/30 bg-[var(--color-action-subtle)] p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldCheck className="size-5 shrink-0 text-[var(--color-action-primary)] mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            O Acordo de 48 Horas
          </p>
          <p className="text-sm font-bold text-[var(--color-ink-solid)] leading-snug">
            Você NÃO vai baixar R$ 1 do seu preço nem dar desconto.
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            Nós vamos subir a percepção de valor do seu atendimento através de 3 missões práticas de 10 minutos cada.
          </p>
        </div>
      </div>

      {/* 4. Lista das Missões de 10 Minutos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
            Missões de Valor em 48h ({completedCount}/{missions.length} Concluídas)
          </h2>
          <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
            Tempo: ~10 min cada
          </span>
        </div>

        {missions.map((mission) => {
          const isCompleted = mission.status === "completed";
          const isExpanded = expandedMissionId === mission.action_id;
          const isCopied = copiedScriptId === mission.action_id;

          return (
            <div
              key={mission.action_id}
              className={cn(
                "rounded-[var(--radius-card)] border bg-[var(--color-surface-card)] transition-all shadow-[var(--shadow-card-resting)] overflow-hidden",
                isCompleted
                  ? "border-[var(--color-revenue-primary)]/40 bg-[var(--color-revenue-subtle)]/20"
                  : "border-[var(--color-border-subtle)]"
              )}
            >
              {/* Mission Header */}
              <div
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                onClick={() => setExpandedMissionId(isExpanded ? null : mission.action_id)}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMissionComplete(mission.action_id);
                    }}
                    aria-label={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all min-h-[48px] min-w-[48px] cursor-pointer",
                      isCompleted
                        ? "bg-[var(--color-revenue-primary)] text-white border-[var(--color-revenue-primary)]"
                        : "border-[var(--color-border-strong)] bg-white hover:border-[var(--color-action-primary)]"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin text-[var(--color-ink-muted)]" />
                    ) : (
                      <Check className={cn("size-4", isCompleted ? "opacity-100 stroke-[3]" : "opacity-0")} />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-action-primary)]">
                        Missão {mission.mission_number}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink-muted)]">
                        <Clock3 className="size-3" />
                        {mission.duration_minutes} min
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "text-sm sm:text-base font-bold leading-tight mt-0.5",
                        isCompleted ? "line-through text-[var(--color-ink-muted)]" : "text-[var(--color-ink-solid)]"
                      )}
                    >
                      {mission.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center text-[var(--color-ink-muted)]">
                  {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                </div>
              </div>

              {/* Mission Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 border-t border-[var(--color-border-subtle)] pt-3 space-y-4">
                  {/* Princípio Científico */}
                  <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3 border border-[var(--color-border-subtle)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                      Fundamento da Neurociência & Marketing
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      {mission.scientific_principle}
                    </p>
                  </div>

                  {/* Passo a Passo */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                      O que fazer agora (Passo a Passo de 10 min):
                    </p>
                    <ol className="space-y-2 pl-1">
                      {mission.action_steps.map((step, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-[var(--color-ink-solid)] flex items-start gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[11px] font-bold text-[var(--color-ink-muted)] mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Roteiro Pronto para Copiar */}
                  {mission.ready_to_use_script && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                          Roteiro Pronto para Falar ou Enviar:
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(mission.action_id, mission.ready_to_use_script!)}
                          className="inline-flex min-h-[48px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-primary)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer"
                        >
                          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          <span>{isCopied ? "Copiado!" : "Copiar Roteiro"}</span>
                        </button>
                      </div>

                      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3 text-xs sm:text-sm font-mono leading-relaxed text-[var(--color-ink-solid)] border border-[var(--color-border-subtle)] select-all">
                        {mission.ready_to_use_script}
                      </div>
                    </div>
                  )}

                  {/* Botão de Conclusão da Missão */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleMissionComplete(mission.action_id)}
                      className={cn(
                        "w-full inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer",
                        isCompleted
                          ? "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                          : "bg-[var(--color-action-primary)] text-white hover:bg-[var(--color-action-hover)] shadow-xs"
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{isCompleted ? "Desmarcar Conclusão" : "Concluir Missão de 10 min"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
