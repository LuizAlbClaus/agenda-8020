import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] font-semibold transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none text-center",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-action-primary)] text-white shadow-sm hover:bg-[var(--color-action-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)]",
        revenue:
          "bg-[var(--color-revenue-primary)] text-white shadow-sm hover:bg-[var(--color-revenue-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-revenue-primary)]",
        subtle:
          "bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-subtle)]/80",
        outline:
          "border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)]",
        ghost:
          "text-[var(--color-ink-solid)] hover:bg-[var(--color-surface-muted)]",
        danger:
          "bg-[var(--color-danger-primary)] text-white hover:bg-[var(--color-danger-primary)]/90",
      },
      size: {
        default: "min-h-[48px] px-5 py-3 text-sm",
        sm: "min-h-[40px] px-3.5 py-2 text-xs",
        lg: "min-h-[54px] px-6 py-4 text-base",
        icon: "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
