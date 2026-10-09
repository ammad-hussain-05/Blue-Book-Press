"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Dark-theme marquee. `parallel`: two shallow-angled bands (solid blue /
 * hollow white) drifting in opposite directions. `cross`: the closing X —
 * a white band and a blue band crossing steeply. Scroll pushes both on top
 * of their constant drift.
 */
export function PortfolioMarquee({
  words,
  variant,
  label,
}: {
  words: string[];
  variant: "parallel" | "cross";
  label: string;
}) {
  const root = useRef<HTMLElement>(null);
  const cross = variant === "cross";

  useGSAP(
    () => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
      if (cross) {
        gsap.fromTo(
          "[data-band='a']",
          { xPercent: 8, rotate: -6 },
          { xPercent: -10, rotate: -11, ease: "none", scrollTrigger: st },
        );
        gsap.fromTo(
          "[data-band='b']",
          { xPercent: -10, rotate: 6 },
          { xPercent: 8, rotate: 10, ease: "none", scrollTrigger: st },
        );
      } else {
        gsap.fromTo("[data-band='a']", { xPercent: 6 }, { xPercent: -8, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-band='b']", { xPercent: -8 }, { xPercent: 6, ease: "none", scrollTrigger: st });
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={label}
      className={cn(
        "relative overflow-hidden bg-ink",
        cross ? "flex h-[82svh] min-h-[480px] items-center md:h-[96svh]" : "py-[clamp(4rem,9vw,8rem)]",
      )}
    >
      {cross ? (
        <>
          <Band id="b" words={words} tone="blue" reverse className="absolute inset-0" />
          <Band id="a" words={words} tone="white" className="absolute inset-0 z-10" />
        </>
      ) : (
        <div className="relative flex -rotate-3 flex-col gap-[clamp(0.6rem,1.6vw,1.4rem)]">
          <Band id="a" words={words} tone="blue" />
          <Band id="b" words={[...words].reverse()} tone="hollow" reverse />
        </div>
      )}
    </section>
  );
}

function Band({
  id,
  words,
  tone,
  reverse,
  className,
}: {
  id: "a" | "b";
  words: string[];
  tone: "blue" | "white" | "hollow";
  reverse?: boolean;
  className?: string;
}) {
  const items = [...words, ...words];
  return (
    // Flex-centred: GSAP owns the band's transform.
    <div aria-hidden className={cn("flex items-center justify-center", className)}>
      <div
        data-band={id}
        className={cn(
          "w-[180vw] shrink-0 overflow-hidden py-[clamp(0.5rem,1.2vw,1.2rem)]",
          tone === "blue" && "bg-blue text-paper shadow-[0_30px_90px_-30px_rgba(31,79,224,0.8)]",
          tone === "white" && "bg-paper text-ink shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]",
          tone === "hollow" && "border-y border-paper/25 text-paper",
        )}
      >
        <div className={cn("flex w-max animate-marquee", reverse && "[animation-direction:reverse]")}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {items.map((word, i) => (
                <span key={`${copy}-${i}`} className="flex items-center">
                  <span
                    className={cn(
                      "display-caps whitespace-nowrap px-[0.28em] text-[clamp(3.2rem,10.5vw,11rem)] leading-[0.95]",
                      tone === "hollow" && i % 2 === 0 && "text-outline",
                      tone === "white" && i % 2 === 1 && "text-blue",
                    )}
                  >
                    {word}
                  </span>
                  <span
                    className={cn(
                      "block size-[clamp(0.6rem,1.1vw,1.1rem)] rotate-45",
                      tone === "blue" && "border border-paper",
                      tone === "white" && "bg-blue",
                      tone === "hollow" && "bg-blue",
                    )}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
