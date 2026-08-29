"use client";

import { useState, useTransition } from "react";
import {
  saveNotificationPreferences,
  type NotificationPreferences,
  type ReminderPeriod,
} from "./actions";

const periodOptions: Array<{ value: ReminderPeriod; label: string }> = [
  { value: "morning", label: "De manhã" },
  { value: "afternoon", label: "À tarde" },
  { value: "evening", label: "À noite" },
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
      className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl px-1 py-2"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-teal-700"
      />
      <span className="min-w-0">
        <span className="block font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
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
      setMessage("Preferências salvas.");
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <section aria-labelledby="reminders-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="reminders-heading" className="text-lg font-bold text-slate-900">Lembretes para continuar no ritmo</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Escolha quais mensagens podem ajudar você a voltar ao seu plano.</p>

        <div className="mt-5">
          <PreferenceToggle
            id="daily-plan-reminder"
            checked={preferences.dailyPlanReminderEnabled}
            onChange={(checked) => update("dailyPlanReminderEnabled", checked)}
            label="Lembrete diário"
            description="Um lembrete para conferir sua próxima ação do dia."
          />
          <div className="mt-3 border-l-2 border-slate-200 pl-8">
            <label htmlFor="daily-plan-reminder-period" className="block text-sm font-semibold text-slate-800">Melhor período</label>
            <select
              id="daily-plan-reminder-period"
              value={preferences.dailyPlanReminderPeriod}
              disabled={!preferences.dailyPlanReminderEnabled}
              onChange={(event) => update("dailyPlanReminderPeriod", event.target.value as ReminderPeriod)}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <PreferenceToggle
            id="weekly-review"
            checked={preferences.weeklyReviewEnabled}
            onChange={(checked) => update("weeklyReviewEnabled", checked)}
            label="Revisão semanal"
            description="Um resumo curto para perceber o que avançou e escolher o próximo passo."
          />
        </div>

        <div className="mt-3 border-t border-slate-100 pt-4">
          <PreferenceToggle
            id="outcome-pending"
            checked={preferences.outcomePendingEnabled}
            onChange={(checked) => update("outcomePendingEnabled", checked)}
            label="Lembrete de resultado pendente"
            description="Aviso quando já estiver na hora de registrar se uma ação trouxe retorno."
          />
        </div>

        {marketingSupported && (
          <div className="mt-3 border-t border-slate-100 pt-4">
            <PreferenceToggle
              id="marketing"
              checked={preferences.marketingOptIn === true}
              onChange={(checked) => update("marketingOptIn", checked)}
              label="Novidades e ofertas"
              description="Receba comunicações sobre novidades e ofertas do Agenda 80/20."
            />
          </div>
        )}
      </section>

      <aside className="rounded-2xl border border-teal-200 bg-teal-50 p-5" aria-label="Emails essenciais">
        <h2 className="font-semibold text-teal-950">Emails essenciais continuam ativos</h2>
        <p className="mt-2 text-sm leading-6 text-teal-900">Mensagens de acesso, segurança, expiração e revogação permanecem ativas para proteger sua conta.</p>
      </aside>

      <div className="flex flex-col gap-3 pb-8">
        <button type="submit" disabled={isPending} className="min-h-12 w-full rounded-full bg-teal-800 px-5 font-semibold text-white transition hover:bg-teal-900 disabled:cursor-wait disabled:opacity-60">
          {isPending ? "Salvando…" : "Salvar preferências"}
        </button>
        <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`min-h-5 text-center text-sm ${status === "error" ? "text-red-700" : "text-teal-800"}`}>
          {message}
        </p>
      </div>
    </form>
  );
}
