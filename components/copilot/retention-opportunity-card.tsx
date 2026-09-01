"use client";

import * as React from "react";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DueRetentionItem } from "@/lib/copilot-types";

interface RetentionOpportunityCardProps {
  item: DueRetentionItem;
  onOpenCopilot?: (category: string) => void;
}

export function RetentionOpportunityCard({
  item,
  onOpenCopilot,
}: RetentionOpportunityCardProps) {
  const isOptimal = item.timing_status === "optimal_timing";

  const message = `Oi ${item.customer_name}! Tudo bem? Lembrei que hoje faz ${item.days_since_completed} dias desde o seu último atendimento de ${item.service_name}. Para manter o resultado perfeito e sem danificar, já separei dois horários para o seu retorno nesta semana: quinta às 15h ou sexta às 11h. Qual fica melhor para você?`;

  const handleWhatsApp = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    const cleanPhone = (item.customer_contact ?? "").replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/25 bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={isOptimal ? "revenue" : "opportunity"}>
          <RefreshCw className="size-3" />
          <span>{isOptimal ? "Momento Biológico Perfeito" : "Retorno em Atraso"}</span>
        </Badge>
        <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
          {item.days_since_completed} dias decorridos
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--color-ink-solid)]">
          {item.customer_name} — {item.service_name}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
          {isOptimal
            ? `O ciclo ideal desse serviço é de ${item.recurrence_cycle_days} dias. Entrar em contato agora soa como cuidado profissional proativo.`
            : `A manutenção passou ${item.variance_days} dias do prazo ideal. Uma mensagem atenciosa evita que a cliente busque outro local por urgência.`}
        </p>
      </div>

      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-3 text-xs font-mono text-[var(--color-ink-solid)] line-clamp-2">
        &ldquo;{message}&rdquo;
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          onClick={handleWhatsApp}
          variant="revenue"
          className="flex-1 min-h-[48px] text-xs sm:text-sm font-bold"
        >
          <MessageCircle className="size-4" />
          <span>Enviar no WhatsApp</span>
        </Button>
      </div>
    </article>
  );
}
