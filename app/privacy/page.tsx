import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

export default function PrivacyPage() {
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
                Política de privacidade
              </h1>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 pt-8 text-base leading-relaxed text-[var(--color-ink-solid)]">
              <p className="text-[var(--color-ink-muted)]">
                O Agenda 80/20 usa os dados necessários para autenticar seu acesso e montar sua experiência: e-mail da conta, nome escolhido, tipo e nicho do serviço, momento do negócio, formato de atendimento, canais disponíveis, sinais de oportunidade, disponibilidade e interações com as ações.
              </p>

              <h2 className="pt-4 text-xl font-bold tracking-tight text-[var(--color-ink-solid)]">
                Dados de agendamento
              </h2>

              <p className="text-[var(--color-ink-muted)]">
                Quando uma pessoa usa um link público para marcar um horário, armazenamos o nome informado e, se fornecido, um contato como WhatsApp ou e-mail. Esses dados são usados para criar e administrar a reserva, exibir o agendamento para a profissional responsável e atender solicitações relacionadas a ele. O módulo não exige cadastro de clientes finais nem coleta conversas privadas.
              </p>

              <p className="text-[var(--color-ink-muted)]">
                A profissional deve compartilhar o link de agendamento apenas em contextos apropriados e tratar os dados recebidos conforme a finalidade da reserva. O prazo de retenção e os procedimentos de exclusão devem ser observados conforme a operação do serviço e a legislação aplicável.
              </p>

              <p className="text-[var(--color-ink-muted)]">
                Usamos os dados da conta e do serviço para liberar o produto, recomendar uma próxima ação, registrar execução e resultados e enviar comunicações que você escolheu. Não vendemos seus dados.
              </p>

              <p className="text-[var(--color-ink-muted)]">
                O acesso e os dados são processados por serviços necessários à operação, como autenticação, banco de dados, hospedagem, e-mail e processamento da compra.
              </p>

              <p className="text-[var(--color-ink-muted)]">
                Você pode solicitar uma cópia dos dados ou a exclusão da sua conta em{" "}
                <Link
                  href="/settings"
                  className="font-medium text-[var(--color-action-primary)] underline underline-offset-4 hover:text-[var(--color-action-hover)] focus-visible:outline-none"
                >
                  Configurações
                </Link>
                , quando estiver autenticada. O pedido será registrado para atendimento.
              </p>

              <div className="border-t border-[var(--color-border-subtle)] pt-6">
                <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
                  Esta página descreve o funcionamento atual do MVP e não substitui orientação jurídica.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Footer Navigation */}
        <footer className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <span>Agenda 80/20</span>
          <div className="flex items-center gap-5">
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Termos de uso
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
