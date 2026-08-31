"use client";

import { useTransition, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";


import { activateBelevyBenefit } from "../settings/benefits-actions";

export type BelevyBenefit = {
  benefit_id: string;
  status: string;
  duration_days: number;
  total_days?: number;
  activation_enabled: boolean;
  show_handoff: boolean;
  movement: boolean;
  activated_at?: string | null;
};

type IntegrationStatus = "not_configured" | "not_connected" | "expired" | "unavailable" | "connected";

export default function BenefitCard({
  benefit,
  handoff = false,
  integrationStatus = "not_configured",
  publicUrl,
  loginUrl = "https://belevy.com.br/login",
}: {
  benefit: BelevyBenefit;
  handoff?: boolean;
  integrationStatus?: IntegrationStatus;
  publicUrl?: string;
  loginUrl?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [accessEmailFailed, setAccessEmailFailed] = useState(false);

  const activated = benefit.status === "active";
  const available = benefit.status === "available";
  const expired = benefit.status === "expired" || integrationStatus === "expired";
  const totalDays = benefit.total_days ?? benefit.duration_days ?? 30;

  function activate() {
    setMessage("");
    setError(false);
    setAccessEmailFailed(false);
    startTransition(async () => {
      const result = await activateBelevyBenefit();
      setError(!result.ok);
      if (!result.ok) {
        setMessage(result.error);
      } else if (result.accessEmailSent === true) {
        setMessage("Benefício ativado. Enviamos um link de acesso do Belevy para seu e-mail.");
      } else if (result.accessEmailSent === false) {
        setAccessEmailFailed(true);
        setMessage("Benefício ativado, mas não conseguimos enviar o link de acesso. Abra o login do Belevy e solicite um novo link.");
      } else {
        setMessage("Benefício ativado. Acesse o Belevy para gerenciar seus horários.");
      }
    });
  }

  return (
    <section
      aria-labelledby="belevy-heading"
      className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {expired ? "Benefício Expirado" : activated ? "Belevy Ativo" : `${totalDays} dias cortesia`}
        </span>
        <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
          Parceria Integrada
        </span>
      </div>

      <h2 id="belevy-heading" className="mt-4 text-xl sm:text-2xl font-bold leading-tight text-[var(--color-ink-solid)]">
        {expired
          ? "Seu período de cortesia do Belevy terminou."
          : handoff
          ? "Seu serviço está ganhando ritmo."
          : `Você tem ${totalDays} dias de acesso cortesia ao Belevy Pro.`}
      </h2>

      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty">
        {handoff
          ? "Com as primeiras respostas e clientes aparecendo, você pode ativar a agenda oficial com confirmações por WhatsApp para profissionalizar sua operação."
          : "O Belevy é a ferramenta completa de operação. Você só ativa quando quiser e achar conveniente para sua rotina."}
      </p>

      {/* Feature list */}
      <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
          O que está incluso no benefício:
        </p>
        <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[var(--color-ink-solid)]">
          <li className="flex items-center gap-2">
            <Check className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
            <span>Agenda online oficial sincronizada com horários inteligentes</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
            <span>Confirmações e lembretes automáticos de atendimento por WhatsApp</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
            <span>Cadastro centralizado de clientes e histórico de visitas</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
            <span>Controle financeiro básico de faturamento e recebimentos</span>
          </li>
        </ul>
      </div>

      {/* Reassurance disclaimer */}
      <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-white p-3.5 flex items-start gap-2 text-xs text-[var(--color-ink-muted)]">
        <Info className="size-4 shrink-0 text-[var(--color-action-primary)] mt-0.5" aria-hidden="true" />
        <span>
          <strong>Independência:</strong> O Agenda 80/20 é um produto independente e continua ativo no modo autônomo, sem obrigatoriedade de contratação do Belevy.
        </span>
      </div>


      {/* Action state */}
      {expired ? (
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/30 bg-[var(--color-opportunity-subtle)] p-4 text-xs sm:text-sm text-[var(--color-ink-solid)] space-y-3">
          <p className="font-semibold leading-relaxed">
            Seu período gratuito do Belevy expirou. Suas ações no Agenda 80/20 continuam normalmente. Caso queira reativar a agenda oficial, renove diretamente no Belevy.
          </p>
          <a
            href={loginUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Acessar o Belevy</span>
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      ) : activated ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-4 text-xs sm:text-sm text-[var(--color-revenue-primary)] font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            <span>Seu benefício Belevy está ativo e integrado à sua conta.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-revenue-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-revenue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-revenue-primary)]"
              >
                <span>Abrir minha agenda</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
            <a
              href={loginUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-bold text-[var(--color-ink-solid)] shadow-xs transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <span>Painel Belevy</span>
              <ExternalLink className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : available && benefit.activation_enabled ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={activate}
            disabled={pending}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Ativando seu benefício…</span>
              </>
            ) : (
              <>
                <span>Ativar meus {totalDays} dias cortesia</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 text-xs sm:text-sm text-[var(--color-ink-muted)]">
          A ativação do benefício ainda não está disponível. Avisaremos quando o Belevy estiver pronto.
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-[var(--radius-card)] p-3 text-xs sm:text-sm font-medium flex items-center gap-2 ${
            error
              ? "border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] text-[var(--color-danger-primary)]"
              : "border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]"
          }`}
        >
          {error ? (
            <Info className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          )}
          <div>
            <span>{message}</span>
            {accessEmailFailed && (
              <div className="mt-1">
                <a
                  href={loginUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline underline-offset-4"
                >
                  Abrir página de login do Belevy ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
