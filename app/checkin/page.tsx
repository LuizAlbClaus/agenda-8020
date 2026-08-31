import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import CheckinForm from "./checkin-form";

export default async function CheckinPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data } = await supabase!.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");

  const { data: checkin, error } = await supabase!.rpc("get_checkin");
  if (error || !checkin || checkin.onboarding_required) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 py-2 pr-4 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-action-primary)]">
            A cada 14 dias
          </span>
        </header>

        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Como está seu momento hoje?
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            Uma atualização rápida para manter o Agenda 80/20 focado no que mais destrava seus atendimentos agora.
          </p>
        </div>

        <div className="mt-8">
          <CheckinForm initial={checkin} />
        </div>
      </div>
    </main>
  );
}
