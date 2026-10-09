"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useScrollTo } from "@/components/providers/SmoothScrollProvider";
import { suiteNav, type NavChild } from "@/data/navigation";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.76, 0, 0.24, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Stair-step service list (menu overlay). Each row is a solid blue step
 * indented a little further than the one above, hinged on its top edge: it
 * folds down from 90° with a short stagger, so the list unfolds like a
 * staircase. White corner ticks trace the 90° edge of every step.
 */
export function StairList({
  items = suiteNav,
  onNavigate,
  className,
}: {
  items?: NavChild[];
  /** Called after a link is chosen (e.g. to close the menu). */
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const scrollTo = useScrollTo();
  const n = items.length;

  const onClick = (e: React.MouseEvent, href: string) => {
    const [path, hash] = href.split("#");
    // Same page: glide with Lenis rather than jump.
    if (path === pathname && hash) {
      e.preventDefault();
      scrollTo(`#${hash}`);
    }
    onNavigate?.();
  };

  return (
    <ul className={className ? `[perspective:1100px] ${className}` : "[perspective:1100px]"} aria-label="Publishing Suite services">
      {items.map((item, i) => (
        <li key={item.href} style={{ marginLeft: `min(${i * 10}px, ${i * 2.4}vw)` }}>
          <motion.div
            className="origin-top [backface-visibility:hidden]"
            variants={{
              closed: (k: number) => ({
                rotateX: -90,
                opacity: 0,
                transition: { duration: 0.32, ease: EASE_IN, delay: (n - 1 - k) * 0.025 },
              }),
              open: (k: number) => ({
                rotateX: 0,
                opacity: 1,
                transition: { duration: 0.7, ease: EASE, delay: 0.06 + k * 0.055 },
              }),
            }}
            custom={i}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <Link
              href={item.href}
              onClick={(e) => onClick(e, item.href)}
              className="group/step relative flex items-center gap-4 border-t border-paper/20 bg-blue py-2.5 pl-3 pr-4 text-paper transition-colors duration-300 hover:bg-ink focus-visible:bg-ink focus-visible:outline-none"
            >
              {/* 90° corner tick on the step's leading edge */}
              <span aria-hidden className="absolute left-0 top-0 h-2.5 w-px bg-paper/80" />
              <span aria-hidden className="absolute left-0 top-0 h-px w-2.5 bg-paper/80" />
              <span className="w-6 shrink-0 text-[0.68rem] tabular-nums tracking-[0.12em] text-paper/60">{pad(i + 1)}</span>
              <span className="flex-1 text-[0.95rem] leading-tight sm:text-base">{item.label}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover/step:translate-x-0 group-hover/step:opacity-100"
              >
                <path d="M3 3h10v10M13 3 3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              </svg>
            </Link>
          </motion.div>
        </li>
      ))}
    </ul>
  );
}
