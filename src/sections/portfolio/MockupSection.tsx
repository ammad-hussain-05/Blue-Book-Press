"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { portfolioAssets, portfolioCopy } from "@/data/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 08 — Visual systems. The three-book mockup as a lit centrepiece on a
 * studio plinth, beside the case for designing a system, not a file.
 */
export function MockupSection() {
  const root = useRef<HTMLElement>(null);
  const c = portfolioCopy.mockup;

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-mock-img]",
        { yPercent: 8, scale: 1.12, rotate: -2 },
        {
          yPercent: -6,
          scale: 1,
          rotate: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-mock-frame]", start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="mockup-title"
      className="relative overflow-hidden bg-ink py-[clamp(6rem,12vw,10rem)] text-paper"
    >
      <div className="container-site grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
            <span className="tabular-nums text-blue">(08)</span>
            <span aria-hidden className="h-px w-8 bg-blue/70" />
            {c.label}
          </p>
          <SplitHeading
            lines={c.heading}
            className="mt-6 font-serif text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[0.96] tracking-[-0.04em]"
            lineClassName="[&:nth-child(2)]:italic [&:nth-child(2)]:text-blue"
          />
          <span id="mockup-title" className="sr-only">
            {c.heading.join(" ")}
          </span>
          <motion.p
            className="mt-6 max-w-lg text-lead text-paper/80"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {c.body}
          </motion.p>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-3">
            {c.points.map((p, i) => (
              <motion.li
                key={p.title}
                className="bg-ink p-5"
                initial={{ opacity: 0, y: 20 + i * 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
              >
                <span className="block h-px w-8 bg-blue" />
                <p className="mt-4 font-serif text-xl leading-tight">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">{p.body}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.figure
          data-mock-frame
          className="relative mx-auto w-full max-w-[34rem]"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* studio plinth: the mockup's own light-grey backdrop */}
          <div className="relative aspect-[1067/1471] overflow-hidden rounded-[1.6rem] bg-[#e4e4e4] ring-1 ring-paper/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-mock-img
              src={portfolioAssets.mockup}
              alt="Three hardcover mockups: A Tempting Arrangement by J. Wilder, Chaotic by Shantel Tessier and Call Me Freak by J.A. Roles"
              className="size-full object-cover will-change-transform"
              // Eager: lazy-loading never fires inside the clipped (unrevealed) frame.
              loading="eager"
              decoding="async"
            />
            <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-paper">
              Series system
            </span>
          </div>
          <figcaption className="relative mt-4 flex justify-between text-[0.66rem] uppercase tracking-[0.18em] text-paper/60">
            <span>Hardcover mockups</span>
            <span>Cover · Spine · Back</span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
