import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        action:
          "bg-[var(--color-action-subtle)] text-[var(--color-action-primary)]",
        revenue:
          "bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]",
        opportunity:
          "bg-[var(--color-opportunity-subtle)] text-[var(--color-opportunity-primary)]",
        neutral:
          "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]",
        danger:
          "bg-[var(--color-danger-subtle)] text-[var(--color-danger-primary)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
