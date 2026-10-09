"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { activeWave, portfolioState, smooth, WAVE, waveFocus, waveLocal } from "@/3d/portfolio/portfolioState";
import { bookBySlug, portfolioCopy, showcaseWaves } from "@/data/portfolio";
import { cn } from "@/lib/cn";

const SliderScene = dynamic(() => import("@/3d/portfolio/SliderScene"), { ssr: false, loading: () => null });

const pad = (n: number) => String(n).padStart(2, "0");
const WAVES = showcaseWaves.length;

/**
 * 06 — The Collection. One pinned WebGL stage running four wave sliders:
 * Best Sellers → Upcoming → Featured → Complete Shelf. Each wave rises in,
 * slides its five books past the focus, then flows up as the next wave
 * rolls in. Layout bands never overlap: copy on top, books in the middle,
 * the focused book's caption at the bottom.
 */
export function SlidersSection() {
  const root = useRef<HTMLElement>(null);
  const heads = useRef<(HTMLDivElement | null)[]>([]);
  const caption = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState({ wave: 0, focus: 0 });
  const [active, setActive] = useState(false);

  useGSAP(
    () => {
      const apply = (q: number) => {
        portfolioState.sliders = q;
        showcaseWaves.forEach((_, k) => {
          const el = heads.current[k];
          if (!el) return;
          const u = waveLocal(q, k, WAVES);
          // First wave is already in place; the last one stays to the end.
          // Sequential, never overlapping: out by u 0.96, the next in from u 0.
          const inT = k === 0 ? 1 : smooth(0, 0.1, u);
          const outT = k === WAVES - 1 ? 0 : smooth(0.86, 0.96, u);
          const o = inT * (1 - outT);
          el.style.opacity = o.toFixed(3);
          el.style.visibility = o > 0.001 ? "visible" : "hidden";
          el.style.transform = `translate3d(0, ${((1 - inT) * 48 - outT * 48).toFixed(1)}px, 0)`;
        });
        const k = activeWave(q, WAVES);
        const u = waveLocal(q, k, WAVES);
        const n = showcaseWaves[k].books.length;
        const f = waveFocus(u, n);
        // Caption shows while a wave is sliding; it dips during hand-offs.
        const capIn = k === 0 ? 1 : smooth(WAVE.enter * 0.4, WAVE.enter, u);
        const capOut = k === WAVES - 1 ? 0 : smooth(WAVE.exit, WAVE.exit + 0.06, u);
        if (caption.current) caption.current.style.opacity = (capIn * (1 - capOut)).toFixed(3);
        if (rail.current) rail.current.style.transform = `scaleX(${(f / (n - 1)).toFixed(4)})`;
        setState((s) => {
          const next = { wave: k, focus: Math.round(f) };
          return s.wave === next.wave && s.focus === next.focus ? s : next;
        });
      };
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => apply(s.progress),
        onRefresh: (s) => apply(s.progress),
      });
      apply(0);
    },
    { scope: root },
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "50% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const wave = showcaseWaves[state.wave];
  const entry = wave.books[state.focus] ?? wave.books[0];
  const book = bookBySlug(entry.slug);

  return (
    <section ref={root} aria-labelledby="sliders-title" className="relative h-[880svh] bg-ink text-paper">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <SliderScene active={active} />
        </div>

        {/* ── Top band: section label, wave index, wave copy ── */}
        <div className="container-site pointer-events-none absolute inset-x-0 top-[calc(var(--spacing-header)+0.75rem)]">
          <div className="flex items-center justify-between gap-6">
            <p id="sliders-title" className="eyebrow flex items-center gap-3 whitespace-nowrap text-[0.68rem] text-paper/80">
              <span className="tabular-nums text-blue">(06)</span>
              <span aria-hidden className="h-px w-8 bg-blue/70" />
              {portfolioCopy.sliders.label}
            </p>
            <ol className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Collection sections">
              {showcaseWaves.map((w, k) => (
                <li key={w.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "block h-px transition-all duration-700 ease-out-expo",
                      k === state.wave ? "w-6 bg-blue sm:w-10" : "w-3 bg-paper/25 sm:w-4",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[0.62rem] tabular-nums tracking-[0.14em] transition-colors duration-500",
                      k === state.wave ? "text-paper" : "text-paper/40 max-sm:hidden",
                    )}
                  >
                    {pad(k + 1)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mt-4 md:mt-6">
            {showcaseWaves.map((w, k) => (
              <div
                key={w.id}
                ref={(el) => {
                  heads.current[k] = el;
                }}
                className={cn(
                  "grid gap-3 md:gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-14",
                  k > 0 && "absolute inset-x-0 top-0",
                )}
                style={k > 0 ? { opacity: 0, visibility: "hidden" } : undefined}
              >
                <div>
                  <p className="eyebrow text-[0.62rem] text-blue">
                    {pad(k + 1)} · {w.label}
                  </p>
                  <h3 className="mt-2 font-serif text-[clamp(1.9rem,min(4.2vw,7vh),4.4rem)] leading-[0.98] tracking-[-0.035em]">
                    {w.heading}
                  </h3>
                </div>
                <div>
                  <p className="font-serif text-[clamp(1.05rem,1.4vw,1.3rem)] italic leading-snug text-paper/90">
                    {w.subtitle}
                  </p>
                  <p className="mt-2 hidden text-sm leading-relaxed text-paper/65 sm:block">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom band: focused book ── */}
        <div ref={caption} className="absolute inset-x-0 bottom-0 pb-6 md:pb-8">
          <div className="container-site">
            <div className="grid gap-3 border-t border-paper/15 pt-4 md:grid-cols-[auto_1fr] md:items-end md:gap-10 xl:grid-cols-[auto_1fr_auto]">
              <p className="font-serif text-[clamp(1.8rem,3vw,2.9rem)] leading-none tabular-nums text-blue">
                {pad(state.focus + 1)}
                <span className="text-base text-paper/50"> / {pad(wave.books.length)}</span>
              </p>
              <div key={`${wave.id}-${book.slug}`} className="animate-fade-up">
                <p className="flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-paper/60">
                  <span className="rounded-full border border-blue px-2.5 py-1 text-paper">{entry.label}</span>
                  {book.line}
                </p>
                <p className="mt-2 font-serif text-[clamp(1.35rem,2.2vw,2.1rem)] leading-tight">
                  {book.title} <span className="italic text-paper/60">— {book.author}</span>
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-paper/75 md:text-[0.95rem]">
                  {book.description}
                </p>
              </div>
              <div className="hidden xl:block">
                <ol className="space-y-1 text-right text-[0.72rem] tracking-[0.04em]">
                  {wave.books.map((b, j) => (
                    <li
                      key={b.slug}
                      className={cn(
                        "transition-colors duration-500",
                        j === state.focus ? "text-paper" : "text-paper/35",
                      )}
                    >
                      {bookBySlug(b.slug).title} <span className="tabular-nums text-paper/40">{pad(j + 1)}</span>
                    </li>
                  ))}
                </ol>
                <span className="relative mt-3 block h-px w-full bg-paper/20">
                  <span
                    ref={rail}
                    className="absolute inset-0 origin-left bg-blue"
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
