"use client";

import { motion } from "framer-motion";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

type Line = ReactNode;

/**
 * Masked line-by-line reveal for big serif headings. Pass `lines` so line
 * breaks are art-directed rather than left to the browser. Animates when
 * scrolled into view, or when `play` flips to true (e.g. after preloader).
 */
export function SplitHeading({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  play,
  stagger = 0.09,
}: {
  lines: Line[];
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Controlled mode: animate when true instead of on view. */
  play?: boolean;
  stagger?: number;
}) {
  const controlled = play !== undefined;
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", lineClassName)}>
            <motion.span
              className="block will-change-transform"
              initial={{ y: "110%", rotate: 2 }}
              {...(controlled
                ? { animate: play ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 2 } }
                : { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
              transition={{ duration: 1.25, ease: EASE, delay: delay + i * stagger }}
            >
              {line}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
