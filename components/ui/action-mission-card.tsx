"use client";

import * as React from "react";
import { MessageCircle, Clock, Zap, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ActionMissionCardProps {
  id: string;
  actionVerb: string;
  targetAudience: string;
  reasonWhy: string;
  estimatedMinutes?: number;
  potentialRevenueBRL?: number;
  prewrittenMessage: string;
  recipientCount?: number;
  className?: string;
  onExecute?: (id: string, message: string) => void;
}

export function ActionMissionCard({
  id,
  actionVerb,
  targetAudience,
  reasonWhy,
  estimatedMinutes = 2,
  potentialRevenueBRL,
  prewrittenMessage,
  recipientCount = 1,
  className,
  onExecute,
}: ActionMissionCardProps) {
  const [completed, setCompleted] = React.useState(false);

  const handleAction = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignora caso permissão não esteja disponível
      }
    }
    setCompleted(true);
    onExecute?.(id, prewrittenMessage);
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-4 sm:p-5 border border-[var(--color-border-subtle)] shadow-[var(--shadow-card-resting)] transition-all duration-200",
        completed ? "opacity-60 bg-[var(--color-surface-muted)] pointer-events-none" : "hover:border-[var(--color-action-primary)]",
        className
      )}
    >
      {/* Top Header: Badges & Tempo */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant="action" className="uppercase tracking-wide font-bold text-[11px]">
          <Zap className="w-3 h-3 fill-current" />
          {actionVerb}
        </Badge>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
            <Clock className="w-3.5 h-3.5" />
            {estimatedMinutes} min
          </span>
          {potentialRevenueBRL && (
            <Badge variant="revenue" className="font-bold">
              <Sparkles className="w-3 h-3" />
              +R$ {potentialRevenueBRL}
            </Badge>
          )}
        </div>
      </div>

      {/* Título & Justificativa */}
      <h3 className="text-base font-bold text-[var(--color-ink-solid)] tracking-tight leading-snug mb-1 text-balance">
        {targetAudience}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3 text-pretty">
        {reasonWhy}
      </p>

      {/* Preview da Mensagem */}
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-3 mb-4 border border-[var(--color-border-subtle)] text-xs text-[var(--color-ink-solid)] font-mono leading-relaxed line-clamp-3">
        &ldquo;{prewrittenMessage}&rdquo;
      </div>

      {/* Botão One-Tap para WhatsApp */}
      <Button
        onClick={handleAction}
        disabled={completed}
        variant={completed ? "revenue" : "primary"}
        fullWidth
        className="text-sm font-bold tracking-tight"
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Missão Concluída!</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Abrir WhatsApp ({recipientCount} {recipientCount === 1 ? "cliente" : "clientes"})</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-75" />
          </>
        )}
      </Button>
    </div>
  );
}
