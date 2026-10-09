"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DrawLine, Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { audiobookFeatures } from "@/data/home";

const BARS = 56;
// Deterministic pseudo-random heights (no hydration mismatch).
const heights = Array.from({ length: BARS }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 0.75);

/** (07) Audiobook production — storytelling + a living waveform. */
export function Audiobooks() {
  return (
    <section id="audiobooks" data-stage="audiobooks" className="relative overflow-hidden py-section">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[10%] size-[45rem] rounded-full bg-blue-light/[0.06] blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[20%] size-[35rem] rounded-full bg-blue/[0.06] blur-[110px]" />
      </div>

      <div className="container-site">
        <div className="lg:ml-[44%]">
          <Reveal>
            <SectionLabel index="08">
              Audiobook Production
            </SectionLabel>
          </Reveal>
          <SplitHeading
            className="mt-8 text-headline"
            lines={["Turn your manuscript", "into a professional", <em key="l">listening experience.</em>]}
          />
          <Reveal delay={0.15} className="mt-8 max-w-xl text-lead text-ink-soft">
            Some readers turn pages. Others press play on the commute, on a run, at the end of a long day. We
            give your story a voice worthy of it — cast, recorded, edited and mastered for every major audio
            platform.
          </Reveal>

          {/* Now-playing card */}
          <Reveal delay={0.2} className="mt-12 rounded-[1.75rem] border border-line bg-paper/80 p-6 backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-[0.65rem] text-ink-muted">Now narrating</p>
                <p className="mt-2 font-serif text-2xl italic">Chapter One — The Coastline</p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper">
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <path d="M5 3.5v9l7-4.5-7-4.5Z" fill="currentColor" />
                </svg>
              </span>
            </div>
            <div aria-hidden className="mt-6 flex h-16 items-center gap-[3px]">
              {heights.map((h, i) => (
                <motion.span
                  key={i}
                  className="w-full rounded-full bg-gradient-to-t from-blue-deep to-blue"
                  style={{ height: `${(h * 100).toFixed(2)}%`, opacity: i < BARS * 0.38 ? 1 : 0.25 }}
                  animate={{ scaleY: [1, 0.45 + (i % 5) * 0.12, 1] }}
                  transition={{ duration: 1.4 + (i % 7) * 0.18, repeat: Infinity, ease: "easeInOut", delay: (i % 9) * 0.07 }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs tabular-nums text-ink-muted">
              <span>04:12</span>
              <span>11:05</span>
            </div>
          </Reveal>

          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {audiobookFeatures.map((f, i) => (
              <li key={f.title}>
                <DrawLine delay={i * 0.08} />
                <Reveal delay={i * 0.08} className="py-6">
                  <h3 className="text-[1.35rem]">{f.title}</h3>
                  <p className="mt-2 text-ink-soft">{f.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className="mt-10">
            <Button href="#contact">Produce My Audiobook</Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
