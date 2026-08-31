import * as React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SlotAlertProps {
  dateLabel: string;
  timeLabel: string;
  suggestedActionLabel?: string;
  className?: string;
  onTakeAction?: () => void;
}

export function SlotAlert({
  dateLabel,
  timeLabel,
  suggestedActionLabel = "Oferecer horário para lista de espera",
  className,
  onTakeAction,
}: SlotAlertProps) {
  return (
    <div
      className={cn(
        "w-full rounded-[var(--radius-card)] bg-[var(--color-opportunity-subtle)] p-4 border border-[var(--color-opportunity-primary)]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-[var(--color-opportunity-primary)]/15 text-[var(--color-opportunity-primary)] flex-shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--color-ink-solid)]">
            Horário vago em {dateLabel} às {timeLabel}
          </h4>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            {suggestedActionLabel}
          </p>
        </div>
      </div>

      {onTakeAction && (
        <Button
          size="sm"
          variant="outline"
          onClick={onTakeAction}
          className="w-full sm:w-auto border-[var(--color-opportunity-primary)]/60 text-xs font-bold hover:bg-white"
        >
          <span>Preencher Horário</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-amber-800" />
        </Button>
      )}
    </div>
  );
}
