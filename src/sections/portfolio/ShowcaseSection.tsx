"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  collectionCopy,
  collectionK,
  collectionRecede,
  copySide,
  portfolioState,
} from "@/3d/portfolio/portfolioState";
import { bookBySlug, collectionBooks, portfolioCopy } from "@/data/portfolio";
import { cn } from "@/lib/cn";

const ShowcaseScene = dynamic(() => import("@/3d/portfolio/ShowcaseScene"), { ssr: false, loading: () => null });

const pad = (n: number) => String(n).padStart(2, "0");
const N = collectionBooks.length;

/**
 * 05 — All Books. One pinned WebGL stage on pure black. It opens on the
 * full collection; scroll then brings one book at a time to the camera with
 * its title and description beside it — copy right, then left, then right —
 * before the book returns to the collection and the next one comes forward.
 */
export function ShowcaseSection() {
  const root = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const copies = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(-1);
  const [active, setActive] = useState(false);
  const c = portfolioCopy.showcase;

  useGSAP(
    () => {
      const apply = (q: number) => {
        portfolioState.showcase = q;
        const k = collectionK(q, N);
        const recede = collectionRecede(q, N);
        if (head.current) {
          head.current.style.opacity = (1 - recede).toFixed(3);
          head.current.style.visibility = recede > 0.999 ? "hidden" : "visible";
        }
        copies.current.forEach((el, i) => {
          if (!el) return;
          const o = collectionCopy(k, i);
          el.style.opacity = o.toFixed(3);
          el.style.visibility = o > 0.001 ? "visible" : "hidden";
          // Slides in from the book's side and settles.
          el.style.transform = `translate3d(${((1 - o) * -copySide(i) * 32).toFixed(1)}px, 0, 0)`;
        });
        if (rail.current) rail.current.style.transform = `scaleX(${Math.min(1, Math.max(0, k / N)).toFixed(4)})`;
        const idx = k < 0 || k >= N ? -1 : Math.floor(k);
        setCurrent((p) => (p === idx ? p : idx));
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

  return (
    <section ref={root} aria-labelledby="showcase-title" className="relative h-[1700svh] bg-ink text-paper">
      <div className="sticky top-0 h-svh overflow-hidden bg-ink">
        <div aria-hidden className="absolute inset-0">
          <ShowcaseScene active={active} />
        </div>

        {/* ── Top band: label + counter, then the collection heading ── */}
        <div className="container-site pointer-events-none absolute inset-x-0 top-[calc(var(--spacing-header)+0.75rem)]">
          <div className="flex items-center justify-between gap-6">
            <p className="eyebrow flex items-center gap-3 whitespace-nowrap text-[0.68rem] text-paper/80">
              <span className="tabular-nums text-blue">(05)</span>
              <span aria-hidden className="h-px w-8 bg-blue/70" />
              {c.label}
            </p>
            <p className="text-[0.68rem] tabular-nums tracking-[0.14em] text-paper/60" aria-live="polite">
              <span className="text-paper">{current < 0 ? pad(N) : pad(current + 1)}</span>
              {current < 0 ? " titles" : ` / ${pad(N)}`}
            </p>
          </div>
          <div ref={head} className="mt-3 md:mt-4">
            <h2 id="showcase-title" className="font-serif text-[clamp(1.6rem,2.8vw,2.6rem)] leading-none tracking-[-0.03em]">
              {c.heading}
            </h2>
            <p className="mt-2 text-sm text-paper/65">{c.intro}</p>
          </div>
        </div>

        {/* ── Focused book copy: alternates right / left (stacked under the book in portrait) ── */}
        <div className="pointer-events-none absolute inset-0">
          {collectionBooks.map((entry, i) => {
            const book = bookBySlug(entry.slug);
            const right = copySide(i) === 1;
            return (
              <div
                key={entry.slug}
                className={cn(
                  "container-site absolute inset-0 flex",
                  "landscape:items-center portrait:items-end portrait:pb-14",
                  right ? "justify-end" : "justify-start",
                )}
              >
                <div
                  ref={(el) => {
                    copies.current[i] = el;
                  }}
                  className={cn(
                    "w-full landscape:w-[min(40%,30rem)] landscape:pt-16",
                    right ? "portrait:text-right" : "portrait:text-left",
                  )}
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <p
                    className={cn(
                      "flex items-center gap-3",
                      right ? "portrait:justify-end" : "portrait:justify-start",
                    )}
                  >
                    <span className="font-serif text-[clamp(1.4rem,2.2vw,2rem)] leading-none tabular-nums text-blue">
                      {pad(i + 1)}
                    </span>
                    <span className="rounded-full bg-blue px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-paper">
                      {entry.label}
                    </span>
                  </p>
                  <h3 className="mt-3 font-serif text-[clamp(1.9rem,min(4vw,7vh),4rem)] leading-[0.98] tracking-[-0.03em] md:mt-5">
                    {book.title}
                  </h3>
                  <p className="mt-2 font-serif text-[clamp(1rem,1.4vw,1.25rem)] italic text-paper/70">{book.author}</p>
                  <span
                    aria-hidden
                    className={cn("mt-4 block h-px w-12 bg-blue md:mt-6", right ? "portrait:ml-auto" : "")}
                  />
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-blue md:mt-5">{book.line}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper/80 sm:line-clamp-3 md:line-clamp-none md:text-[0.98rem]">
                    {book.description}
                  </p>
                  <a
                    href={book.amazonUrl ?? "#"}
                    target={book.amazonUrl ? "_blank" : undefined}
                    rel={book.amazonUrl ? "noopener noreferrer" : undefined}
                    tabIndex={current === i ? 0 : -1}
                    className="group pointer-events-auto mt-4 inline-flex items-center gap-3 rounded-full bg-blue py-2.5 pl-5 pr-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-paper shadow-[0_18px_40px_-18px_rgba(31,79,224,0.9)] ring-1 ring-paper/15 transition-[background-color,box-shadow] duration-500 hover:bg-paper hover:text-ink md:mt-6"
                  >
                    View on Amazon
                    <span
                      aria-hidden
                      className="grid size-7 place-items-center rounded-full bg-paper/15 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:bg-blue group-hover:text-paper"
                    >
                      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M5 11 11 5M6 5h5v5" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom band: progress ── */}
        <div className="container-site pointer-events-none absolute inset-x-0 bottom-0 pb-5 md:pb-6">
          <div className="flex items-center gap-4">
            <span className="relative block h-px flex-1 bg-paper/15">
              <span
                ref={rail}
                className="absolute inset-0 origin-left bg-blue"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span className="eyebrow text-[0.58rem] text-paper/55">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}
