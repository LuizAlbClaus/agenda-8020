import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";
import PrivacyRequests from "./privacy-requests";
import { InstallAppCard } from "@/components/install-app-card";
import type { NotificationPreferences, ReminderPeriod } from "./actions";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPreferences(value: unknown): {
  preferences: NotificationPreferences;
  marketingSupported: boolean;
} {
  const root = Array.isArray(value) ? value[0] : value;
  const record: JsonRecord = isRecord(root) ? root : {};
  const period = record.daily_period;
  const validPeriod: ReminderPeriod =
    period === "afternoon" || period === "evening" ? period : "morning";
  const marketingSupported = Object.prototype.hasOwnProperty.call(
    record,
    "marketing_email_enabled"
  );
  const marketing = record.marketing_email_enabled;

  return {
    preferences: {
      dailyPlanReminderEnabled:
        typeof record.daily_email_enabled === "boolean"
          ? record.daily_email_enabled
          : false,
      dailyPlanReminderPeriod: validPeriod,
      weeklyReviewEnabled:
        typeof record.weekly_email_enabled === "boolean"
          ? record.weekly_email_enabled
          : false,
      outcomePendingEnabled:
        typeof record.outcome_reminder_enabled === "boolean"
          ? record.outcome_reminder_enabled
          : true,
      ...(marketingSupported && typeof marketing === "boolean"
        ? { marketingOptIn: marketing }
        : {}),
    },
    marketingSupported,
  };
}

export default async function SettingsPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data: claims } = await supabase!.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");

  const { data, error } = await supabase!.rpc("get_notification_preferences");
  if (error) {
    console.error("Notification preferences lookup failed", { code: error.code });
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-6 sm:p-8 shadow-[var(--shadow-card-resting)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-ink-solid)]">
            Configurações indisponíveis
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Não conseguimos carregar suas preferências agora. Tente novamente em instantes.
          </p>
        </div>
      </main>
    );
  }

  const { preferences, marketingSupported } = readPreferences(data);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 py-2 pr-4 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
            Conta & Preferências
          </span>
        </header>

        {/* Page Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Configurações da conta
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            Gerencie seus lembretes operacionais, parcerias conectadas e solicitações de privacidade.
          </p>
        </div>

        {/* Mobile App Installation Card (Android & iOS) */}
        <InstallAppCard />

        {/* Partner Benefits Card Link */}
        <section aria-label="Gerenciar benefícios e parcerias" className="mt-6">
          <Link
            href="/settings/benefits"
            className="block rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-5 transition-all hover:border-[var(--color-revenue-primary)] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)] shadow-xs">
                <Sparkles className="size-3" aria-hidden="true" />
                Parcerias & Benefícios
              </span>
              <ArrowRight className="size-4 text-[var(--color-revenue-primary)]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-base font-bold text-[var(--color-ink-solid)]">
              Integração Belevy Pro
            </p>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Gerencie a conexão da sua agenda oficial, status da cortesia e sincronização de dados.
            </p>
          </Link>
        </section>

        {/* Notification Settings Form */}
        <SettingsForm initial={preferences} marketingSupported={marketingSupported} />

        {/* Privacy & LGPD Section */}
        <PrivacyRequests />
      </div>
    </main>
  );
}
