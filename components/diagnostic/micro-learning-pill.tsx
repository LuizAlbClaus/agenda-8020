"use client";

import * as React from "react";
import { useState, useRef, useTransition } from "react";
import {
  Coffee,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
  Volume2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MicroLearningPillUI } from "@/lib/value-diagnostic-types";
import { markLearningPillConsumedAction } from "@/app/diagnostic/actions";

interface MicroLearningPillProps {
  pill: MicroLearningPillUI;
  workspaceId: string;
}

export function MicroLearningPill({ pill, workspaceId }: MicroLearningPillProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [mode, setMode] = useState<"audio" | "cards">("audio");
  const [copiedScript, setCopiedScript] = useState(false);
  const [isConsumed, setIsConsumed] = useState(pill.consumed_today);
  const [isPending, startTransition] = useTransition();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (!isConsumed) {
            handleMarkConsumed();
          }
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.ended) {
        setIsPlaying(false);
      }
    }
  };

  const handleMarkConsumed = () => {
    startTransition(async () => {
      const res = await markLearningPillConsumedAction({
        workspaceId,
        pillId: pill.pill_id,
      });
      if (res.ok) {
        setIsConsumed(true);
      }
    });
  };

  const handleCopy = async () => {
    if (!pill.quick_script_to_copy) return;
    try {
      await navigator.clipboard.writeText(pill.quick_script_to_copy);
      setCopiedScript(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setTimeout(() => setCopiedScript(false), 3000);
    } catch {}
  };

  return (
    <aside
      aria-label="Pílula de aprendizado de 1 minuto"
      className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)] space-y-4"
    >
      {/* Top Header: Pílula do Café & Status do Café Tomado */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]">
            <Coffee className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
              Pílula do Café • {pill.duration_seconds}s
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              {pill.expert_reference}
            </p>
          </div>
        </div>

        {/* Indicador de Café Tomado (Gamificação Calma) */}
        <div className="flex items-center gap-1.5">
          {isConsumed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] text-xs font-bold">
              <CheckCircle2 className="size-3.5" />
              <span>Café tomado hoje!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] text-xs font-medium">
              1 min de estudo
            </span>
          )}
        </div>
      </div>

      {/* Título & Frase de Impacto */}
      <div>
        <h3 className="text-base font-bold text-[var(--color-ink-solid)] text-balance leading-snug">
          {pill.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)] leading-relaxed text-pretty">
          &ldquo;{pill.catchphrase}&rdquo;
        </p>
      </div>

      {/* Alternador de Modo (Áudio vs Cards) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="inline-flex p-0.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={cn(
              "px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
              mode === "audio"
                ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
            )}
          >
            <Volume2 className="size-3" />
            <span>Ouvir em Áudio</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("cards")}
            className={cn(
              "px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
              mode === "cards"
                ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
            )}
          >
            <BookOpen className="size-3" />
            <span>Ler em Cards</span>
          </button>
        </div>
      </div>

      {/* Modo Áudio */}
      {mode === "audio" ? (
        <div className="space-y-3 pt-1">
          {pill.audio_url && (
            <audio
              ref={audioRef}
              src={pill.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-3.5 border border-[var(--color-border-subtle)] flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar áudio" : "Tocar áudio"}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-white shadow-xs hover:bg-[var(--color-action-hover)] transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              {/* Barra de Progresso do Áudio */}
              <div className="h-1.5 w-full bg-[var(--color-border-strong)]/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-action-primary)] transition-all duration-100"
                  style={{
                    width: `${pill.duration_seconds ? (currentTime / pill.duration_seconds) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-muted)]">
                <span>{Math.floor(currentTime)}s</span>
                <span>{pill.duration_seconds}s</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpeedChange}
              aria-label="Alternar velocidade"
              className="inline-flex min-h-[36px] items-center justify-center px-2.5 rounded-[var(--radius-button)] text-xs font-mono font-bold bg-[var(--color-surface-card)] text-[var(--color-ink-solid)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] cursor-pointer"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Transcrição Textual Rápida */}
          <details className="text-xs text-[var(--color-ink-muted)] pt-1">
            <summary className="cursor-pointer font-bold text-[var(--color-action-primary)] hover:underline">
              Ver transcrição do áudio
            </summary>
            <p className="mt-2 p-3 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] leading-relaxed text-pretty font-sans text-[var(--color-ink-solid)]">
              {pill.audio_transcript}
            </p>
          </details>
        </div>
      ) : (
        /* Modo Cards Visuais (Estilo Stories em 3 Telas) */
        <div className="space-y-3 pt-1">
          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4 border border-[var(--color-border-subtle)] min-h-[110px] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] text-[10px] font-bold text-[var(--color-action-primary)] uppercase tracking-wider mb-2">
                {pill.visual_cards[activeCardIndex]?.tag || `Passo ${activeCardIndex + 1}`}
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-ink-solid)] leading-relaxed">
                {pill.visual_cards[activeCardIndex]?.text}
              </p>
            </div>

            {/* Paginação dos Cards */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--color-border-subtle)]/60">
              <div className="flex items-center gap-1.5">
                {pill.visual_cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCardIndex(i)}
                    aria-label={`Ir para o card ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all cursor-pointer",
                      activeCardIndex === i
                        ? "w-5 bg-[var(--color-action-primary)]"
                        : "w-2 bg-[var(--color-border-strong)]"
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveCardIndex((prev) => (prev + 1) % pill.visual_cards.length)}
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-bold text-[var(--color-action-primary)] cursor-pointer"
              >
                <span>{activeCardIndex === pill.visual_cards.length - 1 ? "Voltar ao Início" : "Próximo"}</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão One-Tap para Copiar Script Prático se existir */}
      {pill.quick_script_to_copy && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--color-ink-muted)] truncate">
            Script prático para WhatsApp:
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 px-3 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-primary)] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer"
          >
            {copiedScript ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span>{copiedScript ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
