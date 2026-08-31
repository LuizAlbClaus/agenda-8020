"use client";

import * as React from "react";
import { CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface CalendarHealthRingProps {
  completedMissions: number;
  totalMissions: number;
  bookedSlotsCount: number;
  openSlotsCount: number;
  recoveredRevenueMonth?: number;
  className?: string;
}

export function CalendarHealthRing({
  completedMissions,
  totalMissions = 3,
  bookedSlotsCount,
  openSlotsCount,
  recoveredRevenueMonth = 0,
  className,
}: CalendarHealthRingProps) {
  const percentage = Math.min(
    100,
    Math.round((completedMissions / Math.max(1, totalMissions)) * 100)
  );
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;
  const isComplete = percentage === 100;

  return (
    <div
      className={cn(
        "w-full rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-4 sm:p-5 border border-[var(--color-border-subtle)] shadow-[var(--shadow-card-resting)] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6",
        className
      )}
    >
      {/* Visual Ring */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="var(--color-border-subtle)"
            strokeWidth="9"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={isComplete ? "var(--color-revenue-primary)" : "var(--color-action-primary)"}
            strokeWidth="9"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6 text-[var(--color-revenue-primary)]" />
          ) : (
            <>
              <span className="text-base sm:text-lg font-extrabold text-[var(--color-ink-solid)]">
                {percentage}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {completedMissions}/{totalMissions}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo & Métricas */}
      <div className="flex-1 text-center sm:text-left space-y-2 w-full">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[var(--color-ink-solid)] leading-tight">
            {isComplete
              ? "🎉 Parabéns! Metas do dia batidas!"
              : `Faltam ${Math.max(0, totalMissions - completedMissions)} micro-ações hoje`}
          </h4>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            {isComplete
              ? "Sua agenda está protegida para os próximos dias."
              : "Micro-ações de 2 minutos para preencher horários vagos."}
          </p>
        </div>

        {/* Status de Vagas & Receita */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <Badge variant="neutral" className="gap-1">
            <Calendar className="w-3 h-3 text-[var(--color-revenue-primary)]" />
            <span><strong>{bookedSlotsCount}</strong> agendados</span>
          </Badge>

          {openSlotsCount > 0 ? (
            <Badge variant="opportunity" className="gap-1">
              <span><strong>{openSlotsCount}</strong> vagos</span>
            </Badge>
          ) : (
            <Badge variant="revenue" className="gap-1">
              <span>Agenda Cheia!</span>
            </Badge>
          )}

          {recoveredRevenueMonth > 0 && (
            <Badge variant="revenue" className="gap-1 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+R$ {recoveredRevenueMonth} este mês</span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
