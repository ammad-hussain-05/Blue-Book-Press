"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { resetSuiteState, suiteState } from "@/3d/suite/suiteState";
import { ABOUT_MODEL } from "@/3d/about/aboutModel";
import { suiteFormats, suiteHero, suiteReveal, suiteTextures } from "@/data/publishingSuite";
import { useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";

const SuiteScene = dynamic(() => import("@/3d/suite/SuiteScene"), { ssr: false, loading: () => null });

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Sections 01–03 of the Publishing Suite. One sticky WebGL stage runs
 * behind all three and is gone by the end of section 03:
 *  01 Hero — all five books, editorial heading above and below.
 *  02 Reveal — books zoom in one by one from the camera into a staircase.
 *  03 Formats — books regroup as Print / Digital / Audio, then leave.
 */
export function SuiteIntro() {
  const root = useRef<HTMLDivElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const reveal = useRef<HTMLElement>(null);
  const formats = useRef<HTMLElement>(null);
  const loaded = useUI((s) => s.loaded);
  const [active, setActive] = useState(true);
  const [stage, setStage] = useState(0);
  const [formatsOn, setFormatsOn] = useState(false);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: hero.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (s) => (suiteState.hero = s.progress),
        onRefresh: (s) => (suiteState.hero = s.progress),
      });

      ScrollTrigger.create({
        trigger: reveal.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => {
          suiteState.reveal = s.progress;
          setStage(Math.min(4, Math.max(0, Math.floor((s.progress - 0.04) / 0.15))));
        },
        onRefresh: (s) => (suiteState.reveal = s.progress),
      });

      ScrollTrigger.create({
        trigger: formats.current,
        start: "top bottom",
        end: "bottom bottom",
        onUpdate: (s) => {
          const q = s.progress;
          suiteState.formats = q;
          setFormatsOn(q > 0.24);
          // The 3D stage dissolves before the services begin.
          if (stageEl.current) stageEl.current.style.opacity = String(1 - smooth(0.84, 0.99, q));
        },
        onRefresh: (s) => (suiteState.formats = s.progress),
      });

      // Hero copy drifts apart as the books fly past the camera.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
      });
      tl.to("[data-hero-above]", { yPercent: -60, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-below]", { yPercent: 50, opacity: 0, letterSpacing: "0.04em", ease: "none" }, 0)
        .to("[data-hero-meta]", { opacity: 0, ease: "none" }, 0);

      // Section 03: format words sink into their textures as you scroll.
      gsap.fromTo(
        "[data-format-word]",
        { "--tex-y": "0%" },
        {
          "--tex-y": "100%",
          ease: "none",
          scrollTrigger: { trigger: formats.current, start: "top bottom", end: "bottom bottom", scrub: true },
        },
      );
    },
    { scope: root },
  );

  // Intro: the camera pulls back from inside the cluster once loaded.
  useEffect(() => {
    if (!loaded) return;
    const tween = gsap.to(suiteState, { intro: 1, duration: 2.6, ease: "expo.out", delay: 0.15 });
    return () => {
      tween.kill();
    };
  }, [loaded]);

  // Render the canvas only while sections 01–03 are on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      suiteState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      suiteState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      resetSuiteState();
    };
  }, []);

  return (
    <div ref={root} className="relative">
      {/* Sticky WebGL stage, behind sections 01–03 only */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          ref={stageEl}
          className={cn(
            "sticky top-0 h-svh w-full transition-[filter] duration-[1600ms] ease-out-expo",
            loaded ? "blur-0" : "blur-md",
          )}
        >
          <SuiteScene active={active} />
        </div>
      </div>

      {/* 01 — Hero */}
      <section
        ref={hero}
        id="suite-intro"
        aria-label="The Author's Publishing Suite"
        className="relative flex h-svh min-h-[620px] flex-col pt-header"
      >
        <div data-hero-meta className="container-site flex items-center justify-between pt-4 md:pt-6">
          <motion.p
            className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80"
            initial={{ opacity: 0, y: 12 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.3 }}
          >
            <span className="tabular-nums">(01)</span>
            <span aria-hidden className="h-px w-8 bg-paper/50" />
            {suiteHero.eyebrow}
          </motion.p>
          <motion.p
            className="eyebrow hidden text-[0.68rem] text-paper/80 sm:block"
            initial={{ opacity: 0, y: 12 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          >
            Print · Digital · Audio
          </motion.p>
        </div>

        <h1 className="container-site flex flex-1 flex-col justify-between pb-[4.5rem] pt-3 text-center md:pb-24 md:pt-4">
          <span data-hero-above className="block">
            <SplitHeading
              as="span"
              play={loaded}
              delay={0.35}
              lines={[suiteHero.above]}
              className="block font-serif text-[clamp(2.7rem,7.4vw,8.2rem)] italic leading-[0.95] tracking-[-0.04em]"
            />
          </span>
          <span data-hero-below className="block">
            <span className="sr-only">{suiteHero.below}</span>
            <span aria-hidden className="display-caps flex justify-center overflow-hidden pb-[0.04em] text-[clamp(2.9rem,11.6vw,11.4rem)]">
              {suiteHero.below.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ y: "105%" }}
                  animate={loaded ? { y: "0%" } : {}}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.55 + Math.abs(i - 7.5) * 0.045 }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </span>
          </span>
        </h1>

        <div data-hero-meta className="container-site absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-6">
          <motion.p
            className="hidden max-w-xs text-sm leading-relaxed text-paper/85 md:block"
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 1.1 }}
          >
            {suiteHero.intro}
          </motion.p>
          <div className="mx-auto flex flex-col items-center gap-2.5 md:mx-0">
            <span className="eyebrow text-[0.62rem] text-paper/75">Scroll to enter</span>
            <span className="relative block h-9 w-px overflow-hidden bg-paper/25">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-paper" />
            </span>
          </div>
        </div>

        {/* Required attribution for the ring model (CC BY) */}
        <p data-hero-meta className="absolute bottom-1.5 right-[var(--spacing-gutter)] text-[0.58rem] text-paper/60">
          Ring:{" "}
          <a href={ABOUT_MODEL.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            “{ABOUT_MODEL.title}”
          </a>{" "}
          by {ABOUT_MODEL.author} ·{" "}
          <a href={ABOUT_MODEL.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {ABOUT_MODEL.license}
          </a>
        </p>
      </section>

      {/* 02 — Books arrive one by one */}
      <section ref={reveal} aria-labelledby="suite-reveal-title" className="relative h-[360svh]">
        <div className="sticky top-0 flex h-svh items-start pt-[calc(var(--spacing-header)+1.5rem)] lg:items-center lg:pt-header">
          <div className="container-site">
            <div className="max-w-xl lg:max-w-[min(34rem,40vw)]">
              <Label index="02">{suiteReveal.label}</Label>
              <SplitHeading
                lines={suiteReveal.heading}
                className="mt-5 font-serif text-[clamp(2.3rem,4.6vw,4.7rem)] leading-[0.98] tracking-[-0.035em]"
                lineClassName="[&:nth-child(2)]:italic"
              />
              <p id="suite-reveal-title" className="sr-only">
                Complete publishing support
              </p>
              <motion.p
                className="mt-5 hidden max-w-md text-[1.02rem] leading-relaxed text-paper/85 sm:block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE, delay: 0.2 }}
              >
                {suiteReveal.body}
              </motion.p>

              <ol className="mt-7 border-t border-paper/20 lg:mt-9">
                {suiteReveal.stages.map((s, i) => {
                  const on = i <= stage;
                  const current = i === stage;
                  return (
                    <li
                      key={s.title}
                      className={cn(
                        "grid grid-cols-[2.25rem_1fr] items-baseline border-b border-paper/20 py-2.5 transition-all duration-700 ease-out-expo lg:py-3.5",
                        on ? "opacity-100" : "opacity-35",
                        !current && "max-lg:hidden",
                      )}
                    >
                      <span className="text-xs tabular-nums text-paper/70">{pad(i + 1)}</span>
                      <span>
                        <span
                          className={cn(
                            "block font-serif text-[1.35rem] leading-tight transition-transform duration-700 ease-out-expo lg:text-[1.55rem]",
                            current && "italic lg:translate-x-2",
                          )}
                        >
                          {s.title}
                        </span>
                        <span
                          className={cn(
                            "block overflow-hidden text-sm text-paper/80 transition-all duration-700 ease-out-expo",
                            current ? "mt-1 max-h-12 opacity-100" : "max-h-0 opacity-0",
                          )}
                        >
                          {s.body}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 flex items-center gap-3 text-xs tabular-nums text-paper/70 lg:hidden">
                {pad(stage + 1)} / 05
                <span className="relative block h-px w-24 bg-paper/25">
                  <span
                    className="absolute inset-0 origin-left bg-paper transition-transform duration-700 ease-out-expo"
                    style={{ transform: `scaleX(${(stage + 1) / 5})` }}
                  />
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Format universe */}
      <section ref={formats} aria-labelledby="suite-formats-title" className="relative h-[230svh]">
        <div className="sticky top-0 flex h-svh flex-col justify-between pb-8 pt-[calc(var(--spacing-header)+1rem)] md:pb-12">
          <div className="container-site text-center">
            <Label index="03" className="justify-center">
              {suiteFormats.label}
            </Label>
            <h2
              id="suite-formats-title"
              className="mt-3 font-serif text-[clamp(1.9rem,3.6vw,3.6rem)] leading-none tracking-[-0.03em]"
            >
              {suiteFormats.heading[0]} <em>{suiteFormats.heading[1]}</em>
            </h2>
          </div>

          <div className="container-site grid grid-cols-3 gap-3 md:gap-8">
            {suiteFormats.formats.map((f, i) => (
              <div
                key={f.word}
                className={cn(
                  "flex flex-col",
                  i === 0 && "items-start text-left",
                  i === 1 && "items-center text-center",
                  i === 2 && "items-end text-right",
                )}
              >
                <span className="block overflow-hidden">
                  <span
                    data-format-word
                    className={cn(
                      "display-caps text-texture block text-[clamp(2.3rem,8.4vw,8.6rem)] transition-transform duration-[1200ms] ease-out-expo",
                      formatsOn ? "translate-y-0" : "translate-y-full",
                    )}
                    style={
                      {
                        "--tex": `url(${suiteTextures.light})`,
                        transitionDelay: `${i * 90}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {f.word}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-3 block h-px w-full origin-left bg-paper/40 transition-transform duration-[1200ms] ease-out-expo",
                    formatsOn ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ transitionDelay: `${200 + i * 90}ms` }}
                />
                <p
                  className={cn(
                    "mt-3 hidden max-w-[19rem] text-sm leading-relaxed text-paper/85 transition-all duration-1000 ease-out-expo sm:block",
                    formatsOn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  )}
                  style={{ transitionDelay: `${300 + i * 90}ms` }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Label({ index, children, className }: { index: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80", className)}>
      <span className="tabular-nums text-paper">({index})</span>
      <span aria-hidden className="h-px w-8 bg-paper/50" />
      <span>{children}</span>
    </p>
  );
}
