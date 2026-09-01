"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { X, Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagnosticQuestionUI, ValueDiagnosticTrigger } from "@/lib/value-diagnostic-types";
import { submitValueDiagnosticAction } from "@/app/diagnostic/actions";

interface ValueDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticComplete: (diagnosticData: any) => void;
  workspaceId: string;
  triggerSource?: ValueDiagnosticTrigger;
  questions: DiagnosticQuestionUI[];
}

export function ValueDiagnosticModal({
  isOpen,
  onClose,
  onDiagnosticComplete,
  workspaceId,
  triggerSource = "manual_audit",
  questions,
}: ValueDiagnosticModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  React.useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const currentSelectedOptionId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignora em dispositivos sem permissão
      }
    }
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setErrorMsg(null);
  };

  const handleKeyDownRadiogroup = (e: React.KeyboardEvent) => {
    if (!currentQuestion) return;
    const options = currentQuestion.options;
    const currentIndex = options.findIndex((o) => o.id === currentSelectedOptionId);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
      handleSelectOption(currentQuestion.id, options[nextIndex].id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + options.length) % options.length;
      handleSelectOption(currentQuestion.id, options[prevIndex].id);
    }
  };

  const handleNext = () => {
    if (!currentSelectedOptionId) {
      setErrorMsg("Por favor, selecione a opção que melhor reflete seu atendimento.");
      return;
    }

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submissão final
      startTransition(async () => {
        const answersArray = Object.entries(selectedAnswers).map(([qId, oId]) => ({
          question_id: qId,
          option_id: oId,
        }));

        const res = await submitValueDiagnosticAction({
          workspaceId,
          trigger: triggerSource,
          answers: answersArray,
        });

        if (res.ok && res.data) {
          onDiagnosticComplete(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || "Não conseguimos calcular o diagnóstico agora.");
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMsg(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity"
    >
      <div className="w-full max-w-lg rounded-t-[20px] sm:rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-elevated)] border border-[var(--color-border-subtle)] max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header com Progresso */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Micro-Auditoria em 45s
              </p>
              <h2 id="diagnostic-modal-title" className="text-sm font-bold text-[var(--color-ink-solid)]">
                Passo {currentStep + 1} de {questions.length}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar auditoria"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Barra de Progresso Fina */}
        <div className="h-1 w-full bg-[var(--color-surface-muted)] overflow-hidden rounded-full mt-2">
          <div
            className="h-full bg-[var(--color-action-primary)] transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Pergunta Atual */}
        {currentQuestion && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)] text-balance leading-snug">
                {currentQuestion.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed text-pretty">
                {currentQuestion.helper_text}
              </p>
            </div>

            {/* Opções Táteis */}
            <div
              className="space-y-2.5 pt-1"
              role="radiogroup"
              aria-label={currentQuestion.title}
              tabIndex={0}
              onKeyDown={handleKeyDownRadiogroup}
            >
              {currentQuestion.options.map((option) => {
                const isSelected = currentSelectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-[var(--radius-card)] border transition-all flex items-start justify-between gap-3 min-h-[56px] focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer",
                      isSelected
                        ? "bg-[var(--color-action-subtle)] border-[var(--color-action-primary)] shadow-xs"
                        : "bg-[var(--color-surface-card)] border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-muted)]"
                    )}
                  >
                    <div className="space-y-1 pr-2">
                      <p
                        className={cn(
                          "text-sm font-bold leading-snug",
                          isSelected ? "text-[var(--color-action-primary)]" : "text-[var(--color-ink-solid)]"
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border mt-0.5",
                        isSelected
                          ? "border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-white"
                          : "border-[var(--color-border-strong)] bg-white"
                      )}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-semibold text-[var(--color-danger-primary)] pt-1">
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* Rodapé de Ações - Zona do Polegar */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 px-4 rounded-[var(--radius-button)] text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={isPending || !currentSelectedOptionId}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] text-white text-sm sm:text-base font-bold shadow-xs hover:bg-[var(--color-action-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] ml-auto cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Calculando seu diagnóstico...</span>
              </>
            ) : isLastStep ? (
              <>
                <span>Ver Meu Diagnóstico</span>
                <Sparkles className="size-4" />
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
