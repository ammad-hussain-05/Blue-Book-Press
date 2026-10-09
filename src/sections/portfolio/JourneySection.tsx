"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { journeyStages, portfolioState } from "@/3d/portfolio/portfolioState";
import { portfolioCopy } from "@/data/portfolio";
import { cn } from "@/lib/cn";

const JourneyScene = dynamic(() => import("@/3d/portfolio/JourneyScene"), { ssr: false, loading: () => null });

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 07 — From Cover to Reader. Pinned: one book goes from blueprint (design)
 * to a full-depth book with its e-book and audio editions (produce) to centre
 * stage on pure black (publish). The steps on the left track the stage.
 */
export function JourneySection() {
  const root = useRef<HTMLElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const c = portfolioCopy.journey;

  useGSAP(
    () => {
      const apply = (q: number) => {
        portfolioState.journey = q;
        const s = journeyStages(q);
        [s.design, s.produce, s.publish].forEach((v, i) => {
          const b = bars.current[i];
          if (b) b.style.transform = `scaleX(${v.toFixed(4)})`;
        });
        const next = s.publish > 0.5 ? 2 : s.produce > 0.5 ? 1 : 0;
        setStep((p) => (p === next ? p : next));
      };
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (st) => apply(st.progress),
        onRefresh: (st) => apply(st.progress),
      });
      apply(0);
    },
    { scope: root },
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} aria-labelledby="journey-title" className="relative h-[300svh] bg-ink text-paper">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-header lg:flex-row">
        {/* WebGL column */}
        <div className="relative order-1 h-[48%] w-full lg:order-2 lg:h-full lg:w-[56%]">
          <div aria-hidden className="absolute inset-0">
            <JourneyScene active={active} />
          </div>
          <p className="pointer-events-none absolute bottom-4 right-[var(--spacing-gutter)] text-[0.62rem] uppercase tracking-[0.18em] text-paper/55">
            {["Trim · bleed · safe area", "Print · e-book · audio", "Ready for readers"][step]}
          </p>
        </div>

        {/* Copy column */}
        <div className="relative order-2 flex flex-1 items-center lg:order-1 lg:w-[44%]">
          <div className="w-full px-[var(--spacing-gutter)] lg:pl-[max(var(--spacing-gutter),calc((100vw_-_var(--container-site))/2_+_var(--spacing-gutter)))] lg:pr-10">
            <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
              <span className="tabular-nums text-blue">(07)</span>
              <span aria-hidden className="h-px w-8 bg-blue/70" />
              {c.label}
            </p>
            <SplitHeading
              lines={c.heading}
              className="mt-5 font-serif text-[clamp(2rem,3.9vw,4.1rem)] leading-[0.98] tracking-[-0.035em]"
              lineClassName="[&:nth-child(2)]:italic"
            />
            <span id="journey-title" className="sr-only">
              {c.heading.join(" ")}
            </span>
            <ol className="mt-5 lg:mt-10">
              {c.steps.map((s, i) => (
                <li
                  key={s.title}
                  className={cn(
                    "border-t border-paper/15 py-3 transition-opacity duration-500 lg:py-4",
                    i === step ? "opacity-100" : "opacity-45",
                  )}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs tabular-nums text-blue">{pad(i + 1)}</span>
                    <span className="font-serif text-[1.4rem] leading-tight lg:text-[1.65rem]">{s.title}</span>
                  </div>
                  <p
                    className={cn(
                      "ml-8 overflow-hidden text-sm leading-relaxed text-paper/75 transition-all duration-700 ease-out-expo",
                      i === step ? "mt-1.5 max-h-16 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    {s.body}
                  </p>
                  <span className="relative mt-3 ml-8 block h-px bg-paper/10">
                    <span
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      className="absolute inset-0 origin-left bg-blue"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
