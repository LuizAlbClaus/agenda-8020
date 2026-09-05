import Link from "next/link";
import { ArrowRight, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { BrandIcon, BrandMark } from "@/components/ui/brand-mark";

export default async function CheckoutSuccessPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const rawOrigem = searchParams?.origem;
  const origem =
    typeof rawOrigem === "string"
      ? rawOrigem
      : Array.isArray(rawOrigem) && typeof rawOrigem[0] === "string"
      ? rawOrigem[0]
      : undefined;

  const isSoftGel = origem === "soft-gel";

  return (
    <main className="flex min-h-screen flex-col justify-between bg-[var(--color-canvas)] px-4 py-6 text-[var(--color-ink-solid)] sm:px-8 sm:py-10">
      {/* Top Brand Header */}
      <header className="mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
          aria-label="Agenda 80/20 — Página Inicial"
        >
          <BrandMark />
        </Link>
      </header>

      {/* Main Card Container */}
      <div className="mx-auto my-8 w-full max-w-lg">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-elevated)] sm:p-8">
          {/* Celebratory Brand Header */}
          <div className="flex items-center justify-between">
            <BrandIcon size="lg" className="shadow-xs" priority />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-revenue-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Acesso Oficial Verificado
            </span>
          </div>

          <div className="mt-5">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {isSoftGel ? "Matrícula confirmada com sucesso" : "Compra confirmada com sucesso"}
            </span>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.03em] text-balance text-[var(--color-ink-solid)] sm:text-3xl">
              {isSoftGel
                ? "Sua matrícula no Soft Gel Express está confirmada!"
                : "Seu acesso ao Agenda 80/20 está pronto!"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-base">
              {isSoftGel
                ? "Acabamos de enviar as instruções de acesso e login da sua área de membros para o e-mail informado no momento do pagamento na Cakto."
                : "Acabamos de enviar seu link mágico de acesso para o e-mail que você informou no momento do pagamento na Cakto."}
            </p>
          </div>

          {/* Step by step guide */}
          <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
              {isSoftGel ? "Como acessar seu curso agora:" : "Como acessar seu aplicativo agora:"}
            </h2>
            <ol className="mt-3 space-y-3 text-sm text-[var(--color-ink-solid)]">
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-xs font-bold text-white">
                  1
                </span>
                <span>Abra a caixa de entrada do seu e-mail cadastrado na compra.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-xs font-bold text-white">
                  2
                </span>
                <span>
                  {isSoftGel ? (
                    <>
                      Procure pela mensagem com as <strong>instruções de acesso ao Soft Gel Express</strong> enviada por <strong>Flávia Claus</strong>.
                    </>
                  ) : (
                    <>
                      Procure pela mensagem com o assunto <em>“Seu acesso ao Agenda 80/20 está pronto”</em> enviada por <strong>Flávia Claus</strong>.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-xs font-bold text-white">
                  3
                </span>
                <span>
                  {isSoftGel
                    ? "Clique no link enviado para definir sua senha e começar a assistir às aulas."
                    : "Clique no botão do e-mail para entrar direto, sem precisar criar senha."}
                </span>
              </li>
            </ol>
          </div>

          {/* Tip on Spam / Promotion */}
          <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-sm)] bg-[var(--color-canvas)] p-3.5 text-xs text-[var(--color-ink-muted)]">
            <Mail className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-solid)]" aria-hidden="true" />
            <p>
              Não encontrou o e-mail em instantes? Verifique também suas pastas de <strong>Spam</strong>, <strong>Lixo Eletrônico</strong> ou a aba <strong>Promoções</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={isSoftGel ? "/" : "/login"}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
            >
              <span>{isSoftGel ? "Já conferi meu e-mail para acessar as aulas" : "Já conferi meu e-mail e quero entrar"}</span>
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-5 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="mx-auto flex w-full max-w-lg items-center justify-between border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-ink-muted)]">
        <span>Agenda 80/20</span>
        <div className="flex items-center gap-4">
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
    </main>
  );
}
