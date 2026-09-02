import Image from "next/image";

export type BrandMarkSize = "sm" | "md" | "lg" | "xl";

export type BrandMarkProps = {
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
  size?: BrandMarkSize;
  priority?: boolean;
};

const sizeConfig: Record<
  BrandMarkSize,
  { container: string; iconPx: number; label: string; radius: string }
> = {
  sm: {
    container: "size-6",
    iconPx: 24,
    label: "text-xs font-bold tracking-[-0.01em]",
    radius: "rounded-[6px]",
  },
  md: {
    container: "size-8",
    iconPx: 32,
    label: "text-sm font-bold tracking-[-0.02em]",
    radius: "rounded-[9px]",
  },
  lg: {
    container: "size-10",
    iconPx: 40,
    label: "text-base font-bold tracking-[-0.02em]",
    radius: "rounded-[11px]",
  },
  xl: {
    container: "size-12",
    iconPx: 48,
    label: "text-lg font-bold tracking-[-0.03em]",
    radius: "rounded-[13px]",
  },
};

/**
 * BrandIcon — The official Agenda 80/20 app icon with transparent background.
 */
export function BrandIcon({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: BrandMarkSize;
  className?: string;
  priority?: boolean;
}) {
  const cfg = sizeConfig[size] ?? sizeConfig.md;

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${cfg.container} ${cfg.radius} shadow-xs ${className}`}
    >
      <Image
        src="/Brand/agenda8020-icon-512.png"
        alt="Agenda 80/20"
        width={cfg.iconPx}
        height={cfg.iconPx}
        className="size-full object-contain"
        priority={priority}
      />
    </span>
  );
}

/**
 * BrandMark — The complete brand symbol + logotype.
 */
export function BrandMark({
  className = "",
  labelClassName = "",
  showLabel = true,
  size = "md",
  priority = false,
}: BrandMarkProps) {
  const cfg = sizeConfig[size] ?? sizeConfig.md;

  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <BrandIcon size={size} priority={priority} />
      {showLabel ? (
        <span className={`${cfg.label} text-[var(--color-ink-solid)] ${labelClassName}`}>
          Agenda 80/20
        </span>
      ) : null}
    </span>
  );
}
