"use client";

import { useState, useTransition } from "react";
import { Info, Loader2 } from "lucide-react";

import {
  saveNotificationPreferences,
  type NotificationPreferences,
  type ReminderPeriod,
} from "./actions";

const periodOptions: Array<{ value: ReminderPeriod; label: string }> = [
  { value: "morning", label: "De manhã (08:00)" },
  { value: "afternoon", label: "À tarde (13:00)" },
  { value: "evening", label: "À noite (18:00)" },
];

type SettingsFormProps = {
  initial: NotificationPreferences;
  marketingSupported: boolean;
};

function PreferenceToggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[56px] cursor-pointer items-start gap-3.5 rounded-[var(--radius-button)] p-2 transition-colors hover:bg-[var(--color-surface-muted)] select-none"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--color-action-primary)] cursor-pointer"
      />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[var(--color-ink-solid)]">{label}</span>
        <span className="mt-0.5 block text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}

export default function SettingsForm({ initial, marketingSupported }: SettingsFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setMessage("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");
    startTransition(async () => {
      const result = await saveNotificationPreferences(preferences);
      if (!result.ok) {
        setStatus("error");
        setMessage(result.error);
        return;
      }
      setStatus("saved");
      setMessage("Preferências salvas com sucesso.");
    });
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      {/* Reminders Card */}
      <section
        aria-labelledby="reminders-heading"
        className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <h2 id="reminders-heading" className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
          Lembretes por email
        </h2>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Escolha os avisos que ajudam a manter seu ritmo sem sobrecarregar sua rotina.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <PreferenceToggle
              id="daily-plan-reminder"
              checked={preferences.dailyPlanReminderEnabled}
              onChange={(checked) => update("dailyPlanReminderEnabled", checked)}
              label="Lembrete diário de foco"
              description="Um email curto para lembrar de conferir e executar a ação do dia."
            />
            {preferences.dailyPlanReminderEnabled && (
              <div className="mt-3 pl-8 pr-2">
                <label
                  htmlFor="daily-plan-reminder-period"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]"
                >
                  Melhor período para receber
                </label>
                <select
                  id="daily-plan-reminder-period"
                  value={preferences.dailyPlanReminderPeriod}
                  onChange={(event) => update("dailyPlanReminderPeriod", event.target.value as ReminderPeriod)}
                  className="mt-2 min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-3.5 text-sm font-semibold text-[var(--color-ink-solid)] outline-none focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <PreferenceToggle
              id="weekly-review"
              checked={preferences.weeklyReviewEnabled}
              onChange={(checked) => update("weeklyReviewEnabled", checked)}
              label="Resumo e revisão semanal"
              description="Um compilado do seu movimento nos últimos 7 dias para orientar o próximo ciclo."
            />
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <PreferenceToggle
              id="outcome-pending"
              checked={preferences.outcomePendingEnabled}
              onChange={(checked) => update("outcomePendingEnabled", checked)}
              label="Aviso de retorno pendente"
              description="Aviso pontual quando uma ação já teve tempo para gerar retorno e aguarda registro."
            />
          </div>

          {marketingSupported && (
            <div className="border-t border-[var(--color-border-subtle)] pt-4">
              <PreferenceToggle
                id="marketing"
                checked={preferences.marketingOptIn === true}
                onChange={(checked) => update("marketingOptIn", checked)}
                label="Novidades e melhorias do produto"
                description="Receba atualizações de funcionalidades e comunicações do Agenda 80/20."
              />
            </div>
          )}
        </div>
      </section>

      {/* Essential Emails Notice */}
      <aside
        aria-label="Emails essenciais"
        className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 sm:p-5 flex items-start gap-3"
      >
        <Info className="size-4 shrink-0 text-[var(--color-ink-muted)] mt-0.5" aria-hidden="true" />
        <div className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          <strong className="text-[var(--color-ink-solid)]">Emails transacionais essenciais:</strong> Mensagens de autenticação, redefinição de acesso, segurança e solicitações de dados permanecem sempre ativas.
        </div>
      </aside>

      {/* Feedback & Save Button */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Salvando preferências…</span>
            </>
          ) : (
            <span>Salvar preferências</span>
          )}
        </button>

        {message && (
          <p
            role={status === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`text-center text-xs sm:text-sm font-medium ${
              status === "error" ? "text-[var(--color-danger-primary)]" : "text-[var(--color-revenue-primary)]"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
