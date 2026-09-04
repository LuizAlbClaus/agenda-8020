import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorialUnderlineProps {
  children: ReactNode;
  color?: "coral" | "gold" | "sage";
  className?: string;
}

export function EditorialUnderline({
  children,
  color = "coral",
  className,
}: EditorialUnderlineProps) {
  const strokeColor =
    color === "coral"
      ? "#E07A5F"
      : color === "gold"
      ? "#D4A373"
      : "#4E7A6E";

  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span>{children}</span>
      <svg
        viewBox="0 0 100 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-1.5 left-0 w-full h-[6px] pointer-events-none overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M2 7 C24 3.5 75 3 98 6.5"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 8.5 C35 5 70 5 92 8"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </span>
  );
}
