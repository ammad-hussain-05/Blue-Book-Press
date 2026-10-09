"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { aboutSteps, type AboutAlign } from "@/data/about";
import { site } from "@/data/site";
import { ABOUT_MODEL } from "@/3d/about/aboutModel";
import { tourState } from "@/3d/about/tour";
import { useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";

const AboutScene = dynamic(() => import("@/3d/about/AboutScene"), { ssr: false, loading: () => null });

const N = aboutSteps.length;
/** Scroll distance per step, in viewport heights. */
const STEP_VH = 1.1;
const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Desktop placement of each copy block (mobile always sits bottom). */
const placement: Record<AboutAlign, string> = {
  left: "lg:inset-y-0 lg:left-[var(--spacing-gutter)] lg:right-auto lg:flex lg:max-w-[min(36rem,40vw)] lg:items-center",
  right: "lg:inset-y-0 lg:right-[var(--spacing-gutter)] lg:left-auto lg:flex lg:max-w-[min(34rem,38vw)] lg:items-center",
  center: "lg:inset-x-0 lg:top-[calc(var(--spacing-header)+4vh)] lg:bottom-auto lg:mx-auto lg:max-w-3xl lg:text-center",
};

/**
 * The About page: one pinned, full-screen scene. Scroll progress drives the
 * camera tour (via `tourState`) and cross-fades ten copy states in place —
 * nothing stacks or scrolls past.
 */
export function AboutTour() {
  const root = useRef<HTMLElement>(null);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  const veils = useRef<Record<AboutAlign, HTMLDivElement | null>>({ left: null, right: null, center: null });
  const rail = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const loaded = useUI((s) => s.loaded);

  useGSAP(
    () => {
      const apply = (p: number) => {
        tourState.progress = p;
        const s = p * (N - 1);
        const veil: Record<AboutAlign, number> = { left: 0, right: 0, center: 0 };

        aboutSteps.forEach((step, i) => {
          const el = steps.current[i];
          if (!el) return;
          const d = s - i;
          // Fully visible while |d| < 0.28, gone by |d| > 0.5.
          const o = clamp01((0.5 - Math.abs(d)) / 0.22);
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(-d * 56).toFixed(1)}px, 0)`;
          el.style.visibility = o > 0.001 ? "visible" : "hidden";
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
          veil[step.align] = Math.max(veil[step.align], o);
        });

        (Object.keys(veil) as AboutAlign[]).forEach((k) => {
          const v = veils.current[k];
          if (v) v.style.opacity = String(veil[k]);
        });
        if (rail.current) rail.current.style.transform = `scaleX(${p})`;
        if (counter.current) counter.current.textContent = pad(Math.round(s) + 1);
        if (cue.current) cue.current.style.opacity = String(clamp01(1 - s * 3));
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: () => `+=${window.innerHeight * (N - 1) * STEP_VH}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(0);
    },
    { scope: root },
  );

  // Immersive: hide the page scrollbar while on this page; pointer parallax.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("no-scrollbar");
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tourState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      tourState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      html.classList.remove("no-scrollbar");
      window.removeEventListener("pointermove", onMove);
      tourState.progress = 0;
    };
  }, []);

  return (
    <section ref={root} className="relative h-svh min-h-[600px] w-full overflow-hidden bg-paper" aria-label="About Blue Book Press">
      {/* 3D scene */}
      <div
        aria-hidden
        className={cn("absolute inset-0 transition-opacity duration-[1600ms] ease-out-expo", loaded ? "opacity-100" : "opacity-0")}
      >
        <AboutScene />
      </div>

      {/* Readability veils — fade in on the side the current copy occupies */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          ref={(el) => {
            veils.current.left = el;
          }}
          className="absolute inset-0 hidden bg-gradient-to-r from-paper/90 via-paper/55 via-35% to-transparent to-60% lg:block"
          style={{ opacity: 1 }}
        />
        <div
          ref={(el) => {
            veils.current.right = el;
          }}
          className="absolute inset-0 hidden bg-gradient-to-l from-paper/90 via-paper/55 via-35% to-transparent to-60% lg:block"
          style={{ opacity: 0 }}
        />
        <div
          ref={(el) => {
            veils.current.center = el;
          }}
          className="absolute inset-0 hidden bg-[radial-gradient(ellipse_60%_45%_at_50%_30%,rgba(255,255,255,0.88),rgba(255,255,255,0.4)_55%,transparent_80%)] lg:block"
          style={{ opacity: 0 }}
        />
        {/* Mobile: copy always lives in the lower half */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-paper from-50% via-paper/85 to-transparent lg:hidden" />
      </div>

      {/* Copy states — stacked in place, cross-faded by scroll */}
      {aboutSteps.map((step, i) => (
        <div
          key={step.id}
          className={cn(
            "absolute inset-x-0 bottom-0 px-[var(--spacing-gutter)] pb-20 sm:pb-24 lg:px-0 lg:pb-0",
            placement[step.align],
          )}
        >
          <div
            ref={(el) => {
              steps.current[i] = el;
            }}
            className="w-full will-change-transform"
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
          >
            <p className={cn("eyebrow flex items-center gap-3 text-ink-soft", step.align === "center" && "lg:justify-center")}>
              <span className="tabular-nums text-blue">{pad(i + 1)}</span>
              <span aria-hidden className="h-px w-8 bg-blue/60" />
              <span>{step.label}</span>
            </p>
            {i === 0 ? (
              <h1 className="mt-4 font-serif text-[clamp(2rem,min(4.4vw,8vh),4.6rem)] leading-[1] tracking-[-0.035em] lg:mt-5">
                {step.heading.map((line, l) => (
                  <span key={l} className={cn("block", l === 1 && "italic")}>
                    {line}
                  </span>
                ))}
              </h1>
            ) : (
              <h2 className="mt-4 font-serif text-[clamp(2rem,min(4.4vw,8vh),4.6rem)] leading-[1] tracking-[-0.035em] lg:mt-5">
                {step.heading.map((line, l) => (
                  <span key={l} className={cn("block", l === 1 && "italic", l === 1 && step.cta && "text-gradient-ink-blue")}>
                    {line}
                  </span>
                ))}
              </h2>
            )}
            <p
              className={cn(
                "mt-4 max-w-[34rem] text-[0.92rem] leading-[1.65] text-ink-soft sm:text-[0.98rem] lg:mt-5 lg:text-[clamp(0.95rem,min(1.05vw,2.1vh),1.1rem)] lg:leading-[1.72]",
                step.align === "center" && "lg:mx-auto lg:max-w-[40rem]",
              )}
            >
              {step.body}
            </p>

            {step.points && (
              <ul
                className={cn(
                  "mt-5 flex max-w-2xl flex-wrap gap-x-5 gap-y-2 text-[0.85rem] text-ink sm:text-[0.92rem] lg:mt-6 lg:gap-x-6 lg:gap-y-2.5",
                  step.align === "center" && "lg:mx-auto lg:justify-center",
                )}
              >
                {step.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5">
                    <span aria-hidden className="size-1.5 rounded-full bg-blue" />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {step.cta && (
              <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-8">
                <Button href="/contact">Begin Your Story</Button>
                <Button href="/publishing-suite" variant="light">
                  Explore Services
                </Button>
                <a href={`mailto:${site.email}`} className="eyebrow ml-2 text-ink-soft transition-colors hover:text-blue">
                  {site.email}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Progress rail + counter */}
      <div className="pointer-events-none absolute bottom-8 right-[var(--spacing-gutter)] flex items-center gap-4">
        <p className="eyebrow tabular-nums text-ink-muted">
          <span ref={counter} className="text-blue">
            01
          </span>{" "}
          / {pad(N)}
        </p>
        <span className="relative hidden h-px w-40 bg-line lg:block">
          <span ref={rail} className="absolute inset-0 origin-left bg-blue" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>

      {/* Scroll cue (first step only) */}
      <div ref={cue} className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="eyebrow text-[0.65rem] text-ink-muted">Scroll to explore</span>
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-blue" />
        </span>
      </div>

      {/* Required attribution for the 3D model (CC BY) */}
      <p className="absolute bottom-3 left-[var(--spacing-gutter)] text-[0.62rem] text-ink-muted/80">
        3D model:{" "}
        <a href={ABOUT_MODEL.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          “{ABOUT_MODEL.title}”
        </a>{" "}
        by {ABOUT_MODEL.author} ·{" "}
        <a href={ABOUT_MODEL.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          {ABOUT_MODEL.license}
        </a>
      </p>
    </section>
  );
}
