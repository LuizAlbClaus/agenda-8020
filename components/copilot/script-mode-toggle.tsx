"use client";

import * as React from "react";
import { MessageSquare, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScriptMode = "text" | "audio";

interface ScriptModeToggleProps {
  mode: ScriptMode;
  onChange: (mode: ScriptMode) => void;
  className?: string;
}

export function ScriptModeToggle({ mode, onChange, className }: ScriptModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Alternar formato do roteiro"
      className={cn(
        "inline-flex p-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("text")}
        aria-pressed={mode === "text"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[var(--radius-pill)] text-xs font-bold transition-all duration-150 cursor-pointer",
          mode === "text"
            ? "bg-white text-[var(--color-action-primary)] shadow-xs"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
        )}
      >
        <MessageSquare className="size-3.5" aria-hidden="true" />
        <span>Texto</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("audio")}
        aria-pressed={mode === "audio"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-[var(--radius-pill)] text-xs font-bold transition-all duration-150 cursor-pointer",
          mode === "audio"
            ? "bg-white text-[var(--color-action-primary)] shadow-xs"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
        )}
      >
        <Mic className="size-3.5" aria-hidden="true" />
        <span>Roteiro de Áudio</span>
      </button>
    </div>
  );
}
