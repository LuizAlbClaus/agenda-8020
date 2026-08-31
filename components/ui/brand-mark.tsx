type BrandMarkProps = {
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
};

export function BrandMark({
  className = "",
  labelClassName = "",
  showLabel = true,
}: BrandMarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className="grid h-8 w-8 grid-cols-2 gap-1 rounded-[10px] bg-[var(--color-ink-solid)] p-1"
      >
        <span className="rounded-[3px] bg-[var(--color-action-primary)]" />
        <span className="rounded-[3px] bg-[var(--color-surface-card)]" />
        <span className="col-span-2 rounded-[3px] bg-[var(--color-revenue-primary)]" />
      </span>
      {showLabel ? (
        <span className={`text-sm font-bold tracking-[-0.02em] ${labelClassName}`}>
          Agenda 80/20
        </span>
      ) : null}
    </span>
  );
}
