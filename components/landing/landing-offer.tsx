"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCheckoutUrl } from "@/lib/checkout";
import { ExitDownsellModal } from "@/components/exit-downsell-modal";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface LandingOfferProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const includedFeatures = [
  "365 dias de acesso irrestrito ao aplicativo Agenda 80/20",
  "Growth Coach diário: 1 próxima ação clara por dia baseada no seu momento real",
  "Roteiro de execução em até 3 passos mastigados",
  "Mensagens e scripts prontos para WhatsApp em modo Texto e Áudio guiado",
  "SOS Copiloto de Conversas: respostas para 'achei caro', 'vou ver' e objeções",
  "Radar de Retenção: avisos na janela recomendada de retorno (21 a 28 dias)",
  "Diagnóstico de Percepção de Valor: missões práticas para valorizar seu atendimento",
  "Link público de agendamento básico para clientes escolherem serviço e horário",
  "Acompanhamento de progresso com contagem de ações, interessados e agendamentos",
  "30 dias de cortesia do Belevy Pro para quando sua operação precisar de lembretes automáticos",
  "Acesso imediato no celular sem senhas para memorizar",
];

export function LandingOffer({ searchParams }: LandingOfferProps) {
  const checkoutUrl = getCheckoutUrl("annual", searchParams);

  const handleCheckoutClick = () => {
    trackFunnelEvent("checkout_redirect_clicked", { plan: "annual", price: 147 });
  };

  return (
    <section
      id="oferta"
      aria-labelledby="offer-heading"
      className="scroll-mt-12 border-t border-[var(--color-border-subtle)] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="action" className="px-3 py-1 text-xs font-bold">
          Acesso Completo · 12 Meses
        </Badge>
        <h2
          id="offer-heading"
          className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-balance text-[var(--color-ink-solid)] sm:text-4xl lg:text-5xl"
        >
          Menos de R$ 0,50 por dia para ter clareza do seu próximo movimento comercial.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Um único atendimento adicional conquistado com a clareza do aplicativo já paga com folga todo o seu ano de acesso.
        </p>
      </div>

      {/* Hero Pricing Card (Foco Único no Plano Anual) */}
      <div className="mx-auto mt-12 max-w-xl">
        <div className="relative flex flex-col justify-between rounded-[var(--radius-card)] border-2 border-[var(--color-revenue-primary)] bg-[var(--color-surface-card)] p-6 sm:p-8 shadow-[var(--shadow-card-elevated)]">
          <div className="absolute -top-3.5 right-6 sm:right-8">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Oferta Principal · 12 Meses
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-ink-solid)]">
                  Agenda 80/20 — Acesso Completo
                </h3>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  365 dias de direcionamento, segurança e execução no seu negócio
                </p>
              </div>
              <Badge variant="revenue" className="text-xs">
                12 meses
              </Badge>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-[var(--color-ink-solid)] sm:text-5xl lg:text-6xl">
                  12x de R$ 15,19
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)]">
                  no cartão
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)]">
                  Desconto à vista
                </span>
                <span className="text-sm font-bold text-[var(--color-ink-solid)]">
                  ou R$ 147 em pagamento único (PIX ou cartão)
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-[var(--color-revenue-primary)]">
                Sem renovação surpresa. 12 meses inteiros de acesso.
              </p>
            </div>

            <ul className="mt-8 space-y-3.5 border-t border-[var(--color-border-subtle)] pt-6 text-xs sm:text-sm text-[var(--color-ink-solid)]">
              {includedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href={checkoutUrl}
              onClick={handleCheckoutClick}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] active:scale-98"
            >
              <span>Montar meu primeiro plano</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="mt-2.5 text-center text-xs text-[var(--color-ink-muted)]">
              Pagamento 100% seguro via Cakto · Acesso imediato no e-mail
            </p>
          </div>
        </div>

        {/* Modal sutil de Downsell para quem hesitar */}
        <ExitDownsellModal searchParams={searchParams} />
      </div>

      {/* Guarantee Box */}
      <div className="mx-auto mt-12 max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white text-[var(--color-revenue-primary)] shadow-xs">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[var(--color-ink-solid)] sm:text-lg">
              Garantia incondicional de 7 dias
            </h4>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty">
              Teste o Agenda 80/20 na sua rotina prática. Abra no intervalo, use o SOS Copiloto, execute as recomendações e veja o movimento das suas conversas. Se sentir que o método não se encaixa no seu dia a dia, devolvemos 100% do seu pagamento com um simples contato.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
