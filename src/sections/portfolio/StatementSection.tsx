"use client";

import { motion } from "framer-motion";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { portfolioCopy } from "@/data/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 04 — What the work is. Huge serif, blue accent rules, white on black. */
export function StatementSection() {
  const c = portfolioCopy.statement;
  return (
    <section
      aria-labelledby="statement-title"
      className="relative overflow-hidden bg-ink py-[clamp(6rem,13vw,11rem)] text-paper"
    >
      <div className="container-site relative">
        <div>
          <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
            <span className="tabular-nums text-blue">(04)</span>
            <span aria-hidden className="h-px w-8 bg-blue/70" />
            {c.label}
          </p>

          <div className="relative mt-8">
            {/* blue accent rule that draws down beside the heading */}
            <motion.span
              aria-hidden
              className="absolute top-[0.25em] hidden h-[calc(100%-0.5em)] w-[3px] origin-top bg-blue md:block"
              style={{ left: "calc(var(--spacing-gutter) * -0.6)" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
            />
            <SplitHeading
              lines={c.heading.map((line, i) => (i === 1 ? <em key={i}>{line}</em> : line))}
              className="font-serif text-[clamp(2.6rem,5.8vw,6.2rem)] leading-[0.96] tracking-[-0.04em]"
              lineClassName="[&:nth-child(3)]:text-blue"
            />
            <span id="statement-title" className="sr-only">
              {c.heading.join(" ")}
            </span>
          </div>

          <div className="mt-12 grid max-w-6xl gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
            <motion.p
              className="text-lead text-paper/80"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              {c.body}
            </motion.p>
            <ul className="border-t border-paper/15">
              {c.pillars.map((p, i) => (
                <motion.li
                  key={p}
                  className="group flex items-center justify-between border-b border-paper/15 py-3.5"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.07 }}
                >
                  <span className="font-serif text-[1.35rem] leading-tight transition-colors duration-500 group-hover:text-blue">
                    {p}
                  </span>
                  <span className="text-xs tabular-nums text-paper/50">0{i + 1}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
