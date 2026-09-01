"use client";

import * as React from "react";
import { Clock, Volume2, CheckCircle2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AudioTeleprompterProps {
  script: string;
  durationSeconds: number;
  toneGuide: string;
  onDone?: () => void;
}

export function AudioTeleprompter({
  script,
  durationSeconds,
  toneGuide,
  onDone,
}: AudioTeleprompterProps) {
  const [completed, setCompleted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleComplete = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    setCompleted(true);
    onDone?.();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Meta Header */}
      <div className="flex items-center justify-between">
        <Badge variant="action" className="font-bold">
          <Clock className="size-3" />
          <span>Duração: ~{durationSeconds} segundos</span>
        </Badge>
        <span className="text-[11px] text-[var(--color-ink-muted)] font-medium">
          Grave segurando o mic no WhatsApp
        </span>
      </div>

      {/* Guia de Tom */}
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-2.5 flex items-start gap-2">
        <Volume2 className="size-4 text-[var(--color-action-primary)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-ink-muted)] leading-tight">
          <strong className="text-[var(--color-ink-solid)]">Tom recomendado:</strong> {toneGuide}
        </p>
      </div>

      {/* Teleprompter Box */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-strong)] bg-white p-4 sm:p-5 shadow-xs">
        <p className="text-sm sm:text-base font-medium leading-relaxed text-[var(--color-ink-solid)] space-y-2 whitespace-pre-line text-pretty">
          {script.split("\n").map((paragraph, i) => (
            <span key={i} className="block">
              {paragraph}
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <Button
          onClick={handleComplete}
          variant={completed ? "revenue" : "primary"}
          fullWidth
          className="min-h-[48px] text-sm font-bold flex-1"
        >
          {completed ? (
            <>
              <CheckCircle2 className="size-4" />
              <span>Áudio Enviado!</span>
            </>
          ) : (
            <span>Marcar como Enviado</span>
          )}
        </Button>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar texto do roteiro de áudio"
          className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-1.5 px-4 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] shrink-0"
        >
          {copied ? <CheckCircle2 className="size-4 text-[var(--color-revenue-primary)]" /> : <Copy className="size-4" />}
          <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
        </button>
      </div>
    </div>
  );
}
