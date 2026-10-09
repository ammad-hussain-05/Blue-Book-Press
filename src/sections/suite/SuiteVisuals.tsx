"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { suiteTextures } from "@/data/publishingSuite";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { ImagePanel } from "./ServiceParts";

/** Deterministic pseudo-random (stable between server and client). */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ==================================================================
   04 · Audio — studio session panel with a scroll-driven waveform
   ================================================================== */
export function AudioVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const BARS = 56;

  useGSAP(
    () => {
      const st = { trigger: ref.current, start: "top 85%", end: "bottom 20%", scrub: 0.8 };
      gsap.fromTo(
        "[data-bar]",
        { scaleY: 0.06 },
        { scaleY: 1, ease: "none", stagger: { each: 0.02, from: "center" }, scrollTrigger: st },
      );
      gsap.fromTo("[data-dial]", { rotate: -40 }, { rotate: 200, ease: "none", scrollTrigger: st });
      gsap.to({}, {
        scrollTrigger: {
          ...st,
          onUpdate: (s) => {
            const secs = Math.round(s.progress * 2537);
            const mm = String(Math.floor(secs / 60)).padStart(2, "0");
            const ss = String(secs % 60).padStart(2, "0");
            if (time.current) time.current.textContent = `00:${mm}:${ss}`;
          },
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      <ImagePanel src={suiteTextures.grain} className="aspect-[4/5] w-full" position="30% 40%">
        <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8">
          <div className="flex items-start justify-between">
            <p className="eyebrow text-[0.62rem] text-paper/85">Studio session · Ch. 01</p>
            <p className="eyebrow flex items-center gap-2 text-[0.62rem]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-paper/70" />
                <span className="relative size-2 rounded-full bg-paper" />
              </span>
              Rec
            </p>
          </div>

          {/* Dial */}
          <div className="relative mx-auto aspect-square w-[62%]">
            <svg data-dial viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
              {Array.from({ length: 72 }, (_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1="4"
                  x2="100"
                  y2={i % 6 === 0 ? 16 : 10}
                  stroke="white"
                  strokeOpacity={i % 6 === 0 ? 0.9 : 0.45}
                  strokeWidth="0.8"
                  transform={`rotate(${i * 5} 100 100)`}
                />
              ))}
            </svg>
            <div className="absolute inset-[18%] grid place-items-center rounded-full border border-paper/40 text-center">
              <div>
                <span ref={time} className="block font-serif text-[clamp(1.4rem,2.6vw,2.4rem)] tabular-nums leading-none">
                  00:00:00
                </span>
                <span className="eyebrow mt-2 block text-[0.56rem] text-paper/75">Narration take 03</span>
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div>
            <div className="flex h-20 items-center gap-[3px] md:h-28" aria-hidden>
              {Array.from({ length: BARS }, (_, i) => {
                const env = Math.sin((i / (BARS - 1)) * Math.PI);
                const h = 0.12 + env * (0.35 + rand(i) * 0.6);
                return (
                  <span key={i} className="flex h-full flex-1 items-center">
                    <span data-bar className="block w-full rounded-full bg-paper" style={{ height: `${(h * 100).toFixed(2)}%` }} />
                  </span>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between border-t border-paper/30 pt-3 text-[0.68rem] tabular-nums tracking-[0.08em] text-paper/85">
              <span>RMS −20 dB</span>
              <span>Peak −3 dB</span>
              <span className="hidden sm:inline">44.1 kHz · 192 kbps</span>
            </div>
          </div>
        </div>
      </ImagePanel>
    </div>
  );
}

/* ==================================================================
   05 · E-Book — a reader device that types in and reflows on scroll
   ================================================================== */
const LINES_A = [92, 100, 96, 88, 100, 72, 0, 100, 94, 98, 86, 100, 64];
const LINES_B = [100, 84, 100, 92, 78, 100, 0, 96, 100, 70, 100, 90, 82];

export function EbookVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 25%", scrub: 0.8 },
      });
      tl.fromTo("[data-device]", { rotateY: -22, rotateX: 8, y: 60 }, { rotateY: 0, rotateX: 0, y: 0, ease: "none", duration: 1 }, 0)
        .fromTo("[data-line]", { scaleX: 0 }, { scaleX: 1, ease: "none", stagger: 0.05, duration: 0.4 }, 0.1)
        .to("[data-knob]", { left: "78%", ease: "none", duration: 0.6 }, 0.7)
        .to(
          "[data-line]",
          { width: (i: number) => `${LINES_B[i]}%`, height: 7, ease: "none", stagger: 0.02, duration: 0.5 },
          0.75,
        );
      gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 60 + i * 25 },
          { y: -60 - i * 25, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative [perspective:1400px]", className)}>
      <ImagePanel src={suiteTextures.light} className="ml-auto aspect-[5/4] w-[78%]" position="60% 50%" />

      <div
        data-device
        className="relative -mt-[58%] ml-[4%] w-[56%] rounded-[1.6rem] border border-paper/80 bg-blue-deep/75 p-[5%] shadow-[0_40px_80px_-30px_rgba(3,10,50,0.7)] backdrop-blur-md [transform-style:preserve-3d] sm:w-[50%]"
      >
        <div className="flex items-center justify-between text-[0.6rem] tracking-[0.14em] text-paper/70">
          <span>CHAPTER ONE</span>
          <span className="tabular-nums">4%</span>
        </div>
        <p className="mt-4 font-serif text-[clamp(1.1rem,1.8vw,1.6rem)] italic leading-tight">The Quiet Shore</p>
        <div className="mt-4 space-y-[9px]" aria-hidden>
          {LINES_A.map((w, i) => (
            <span
              key={i}
              data-line
              className={cn("block h-[5px] origin-left rounded-full", w === 0 ? "bg-transparent" : "bg-paper/75")}
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 text-paper/80" aria-hidden>
          <span className="text-[0.65rem]">A</span>
          <span className="relative h-px flex-1 bg-paper/40">
            <span data-knob className="absolute left-[30%] top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper" />
          </span>
          <span className="text-sm">A</span>
        </div>
      </div>

      {["EPUB 3", "Kindle KPF", "Metadata", "Accessible"].map((t, i) => (
        <span
          key={t}
          data-float
          aria-hidden
          className={cn(
            "absolute rounded-full border border-paper/70 bg-blue/80 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] backdrop-blur",
            ["right-[6%] top-[8%]", "right-[2%] top-[46%]", "left-[60%] bottom-[4%]", "left-0 top-[2%]"][i],
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ==================================================================
   06 · Publishing — staircase image reveal + distribution route
   ================================================================== */
export function StairImage({ className, slices = 6 }: { className?: string; slices?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-slice]",
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 95%", end: "top 25%", scrub: 0.7 },
        },
      );
      gsap.fromTo(
        "[data-slice-img]",
        { scale: 1.2 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative flex overflow-hidden", className)} aria-hidden>
      {Array.from({ length: slices }, (_, i) => (
        <div key={i} className="relative h-full flex-1 overflow-hidden">
          <div data-slice className="absolute inset-0 overflow-hidden">
            <div
              data-slice-img
              className="absolute inset-y-0 bg-cover bg-center"
              style={{
                width: `${slices * 100}%`,
                left: `-${i * 100}%`,
                backgroundImage: `url(${suiteTextures.grain})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const ROUTE = ["Manuscript", "ISBN & rights", "Files approved", "Retail accounts", "Live worldwide"];

export function RouteVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
      });
      tl.fromTo("[data-route-line]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
      ROUTE.forEach((_, i) => {
        tl.fromTo(
          `[data-node="${i}"]`,
          { scale: 0.4, backgroundColor: "rgba(255,255,255,0)" },
          { scale: 1, backgroundColor: "rgba(255,255,255,1)", ease: "none", duration: 0.12 },
          (i / (ROUTE.length - 1)) * 0.9,
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[0.6rem] h-px bg-paper/25" />
        <span
          data-route-line
          aria-hidden
          className="absolute left-[10%] right-[10%] top-[0.6rem] h-px origin-left bg-paper"
        />
        <ol className="relative grid grid-cols-5">
          {ROUTE.map((r, i) => (
            <li key={r} className="flex flex-col items-center text-center">
              <span data-node={i} className="block size-5 rounded-full border border-paper" />
              <span className="mt-3 text-[0.62rem] tabular-nums tracking-[0.14em] text-paper/70">0{i + 1}</span>
              <span className="mt-1 max-w-[7rem] text-[0.72rem] leading-tight sm:text-sm">{r}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-paper/20 pt-6 font-serif text-[clamp(1.1rem,2vw,1.6rem)] italic text-paper/90">
        {site.platforms.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
    </div>
  );
}

/* ==================================================================
   07 · Cover — a flat full wrap that folds into a book on scroll
   ================================================================== */
export function CoverVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  /** Spine width as a share of the front cover width. */
  const SPINE = 0.14;

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 30%", scrub: 0.8 },
      });
      tl.fromTo("[data-rig]", { xPercent: 50 + SPINE * 50, rotateY: 0 }, { xPercent: 0, rotateY: 30, ease: "none" }, 0)
        .fromTo("[data-spine]", { rotateY: 0 }, { rotateY: -90, ease: "none" }, 0)
        .fromTo("[data-back]", { rotateY: 0 }, { rotateY: -90, ease: "none" }, 0)
        .to("[data-wrap-label]", { opacity: 0, y: 10, ease: "none", duration: 0.4 }, 0);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative flex justify-center [perspective:1800px]", className)}>
      <div data-rig className="relative w-[38%] [transform-style:preserve-3d]">
        {/* Front */}
        <div className="relative aspect-[2/3] overflow-hidden bg-blue-deep shadow-[0_40px_70px_-30px_rgba(3,10,50,0.75)]">
          <div className="absolute inset-0 bg-cover bg-[30%_30%]" style={{ backgroundImage: `url(${suiteTextures.grain})` }} />
          <div className="absolute inset-0 flex flex-col justify-between p-[9%] text-paper">
            <p className="text-[clamp(0.45rem,0.8vw,0.68rem)] uppercase tracking-[0.3em] text-paper/85">A novel</p>
            <div>
              <p className="display-caps text-[clamp(1.6rem,4.4vw,4.4rem)]">The Tide</p>
              <p className="display-caps text-[clamp(1.6rem,4.4vw,4.4rem)] text-outline">Keeper</p>
              <p className="mt-3 font-serif text-[clamp(0.7rem,1.3vw,1.15rem)] italic">A. M. Rowan</p>
            </div>
          </div>
          <span className="absolute inset-y-0 left-0 w-[4%] bg-gradient-to-r from-ink/35 to-transparent" />
        </div>
        <p data-wrap-label className="eyebrow absolute -bottom-8 left-0 right-0 text-center text-[0.6rem] text-paper/80">
          Front
        </p>

        {/* Spine — hinged on the front's left edge */}
        <div
          data-spine
          className="absolute right-full top-0 h-full origin-right bg-ink [transform-style:preserve-3d]"
          style={{ width: `${SPINE * 100}%` }}
        >
          <div className="flex h-full flex-col items-center justify-between py-[40%] text-paper">
            <span className="font-serif text-[clamp(0.45rem,0.8vw,0.7rem)] italic">BBP</span>
            <span className="display-caps whitespace-nowrap text-[clamp(0.55rem,1.1vw,0.95rem)] [writing-mode:vertical-rl]">
              The Tide Keeper
            </span>
            <span className="text-[clamp(0.4rem,0.7vw,0.6rem)] [writing-mode:vertical-rl]">Rowan</span>
          </div>
          <p data-wrap-label className="eyebrow absolute -bottom-8 left-1/2 -translate-x-1/2 text-[0.6rem] text-paper/80">
            Spine
          </p>

          {/* Back — hinged on the spine's left edge */}
          <div
            data-back
            className="absolute right-full top-0 h-full origin-right bg-blue-deep"
            style={{ width: `${(1 / SPINE) * 100}%` }}
          >
            <div className="flex h-full flex-col justify-between p-[9%] text-paper">
              <div>
                <p className="font-serif text-[clamp(0.65rem,1.2vw,1.05rem)] italic leading-snug">
                  “A luminous, aching story of what the sea keeps — and what it gives back.”
                </p>
                <div className="mt-[8%] space-y-[6px]" aria-hidden>
                  {[100, 94, 98, 90, 100, 76].map((w, i) => (
                    <span key={i} className="block h-[3px] rounded-full bg-paper/60" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[clamp(0.4rem,0.7vw,0.6rem)] uppercase tracking-[0.2em] text-paper/80">Blue Book Press</span>
                <span className="flex h-[16%] min-h-6 w-[34%] items-end gap-px bg-paper p-[3%]" aria-hidden>
                  {Array.from({ length: 22 }, (_, i) => (
                    <span key={i} className="h-full bg-ink" style={{ width: rand(i + 9) > 0.5 ? 2 : 1 }} />
                  ))}
                </span>
              </div>
            </div>
            <p data-wrap-label className="eyebrow absolute -bottom-8 left-0 right-0 text-center text-[0.6rem] text-paper/80">
              Back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   08 · Editing — a manuscript page marked up as you scroll
   ================================================================== */
type Seg = string | { del: string } | { ins: string; note?: string };

const MANUSCRIPT: Seg[] = [
  "The rain had ",
  { del: "fell" },
  { ins: "fallen", note: "Tense" },
  " for three days. Mara had never trusted the river, and she watched it rise ",
  { del: "very slowly, very slowly" },
  { ins: "slowly — and then all at once", note: "Rhythm" },
  ". She ",
  { del: "new" },
  { ins: "knew", note: "Spelling" },
  " exactly what the water ",
  { del: "was wanting from her" },
  { ins: "wanted", note: "Concision" },
  ".",
];

export function ManuscriptVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 45%", scrub: 0.7 },
      });
      const dels = gsap.utils.toArray<HTMLElement>("[data-del]");
      const ins = gsap.utils.toArray<HTMLElement>("[data-ins]");
      const notes = gsap.utils.toArray<HTMLElement>("[data-note]");
      dels.forEach((d, i) => {
        tl.fromTo(d, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 0.5 }, i);
        // Insertions grow in from zero size so they never leave a gap in the line.
        if (ins[i]) tl.fromTo(ins[i], { fontSize: "0em", opacity: 0 }, { fontSize: "1em", opacity: 1, ease: "none", duration: 0.5 }, i + 0.35);
        if (notes[i]) tl.fromTo(notes[i], { opacity: 0, x: 12 }, { opacity: 1, x: 0, ease: "none", duration: 0.5 }, i + 0.35);
      });
      tl.fromTo("[data-approved]", { opacity: 0, scale: 1.4, rotate: -14 }, { opacity: 1, scale: 1, rotate: -8, duration: 0.6 }, dels.length + 0.2);
    },
    { scope: ref },
  );

  const notes = MANUSCRIPT.filter((s): s is { ins: string; note?: string } => typeof s !== "string" && "ins" in s);

  return (
    <div ref={ref} className={cn("relative grid gap-4 md:grid-cols-[1fr_11rem] md:gap-0", className)}>
      <div className="relative bg-paper px-6 py-8 text-ink shadow-[0_40px_80px_-30px_rgba(3,10,50,0.6)] md:px-12 md:py-14">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4 text-[0.65rem] uppercase tracking-[0.18em] text-ink-muted">
          <span>Manuscript · p. 1</span>
          <span>Track changes · on</span>
        </div>
        <p className="font-serif text-[clamp(1.25rem,2.1vw,1.9rem)] leading-[1.6] tracking-[-0.01em]">
          {MANUSCRIPT.map((s, i) => {
            if (typeof s === "string") return <span key={i}>{s}</span>;
            if ("del" in s)
              return (
                <span key={i} className="relative text-ink-muted">
                  {s.del}
                  <span data-del aria-hidden className="absolute inset-x-0 top-[55%] block h-[2px] origin-left bg-blue" />
                </span>
              );
            return (
              <span key={i} data-ins className="rounded-sm bg-blue-soft px-[0.2em] italic text-blue [box-decoration-break:clone]" style={{ fontSize: 0 }}>
                {s.ins}
              </span>
            );
          })}
        </p>
        <span
          data-approved
          aria-hidden
          className="absolute -bottom-5 right-6 border-2 border-blue px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-blue md:right-12"
        >
          Proofed · Final
        </span>
      </div>
      <ul className="flex flex-wrap gap-2 md:flex-col md:justify-center md:gap-5 md:pl-6">
        {notes.map((n, i) => (
          <li key={i} data-note className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-paper/90">
            <span aria-hidden className="hidden h-px w-6 bg-paper/60 md:block" />
            <span className="border border-paper/50 px-2.5 py-1 md:border-0 md:p-0">{n.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==================================================================
   09 · Interior + Paperback — a typeset spread with print guides
   ================================================================== */
const TRIMS = ["5 × 8 in", "5.5 × 8.5 in", "6 × 9 in"];

export function SpreadVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 30%", scrub: 0.7 },
      });
      tl.fromTo("[data-page]", { rotateY: (i: number) => (i ? -35 : 35), opacity: 0.4 }, { rotateY: 0, opacity: 1, ease: "none", duration: 0.5 }, 0)
        .fromTo("[data-guide]", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, ease: "none", duration: 0.3, stagger: 0.05 }, 0.3)
        .fromTo("[data-tline]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 0.5, stagger: 0.015 }, 0.4)
        .fromTo("[data-crop]", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.2, stagger: 0.04 }, 0.6);
      TRIMS.forEach((_, i) => {
        if (i === 0) return;
        tl.to(`[data-trim="${i - 1}"]`, { yPercent: -100, opacity: 0, duration: 0.1 }, 0.6 + i * 0.25).fromTo(
          `[data-trim="${i}"]`,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.1 },
          0.6 + i * 0.25,
        );
      });
    },
    { scope: ref },
  );

  const Page = ({ side }: { side: 0 | 1 }) => (
    <div
      data-page
      className={cn(
        "relative aspect-[2/3] flex-1 bg-paper text-ink",
        side === 0 ? "origin-right" : "origin-left",
      )}
    >
      {/* gutter shading */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 w-[12%] from-ink/15 to-transparent",
          side === 0 ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r",
        )}
      />
      {/* margin guide */}
      <span
        data-guide
        aria-hidden
        className={cn(
          "absolute bottom-[10%] top-[9%] border border-dashed border-blue/70",
          side === 0 ? "left-[11%] right-[14%]" : "left-[14%] right-[11%]",
        )}
      />
      <div
        className={cn(
          "absolute bottom-[10%] top-[9%] flex flex-col",
          side === 0 ? "left-[11%] right-[14%]" : "left-[14%] right-[11%]",
        )}
      >
        <p className="text-center text-[clamp(0.38rem,0.6vw,0.55rem)] uppercase tracking-[0.25em] text-ink-muted">
          {side === 0 ? "The Tide Keeper" : "Chapter One"}
        </p>
        {side === 1 && (
          <p className="mt-[14%] text-center font-serif text-[clamp(0.9rem,1.7vw,1.5rem)] italic leading-none">The Quiet Shore</p>
        )}
        <div className={cn("space-y-[5px]", side === 1 ? "mt-[12%]" : "mt-[8%]")} aria-hidden>
          {Array.from({ length: side === 1 ? 12 : 17 }, (_, i) => (
            <span
              key={i}
              data-tline
              className="block h-[2px] origin-left bg-ink/55"
              style={{ width: `${i % 7 === 6 ? 62 : (96 + rand(i + side * 20) * 4).toFixed(2)}%` }}
            />
          ))}
        </div>
        <p className="mt-auto text-center text-[clamp(0.38rem,0.6vw,0.55rem)] tabular-nums text-ink-muted">{side === 0 ? 2 : 3}</p>
      </div>
      {/* crop marks — 90° corners */}
      {(side === 0
        ? ["-left-3 -top-3 border-l border-t", "-left-3 -bottom-3 border-b border-l"]
        : ["-right-3 -top-3 border-r border-t", "-right-3 -bottom-3 border-b border-r"]
      ).map(
        (c) => (
          <span key={c} data-crop aria-hidden className={cn("absolute size-3 border-paper", c)} />
        ),
      )}
    </div>
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex items-end justify-between pb-4 text-[0.68rem] uppercase tracking-[0.16em] text-paper/85">
        <span>Trim size</span>
        <span className="relative block h-5 w-28 overflow-hidden text-right font-medium text-paper">
          {TRIMS.map((t, i) => (
            <span key={t} data-trim={i} className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
              {t}
            </span>
          ))}
        </span>
      </div>
      <div className="relative flex gap-0 p-3 [perspective:1600px] md:p-4">
        <span data-guide aria-hidden className="absolute inset-0 border border-dashed border-paper/50" />
        <Page side={0} />
        <Page side={1} />
      </div>
      <div className="mt-4 flex justify-between text-[0.62rem] uppercase tracking-[0.16em] text-paper/75">
        <span>— Bleed 0.125 in</span>
        <span>Gutter · margins · folio</span>
      </div>
    </div>
  );
}

/* ==================================================================
   10 · Marketing — reach rings expanding from the book outwards
   ================================================================== */
const CHANNELS = [
  { label: "Store page", a: -90, r: 1 },
  { label: "Pre-orders", a: -20, r: 2 },
  { label: "Reviews", a: 40, r: 1 },
  { label: "Newsletter", a: 110, r: 3 },
  { label: "Targeted ads", a: 170, r: 2 },
  { label: "Social", a: 230, r: 3 },
];

export function ReachVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const RADII = [70, 130, 190, 250];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 30%", scrub: 0.8 },
      });
      tl.fromTo("[data-ring]", { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, ease: "none", stagger: 0.12, duration: 0.5 }, 0)
        .fromTo("[data-ring-dash]", { rotate: 0, transformOrigin: "50% 50%" }, { rotate: (i: number) => (i % 2 ? -70 : 90), ease: "none", duration: 1 }, 0)
        .fromTo("[data-channel]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ease: "none", stagger: 0.08, duration: 0.3 }, 0.35);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative mx-auto aspect-square w-full max-w-[34rem]", className)}>
      <svg viewBox="0 0 600 600" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        {RADII.map((r, i) => (
          <g key={r} data-ring style={{ transformOrigin: "300px 300px" }}>
            <circle cx="300" cy="300" r={r} fill="none" stroke="white" strokeOpacity={0.5 - i * 0.08} strokeWidth="1" />
            <circle
              data-ring-dash
              cx="300"
              cy="300"
              r={r}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={`${18 + i * 6} ${r * 1.4}`}
              style={{ transformOrigin: "300px 300px" }}
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-[38%] grid place-items-center rounded-full bg-paper text-center text-blue-deep">
        <span className="display-caps text-[clamp(1rem,2.4vw,1.9rem)] leading-[0.9]">
          Your
          <br />
          Book
        </span>
      </div>

      {CHANNELS.map((c) => {
        const rad = (c.a * Math.PI) / 180;
        const r = RADII[c.r] / 600;
        return (
          <span
            key={c.label}
            data-channel
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-paper/70 bg-blue px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] sm:text-[0.68rem]"
            style={{ left: `${(50 + Math.cos(rad) * r * 100).toFixed(2)}%`, top: `${(50 + Math.sin(rad) * r * 100).toFixed(2)}%` }}
          >
            <span className="size-1.5 rounded-full bg-paper" />
            {c.label}
          </span>
        );
      })}
    </div>
  );
}
