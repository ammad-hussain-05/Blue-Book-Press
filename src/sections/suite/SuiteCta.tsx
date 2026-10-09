"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { SUITE_PATH } from "@/data/navigation";
import { suiteCta, suiteTextures } from "@/data/publishingSuite";
import { site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 11 — closing invitation: a giant texture-filled "Begin", steps and CTAs. */
export function SuiteCta() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-begin]",
        { "--tex-y": "0%", letterSpacing: "0.06em" },
        {
          "--tex-y": "100%",
          letterSpacing: "-0.01em",
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="start"
      aria-labelledby="suite-cta-title"
      className="relative overflow-hidden pb-[clamp(5rem,10vw,9rem)] pt-[clamp(5rem,11vw,10rem)]"
    >
      <div className="container-site">
        <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
          <span className="tabular-nums text-paper">(11)</span>
          <span aria-hidden className="h-px w-8 bg-paper/50" />
          <span>{suiteCta.label}</span>
        </p>

        <p
          data-begin
          aria-hidden
          className="display-caps text-texture mt-6 select-none whitespace-nowrap text-center text-[clamp(6rem,30vw,30rem)] leading-[0.8]"
          style={{ "--tex": `url(${suiteTextures.light})` } as React.CSSProperties}
        >
          Begin
        </p>

        <div className="mt-10 grid gap-12 md:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div>
            <SplitHeading
              lines={suiteCta.heading}
              className="font-serif text-[clamp(2.6rem,5.6vw,5.6rem)] leading-[0.98] tracking-[-0.035em]"
              lineClassName="[&:nth-child(2)]:italic"
            />
            <span id="suite-cta-title" className="sr-only">
              {suiteCta.heading.join(" ")}
            </span>
            <motion.p
              className="mt-6 max-w-xl text-lead text-paper/88"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            >
              {suiteCta.body}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
            >
              <Button href="/#contact" variant="white">
                Start Publishing
              </Button>
              <Button href={`${SUITE_PATH}#suite-intro`} variant="ghost">
                Explore the Process
              </Button>
              <a
                href={`mailto:${site.email}`}
                className="eyebrow ml-1 text-[0.7rem] text-paper/80 underline-offset-4 transition-colors hover:text-paper hover:underline"
              >
                {site.email}
              </a>
            </motion.div>
          </div>

          {/* Steps — climbing, one 90° step each */}
          <ol className="flex flex-col">
            {suiteCta.steps.map((step, i) => (
              <motion.li
                key={step}
                className="flex items-center gap-4 border-l border-t border-paper/40 bg-blue-deep/40 px-5 py-4 last:border-b"
                style={{ marginLeft: `${(suiteCta.steps.length - 1 - i) * 12}%` }}
                initial={{ opacity: 0, rotateX: -90 }}
                whileInView={{ opacity: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.12 }}
              >
                <span className="text-xs tabular-nums text-paper/70">0{i + 1}</span>
                <span className="font-serif text-[1.3rem] leading-tight md:text-[1.5rem]">{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
