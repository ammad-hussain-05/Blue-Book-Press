import { cn } from "@/lib/cn";

/** "(02) — Complete Publishing Support" style section marker. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-ink-soft", className)}>
      <span className="text-blue">({index})</span>
      <span aria-hidden className="h-px w-8 bg-ink/25" />
      <span>{children}</span>
    </p>
  );
}
