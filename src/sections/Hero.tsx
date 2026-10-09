"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { useUI } from "@/lib/uiStore";
import { site } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero. The headline words flank the large centre book (rendered on the
 * fixed 3D stage in front of this section); four satellites orbit the corners.
 */
export function Hero() {
  const loaded = useUI((s) => s.loaded);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section
      id="top"
      data-stage="hero"
      className="relative flex min-h-[640px] flex-col overflow-hidden pt-header h-svh"
    >
      <HeroBackdrop />

      <div className="container-site relative flex flex-1 flex-col pb-8 md:pb-10">
        {/* Top meta row */}
        <motion.div {...fade(0.2)} className="flex items-center justify-between border-b border-line pb-4 pt-2">
          <p className="eyebrow text-ink-soft">
            Print <span className="text-blue">·</span> Digital <span className="text-blue">·</span> Audio
          </p>
          <p className="eyebrow hidden text-ink-soft sm:block">Global Publishing Studio</p>
        </motion.div>

        {/* Headline — stacked on mobile/tablet, words flank the centre book on lg+ */}
        <div className="flex flex-1 flex-col justify-end lg:justify-center">
          <h1 className="sr-only">{site.tagline}</h1>
          <div
            aria-hidden
            className="font-serif text-[min(14vw,10.5vh)] font-medium leading-[0.96] tracking-[-0.04em] lg:text-[min(10.2vw,17vh,13rem)] lg:leading-[0.94]"
          >
            <div className="flex flex-wrap gap-x-[0.24em] lg:justify-between">
              <SplitHeading as="span" play={loaded} delay={0.25} lines={["Publish"]} className="block" />
              <SplitHeading as="span" play={loaded} delay={0.33} lines={["Your"]} className="block" />
            </div>
            <div className="flex flex-wrap gap-x-[0.24em] lg:justify-between lg:pl-[4vw]">
              <SplitHeading as="span" play={loaded} delay={0.41} lines={[<em key="s">Story</em>]} className="block" />
              <SplitHeading
                as="span"
                play={loaded}
                delay={0.49}
                lines={[
                  <span key="g" className="text-gradient-ink-blue italic">
                    Globally
                  </span>,
                ]}
                className="block"
              />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 grid items-end gap-6 lg:mt-0 lg:grid-cols-[1fr_auto_1fr]">
          <motion.p {...fade(0.7)} className="max-w-sm text-[1.02rem] leading-relaxed text-ink-soft">
            Professional print, digital, and audiobook publishing services designed to turn manuscripts into
            world-class books.
          </motion.p>

          <motion.div {...fade(0.9)} className="hidden flex-col items-center gap-3 lg:flex">
            <span className="eyebrow text-[0.65rem] text-ink-muted">Scroll</span>
            <span className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gradient-to-b from-blue-deep to-blue" />
            </span>
          </motion.div>

          <motion.div {...fade(0.8)} className="flex flex-wrap gap-3 lg:justify-end">
            <Button href="#contact">Start Publishing</Button>
            <Button href="#services" variant="outline">
              Explore Services
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Soft brand light-wash behind the hero (very low intensity). */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[10%] -top-[20%] size-[55vw] rounded-full bg-blue/[0.07] blur-[120px]" />
      <div className="absolute -bottom-[25%] -right-[10%] size-[50vw] rounded-full bg-blue-light/[0.07] blur-[120px]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
    </div>
  );
}
