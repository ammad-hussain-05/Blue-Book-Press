"use client";

import { motion } from "framer-motion";
import { ABOUT_MODEL } from "@/3d/about/aboutModel";
import { Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { SUITE_PATH } from "@/data/navigation";
import { portfolioCopy } from "@/data/portfolio";
import { site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 09 — Closing invitation. */
export function PortfolioCta() {
  const c = portfolioCopy.cta;
  return (
    <section
      aria-labelledby="pf-cta-title"
      className="relative overflow-hidden bg-ink py-[clamp(6rem,12vw,10rem)] text-paper"
    >
      <div className="container-site relative">
        <div>
          <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
            <span className="tabular-nums text-blue">(09)</span>
            <span aria-hidden className="h-px w-8 bg-blue/70" />
            {c.label}
          </p>
          <motion.span
            aria-hidden
            className="mt-8 block h-[3px] w-24 origin-left bg-blue"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          <SplitHeading
            lines={c.heading}
            className="mt-8 font-serif text-[clamp(2.6rem,5.6vw,5.8rem)] leading-[0.96] tracking-[-0.04em]"
            lineClassName="[&:nth-child(2)]:italic"
          />
          <span id="pf-cta-title" className="sr-only">
            {c.heading.join(" ")}
          </span>
          <motion.p
            className="mt-6 max-w-xl text-lead text-paper/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          >
            {c.body}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
          >
            <Button href="/#contact" variant="white">
              Start Your Book
            </Button>
            <Button href={SUITE_PATH} variant="ghost">
              Explore the Publishing Suite
            </Button>
            <a
              href={`mailto:${site.email}`}
              className="eyebrow ml-1 text-[0.7rem] text-paper/70 underline-offset-4 transition-colors hover:text-paper hover:underline"
            >
              {site.email}
            </a>
          </motion.div>
        </div>
        {/* Attribution for the intro's ring model (required by its licence). */}
        <p className="mt-16 text-[0.6rem] leading-snug text-paper/40">
          Intro ring:{" "}
          <a href={ABOUT_MODEL.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            “{ABOUT_MODEL.title}”
          </a>{" "}
          by {ABOUT_MODEL.author} ·{" "}
          <a href={ABOUT_MODEL.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {ABOUT_MODEL.license}
          </a>
        </p>
      </div>
    </section>
  );
}
