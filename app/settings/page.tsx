import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";
import PrivacyRequests from "./privacy-requests";
import type { NotificationPreferences, ReminderPeriod } from "./actions";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPreferences(value: unknown): { preferences: NotificationPreferences; marketingSupported: boolean } {
  const root = Array.isArray(value) ? value[0] : value;
  const record: JsonRecord = isRecord(root) ? root : {};
  const period = record.daily_period;
  const validPeriod: ReminderPeriod = period === "afternoon" || period === "evening" ? period : "morning";
  const marketingSupported = Object.prototype.hasOwnProperty.call(record, "marketing_email_enabled");
  const marketing = record.marketing_email_enabled;

  return {
    preferences: {
      dailyPlanReminderEnabled: typeof record.daily_email_enabled === "boolean" ? record.daily_email_enabled : false,
      dailyPlanReminderPeriod: validPeriod,
      weeklyReviewEnabled: typeof record.weekly_email_enabled === "boolean" ? record.weekly_email_enabled : false,
      outcomePendingEnabled: typeof record.outcome_reminder_enabled === "boolean" ? record.outcome_reminder_enabled : true,
      ...(marketingSupported && typeof marketing === "boolean" ? { marketingOptIn: marketing } : {}),
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
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8">
        <Link href="/today" className="w-fit text-sm font-semibold text-teal-700 underline underline-offset-4">← Hoje</Link>
        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Preferências indisponíveis</h1>
          <p className="mt-3 leading-6 text-slate-600">Não conseguimos carregar suas preferências agora. Tente novamente em alguns instantes.</p>
        </section>
      </main>
    );
  }

  const { preferences, marketingSupported } = readPreferences(data);
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-8 sm:px-8">
      <Link href="/today" className="w-fit text-sm font-semibold text-teal-700 underline underline-offset-4">← Hoje</Link>
      <header className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Configurações</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">Preferências de email</h1>
        <p className="mt-3 leading-7 text-slate-600">Escolha os lembretes que combinam com seu ritmo. Você pode mudar isso quando quiser.</p>
      </header>
      <SettingsForm initial={preferences} marketingSupported={marketingSupported} />
      <PrivacyRequests />
    </main>
  );
}
