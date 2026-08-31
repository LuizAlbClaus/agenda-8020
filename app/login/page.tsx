import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-[var(--shadow-card-resting)] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column — Brand & Purpose (Desktop) */}
        <section className="hidden flex-col justify-between bg-[var(--color-ink-solid)] p-10 text-white lg:flex">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] text-white/80 transition-colors hover:text-white focus-visible:outline-none"
            >
              <BrandMark labelClassName="text-white" />
            </Link>
          </div>

          <div className="my-auto py-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-opportunity-primary)]">
              Seu próximo passo pode ser pequeno
            </p>
            <h1 className="mt-4 max-w-md text-3xl font-bold leading-[1.1] tracking-[-0.035em] text-balance sm:text-4xl">
              Entre para organizar o que faz sentido agora.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/70">
              Uma ação possível de cada vez, ajustada ao momento real do seu serviço e da sua agenda.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs leading-5 text-white/50">
              Sem promessas de agenda cheia. Com clareza para agir.
            </p>
          </div>
        </section>

        {/* Right Column — Magic Link Form */}
        <section className="flex flex-col justify-between px-5 py-8 sm:px-10 sm:py-12">
          {/* Header Mobile / Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--radius-button)] text-xs font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Voltar para o início</span>
            </Link>
            <div className="lg:hidden">
              <BrandMark showLabel={false} />
            </div>
          </div>

          {/* Form Container */}
          <div className="mx-auto my-auto w-full max-w-md py-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
              Acesso seguro
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-3xl">
              Entre no Agenda 80/20
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Você receberá um link mágico no seu e-mail para entrar sem senha.
            </p>

            <LoginForm />

            <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6 text-xs leading-5 text-[var(--color-ink-muted)]">
              Ao continuar, você concorda com nossos{" "}
              <Link
                href="/terms"
                className="font-medium text-[var(--color-ink-solid)] underline underline-offset-4 transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-none"
              >
                Termos de Uso
              </Link>{" "}
              e nossa{" "}
              <Link
                href="/privacy"
                className="font-medium text-[var(--color-ink-solid)] underline underline-offset-4 transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-none"
              >
                Política de Privacidade
              </Link>
              .
            </div>
          </div>

          {/* Mobile Footer Note */}
          <div className="pt-4 text-center text-xs text-[var(--color-ink-muted)] lg:text-left">
            Agenda 80/20 · Apoio à decisão e agendamento
          </div>
        </section>
      </div>
    </main>
  );
}
