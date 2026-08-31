"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Download, ShieldCheck, Trash2 } from "lucide-react";

import { requestAccountDeletion, requestDataExport } from "./privacy-actions";

export default function PrivacyRequests() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function run(action: typeof requestDataExport, success: string) {
    setMessage("");
    setError(false);
    startTransition(async () => {
      const result = await action();
      setError(!result.ok);
      setMessage(result.ok ? success : result.error);
    });
  }

  function handleDelete() {
    setConfirmDelete(false);
    run(requestAccountDeletion, "Solicitação de exclusão registrada com sucesso. Processaremos em conformidade com a LGPD.");
  }

  return (
    <section
      aria-labelledby="privacy-requests-heading"
      className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-[var(--color-action-primary)]" aria-hidden="true" />
        <h2 id="privacy-requests-heading" className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
          Privacidade & Seus Dados (LGPD)
        </h2>
      </div>

      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Você tem controle total sobre suas informações. Solicite uma cópia completa dos seus dados ou solicite a exclusão definitiva da sua conta a qualquer momento.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(requestDataExport, "Solicitação de exportação de dados registrada com sucesso.")}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-4 text-xs sm:text-sm font-bold text-[var(--color-ink-solid)] shadow-xs transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-50"
        >
          <Download className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
          <span>Solicitar meus dados</span>
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-danger-primary)]/30 bg-[var(--color-danger-subtle)] px-4 text-xs sm:text-sm font-bold text-[var(--color-danger-primary)] transition-colors hover:bg-[var(--color-danger-primary)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger-primary)] disabled:cursor-wait disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span>Solicitar exclusão da conta</span>
        </button>
      </div>

      {confirmDelete && (
        <div
          role="alert"
          className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-danger-primary)]/30 bg-[var(--color-danger-subtle)] p-4 text-xs sm:text-sm text-[var(--color-danger-primary)] space-y-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-semibold leading-relaxed">
              Tem certeza que deseja solicitar a exclusão de todos os seus dados e histórico do Agenda 80/20? Esta ação não pode ser desfeita após a conclusão.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-danger-primary)] px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:opacity-90"
            >
              Confirmar exclusão
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-4 text-xs sm:text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-[var(--radius-card)] p-3 text-xs sm:text-sm font-medium flex items-center gap-2 ${
            error
              ? "border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] text-[var(--color-danger-primary)]"
              : "border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]"
          }`}
        >
          {error ? (
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{message}</span>
        </div>
      )}
    </section>
  );
}
