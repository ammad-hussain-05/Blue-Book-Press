"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { processSteps } from "@/data/home";
import { cn } from "@/lib/cn";

/**
 * (06) Manuscript → published book. Sticky title column on the left (the
 * book floats beneath it), steps scroll on the right with a scrubbed
 * progress rail.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".process-rail-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".process-steps", start: "top 60%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" data-stage="process" className="relative py-section">
      <div className="container-site grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        <div className="lg:sticky lg:top-[calc(var(--spacing-header)+3rem)] lg:self-start">
          <Reveal>
            <SectionLabel index="07">The Journey</SectionLabel>
          </Reveal>
          <SplitHeading className="mt-8 text-headline" lines={["Manuscript", <em key="t">to published</em>, "book."]} />
          <Reveal delay={0.15} className="mt-6 max-w-sm text-lead text-ink-soft">
            Five considered stages. One team beside you at every step.
          </Reveal>
        </div>

        <div className="process-steps relative pl-10 md:pl-16">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line" />
          <span
            aria-hidden
            className="process-rail-fill absolute bottom-0 left-0 top-0 w-px origin-top bg-gradient-to-b from-blue-deep to-blue"
          />
          <ol>
            {processSteps.map((step, i) => (
              <Step key={step.id} index={i} {...step} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ index, title, body, detail }: { index: number; title: string; body: string; detail: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const active = useInView(ref, { margin: "-42% 0px -42% 0px" });
  const [seen, setSeen] = useState(false);
  if (active && !seen) setSeen(true);

  return (
    <li ref={ref} className="relative py-14 first:pt-0 md:py-20">
      <span
        aria-hidden
        className={cn(
          "absolute -left-10 top-3 size-3 -translate-x-1/2 rounded-full border transition-all duration-700 md:-left-16",
          seen ? "border-transparent bg-gradient-to-br from-blue-deep to-blue scale-125" : "border-ink/30 bg-paper",
        )}
      />
      <div className={cn("transition-opacity duration-700", active || seen ? "opacity-100" : "opacity-35")}>
        <p className="eyebrow text-ink-muted">Stage {String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-4 text-title">{title}</h3>
        <p className="mt-4 max-w-lg text-lead text-ink-soft">{body}</p>
        <p className={cn("mt-6 text-sm transition-colors duration-700", active ? "text-blue" : "text-ink-muted")}>
          {detail}
        </p>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 right-0 font-serif text-[clamp(5rem,9vw,8.5rem)] leading-none text-ink/[0.05] italic"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </li>
  );
}
