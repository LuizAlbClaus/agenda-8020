import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MessageCircleMore,
} from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

const steps = [
  {
    number: "1",
    title: "Conte seu momento",
    description: "Serviço, gargalo, canais e a disponibilidade real que cabe no seu dia.",
  },
  {
    number: "2",
    title: "Veja o próximo movimento",
    description: "Uma decisão clara e compatível com o que você consegue fazer agora.",
  },
  {
    number: "3",
    title: "Receba horários",
    description: "Compartilhe seu caminho público de agendamento para quem demonstrar interesse.",
  },
] as const;

const benefits = [
  "Saiba o que fazer agora sem montar um plano de marketing inteiro.",
  "Use o tempo que você realmente tem disponível no seu dia.",
  "Dê uma próxima etapa clara para quem demonstrar interesse.",
  "Acompanhe ações, sinais e agendamentos sem depender de improviso.",
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink-solid)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between py-5 sm:py-7">
          <Link
            href="/"
            className="flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
            aria-label="Agenda 80/20 — Página Inicial"
          >
            <BrandMark />
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-none"
          >
            Entrar
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </header>

        {/* Hero Section */}
        <section className="grid gap-10 pb-16 pt-8 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[var(--color-action-primary)]">
              Feito para quem vive de atendimento.
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
              Pare de tentar fazer tudo para movimentar seu serviço.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] text-pretty sm:text-lg sm:leading-8">
              Conte como está seu serviço, seu tempo e seus canais. O Agenda 80/20 organiza uma próxima ação possível e ajuda você a receber agendamentos por um link simples.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
              >
                Montar meu primeiro plano
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
              <p className="text-xs leading-5 text-[var(--color-ink-muted)] sm:max-w-xs sm:text-sm">
                Sem promessas mágicas. Só um próximo passo claro.
              </p>
            </div>
          </div>

          {/* Canonical Product Preview Artifact */}
          <section
            aria-label="Exemplo de plano diário do produto"
            className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-[var(--shadow-card-elevated)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span
                  className="size-2.5 rounded-full bg-[var(--color-revenue-primary)]"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-[var(--color-ink-solid)]">
                  Seu plano de hoje
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--color-ink-muted)] sm:text-sm">
                2 minutos
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Seu foco agora
              </p>
              <h2 className="mt-3 text-xl font-bold leading-snug tracking-[-0.025em] text-balance sm:text-2xl">
                Retome a conversa com uma pessoa que pediu informações.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
                Você já tem uma oportunidade concreta aberta. Não precisa pensar em uma campanha inteira hoje.
              </p>

              <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]"
                    aria-hidden="true"
                  >
                    <MessageCircleMore className="size-4" />
                  </span>
                  <p className="text-sm leading-6 text-[var(--color-ink-solid)]">
                    “Oi! Vi que você tinha interesse no serviço. Quer que eu te envie os horários que ainda tenho esta semana?”
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-muted)] sm:text-sm">
                  <Clock3 className="size-4" aria-hidden="true" />
                  <span>Cabe no seu intervalo</span>
                </div>
                <span className="inline-flex min-h-[36px] items-center rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-4 text-xs font-bold text-white">
                  Abrir ação
                </span>
              </div>
            </div>
          </section>
        </section>

        {/* 3 Steps Section */}
        <section className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-[var(--color-revenue-primary)]">
                Um plano que respeita sua rotina
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-4xl">
                Menos improviso. Mais clareza para agir.
              </h2>
            </div>
            <ol className="divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 sm:grid-cols-[3rem_1fr_1.25fr] sm:gap-5"
                >
                  <span
                    className="text-lg font-bold text-[var(--color-action-primary)]"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <h3 className="text-base font-bold leading-6 text-[var(--color-ink-solid)]">
                    {step.title}
                  </h3>
                  <p className="col-start-2 text-sm leading-6 text-[var(--color-ink-muted)] sm:col-start-auto">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="grid gap-8 border-t border-[var(--color-border-subtle)] py-14 sm:py-20 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-action-primary)]">
              Para usar entre atendimentos
            </p>
            <h2 className="mt-3 max-w-xl text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-4xl">
              Uma interface feita para decidir, não para sobrecarregar.
            </h2>
          </div>
          <ul className="grid gap-4 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check
                  className="mt-0.5 size-5 shrink-0 text-[var(--color-revenue-primary)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--color-ink-solid)]">{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Objection Breaker Section */}
        <section className="mb-12 grid gap-8 rounded-[var(--radius-card)] bg-[var(--color-ink-solid)] px-6 py-8 text-white sm:mb-16 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-opportunity-primary)] sm:text-sm">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span>Comece com o que já existe</span>
            </div>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-3xl lg:text-4xl">
              Você não precisa dominar uma ferramenta grande para começar.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              O produto começa com perguntas simples sobre seu serviço e leva você a uma única próxima ação. As recomendações são apoio à decisão; você continua revisando e escolhendo o que faz sentido para sua realidade.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
          >
            Montar meu primeiro plano
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-4 border-t border-[var(--color-border-subtle)] py-8 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <span>
            O Agenda 80/20 apoia sua decisão; não promete clientes, renda ou agenda cheia.
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Privacidade
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Termos
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
