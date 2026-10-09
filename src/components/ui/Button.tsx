import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "light" | "white" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper",
  outline: "border border-ink/80 text-ink hover:text-paper",
  light: "bg-paper text-ink border border-line hover:text-paper",
  // For solid-blue surfaces (Publishing Suite).
  white: "bg-paper text-blue-deep hover:text-paper",
  ghost: "border border-paper/60 text-paper hover:text-blue-deep",
};

/** Hover fill per variant (sweeps up from below). */
const fills: Partial<Record<Variant, string>> = {
  white: "bg-ink",
  ghost: "bg-paper",
};

/**
 * Pill button with a deep-blue → blue fill that sweeps up on hover and a label
 * that rolls to a duplicate — subtle, tactile, premium.
 */
export function Button({
  href,
  children,
  variant = "primary",
  className,
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/btn relative isolate inline-flex h-13 items-center gap-3 overflow-hidden rounded-full px-7 text-[0.95rem] font-medium tracking-tight transition-colors duration-500",
        variants[variant],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 translate-y-full rounded-full transition-transform duration-700 ease-out-expo group-hover/btn:translate-y-0",
          fills[variant] ?? "bg-gradient-to-r from-blue-deep to-blue",
        )}
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      {arrow && <ArrowIcon className="size-4 transition-transform duration-500 group-hover/btn:translate-x-1" />}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
