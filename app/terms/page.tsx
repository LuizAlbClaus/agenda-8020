import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink-solid)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-5">
          <Link
            href="/"
            className="flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
            aria-label="Agenda 80/20 — Início"
          >
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-[var(--radius-button)] px-3 text-xs font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Voltar para o início</span>
          </Link>
        </header>

        {/* Editorial Content Container (65-75ch Measure) */}
        <article className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] sm:p-10 lg:p-12">
          <div className="mx-auto max-w-[70ch]">
            {/* Document Header */}
            <div className="border-b border-[var(--color-border-subtle)] pb-8">
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-4xl text-[var(--color-ink-solid)]">
                Termos de uso
              </h1>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 pt-8 text-base leading-relaxed text-[var(--color-ink-solid)]">
              <p className="text-[var(--color-ink-muted)]">
                O Agenda 80/20 oferece orientação prática para profissionais autônomos e prestadores de serviço organizarem ações de aquisição, relacionamento e agendamento. O conteúdo é uma ferramenta de apoio: não promete agenda cheia, renda, clientes ou qualquer resultado específico.
              </p>

              <h2 className="pt-4 text-xl font-bold tracking-tight text-[var(--color-ink-solid)]">
                Uso responsável
              </h2>

              <p className="text-[var(--color-ink-muted)]">
                Use as sugestões conforme sua realidade, disponibilidade e regras dos canais usados. Aborde apenas pessoas e negócios quando houver contexto legítimo, respeite pedidos para não receber mensagens e não compartilhe dados de clientes ou terceiros sem autorização.
              </p>

              <h2 className="pt-4 text-xl font-bold tracking-tight text-[var(--color-ink-solid)]">
                Conta e acesso
              </h2>

              <p className="text-[var(--color-ink-muted)]">
                O acesso é pessoal e depende de uma compra válida e de uma sessão autenticada. Você é responsável por manter seu e-mail acessível e por revisar as sugestões antes de executá-las. Podemos atualizar o conteúdo editorial para preservar clareza, segurança e aderência ao produto.
              </p>

              <h2 className="pt-4 text-xl font-bold tracking-tight text-[var(--color-ink-solid)]">
                Encerramento
              </h2>

              <p className="text-[var(--color-ink-muted)]">
                Para solicitar ajuda, exportação ou exclusão dos seus dados, use as{" "}
                <Link
                  href="/settings"
                  className="font-medium text-[var(--color-action-primary)] underline underline-offset-4 hover:text-[var(--color-action-hover)] focus-visible:outline-none"
                >
                  Configurações
                </Link>{" "}
                quando estiver autenticada. Estes termos descrevem o funcionamento atual do MVP e não substituem orientação jurídica.
              </p>
            </div>
          </div>
        </article>

        {/* Footer Navigation */}
        <footer className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <span>Agenda 80/20</span>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Política de privacidade
            </Link>
            <Link
              href="/"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Início
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
