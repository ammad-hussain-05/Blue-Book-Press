"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { portfolioAssets, portfolioCopy } from "@/data/portfolio";
import { useDuckWhileAudible } from "@/lib/ambient";
import { cn } from "@/lib/cn";

const SHUTTERS = 4;

/**
 * 03 — The film. Desktop: pinned; the film and the second key image arrive
 * from opposing camera angles while shutters slide off the film, hold with a
 * slow perspective drift, then swing away. Mobile: a simple stacked reveal.
 */
export function CinemaSection() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  useDuckWhileAudible(video, "portfolio-film");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
          defaults: { ease: "none" },
        });
        tl.fromTo("[data-cine-stage]", { "--po": "20%" }, { "--po": "80%", duration: 1 }, 0)
          // in
          .fromTo(
            "[data-cine-film]",
            { rotateY: -38, rotateX: 10, z: -520, xPercent: -30, opacity: 0 },
            { rotateY: 0, rotateX: 0, z: 0, xPercent: 0, opacity: 1, duration: 0.28 },
            0,
          )
          .fromTo(
            "[data-shutter]",
            { yPercent: 0 },
            { yPercent: (i: number) => (i % 2 ? 101 : -101), stagger: 0.03, duration: 0.16 },
            0.12,
          )
          .fromTo(
            "[data-cine-image]",
            { rotateY: 32, rotateX: -6, z: -420, xPercent: 40, opacity: 0 },
            { rotateY: 0, rotateX: 0, z: 0, xPercent: 0, opacity: 1, duration: 0.3 },
            0.06,
          )
          .fromTo("[data-cine-copy]", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.14)
          // hold — slow drift
          .to("[data-cine-film]", { scale: 1.04, duration: 0.4 }, 0.3)
          .to("[data-cine-image]", { yPercent: -6, duration: 0.4 }, 0.3)
          // out
          .to("[data-cine-film]", { rotateY: 28, z: -380, xPercent: -18, opacity: 0, duration: 0.2 }, 0.8)
          .to("[data-cine-image]", { rotateY: -30, z: -380, xPercent: 26, opacity: 0, duration: 0.2 }, 0.78)
          .to("[data-cine-copy]", { opacity: 0, y: -30, duration: 0.14 }, 0.84);
      });
      // Mobile: no pin — each panel simply rises in once.
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-cine-film], [data-cine-image]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Decode only while on screen; start buffering a little before.
  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && (v.preload = "auto"), {
      rootMargin: "100% 0px",
    });
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 },
    );
    near.observe(el);
    io.observe(el);
    return () => {
      near.disconnect();
      io.disconnect();
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  const copy = portfolioCopy.film;

  return (
    <section ref={root} aria-labelledby="cine-title" className="relative bg-ink text-paper lg:h-[320svh]">
      <div
        data-cine-stage
        className="relative py-[clamp(4rem,10vw,7rem)] [perspective:1600px] [perspective-origin:var(--po,50%)_50%] lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:overflow-hidden lg:py-0 lg:pt-header"
      >
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_auto_auto] lg:items-center lg:gap-[clamp(1.5rem,3vw,3.5rem)]">
          {/* Copy */}
          <div data-cine-copy className="order-1">
            <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
              <span className="tabular-nums text-blue">(03)</span>
              <span aria-hidden className="h-px w-8 bg-blue/70" />
              {copy.label}
            </p>
            <SplitHeading
              lines={copy.heading}
              className="mt-5 font-serif text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[0.98] tracking-[-0.035em]"
              lineClassName="[&:nth-child(2)]:italic"
            />
            <span id="cine-title" className="sr-only">
              {copy.heading.join(" ")}
            </span>
            <p className="mt-5 max-w-sm text-[1.02rem] leading-relaxed text-paper/80">{copy.body}</p>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={!muted}
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-paper/30 px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] transition-colors duration-500 hover:border-blue hover:text-blue"
            >
              <span aria-hidden className={cn("size-2 rounded-full", muted ? "bg-paper/40" : "bg-blue")} />
              {muted ? "Play with sound" : "Mute film"}
            </button>
          </div>

          {/* Film */}
          <div
            data-cine-film
            className="relative order-2 mx-auto aspect-[9/16] w-full max-w-[22rem] overflow-hidden rounded-[1.2rem] bg-ink shadow-[0_50px_120px_-40px_rgba(31,79,224,0.55)] ring-1 ring-paper/10 will-change-transform lg:h-[min(80svh,46rem)] lg:w-auto lg:max-w-none"
          >
            <video
              ref={video}
              src={portfolioAssets.filmVideo}
              muted
              loop
              playsInline
              preload="metadata"
              className="size-full object-cover"
              aria-label="Editorial layout reel"
            />
            {/* shutters */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:flex">
              {Array.from({ length: SHUTTERS }, (_, i) => (
                <span key={i} data-shutter className="h-full flex-1 bg-ink" />
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/80 to-transparent p-4 text-[0.6rem] uppercase tracking-[0.2em] text-paper/80"
            >
              <span>Reel · 2026</span>
              <span>Loop</span>
            </div>
          </div>

          {/* Second key image */}
          <figure
            data-cine-image
            className="relative order-3 mx-auto aspect-[2/3] w-full max-w-[20rem] overflow-hidden rounded-[1.2rem] ring-1 ring-paper/10 will-change-transform lg:mt-[18svh] lg:h-[min(62svh,36rem)] lg:w-auto lg:max-w-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portfolioAssets.secondImage}
              alt="Typographic poster: “Proven wrong time and time again” set in distorted white type"
              className="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 text-[0.6rem] uppercase tracking-[0.2em] text-paper/80">
              Type study · Launch visual
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
