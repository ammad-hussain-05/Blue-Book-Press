"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { suiteMarquee } from "@/data/publishingSuite";
import { cn } from "@/lib/cn";

/**
 * Two oversized marquee bands crossing on the diagonal — one white, one
 * black — drifting in opposite directions. Scroll adds a push on top of
 * the constant drift, and the crossing angle opens up as it passes.
 */
export function SuiteMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(
        "[data-band='a']",
        { xPercent: 6, rotate: -4 },
        { xPercent: -10, rotate: -8, ease: "none", scrollTrigger: st },
      );
      gsap.fromTo(
        "[data-band='b']",
        { xPercent: -10, rotate: 4 },
        { xPercent: 6, rotate: 7, ease: "none", scrollTrigger: st },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Publishing, editing, audiobooks, cover design, formatting, marketing, distribution and author support"
      className="relative flex h-[78svh] min-h-[460px] items-center justify-center overflow-hidden md:h-[92svh]"
    >
      <Band id="b" tone="ink" reverse />
      <Band id="a" tone="paper" />
    </section>
  );
}

function Band({ id, tone, reverse }: { id: "a" | "b"; tone: "paper" | "ink"; reverse?: boolean }) {
  const items = [...suiteMarquee, ...suiteMarquee];
  return (
    // Flex-centred (not translate-centred): GSAP owns this band's transform.
    <div aria-hidden className={cn("absolute inset-0 flex items-center justify-center", tone === "paper" && "z-10")}>
      <div
        data-band={id}
        className={cn(
          "w-[180vw] shrink-0 overflow-hidden py-[clamp(0.6rem,1.4vw,1.4rem)] shadow-[0_30px_80px_-30px_rgba(5,15,60,0.55)]",
          tone === "paper" ? "bg-paper text-blue-deep" : "bg-ink text-paper",
        )}
      >
        <div className={cn("flex w-max animate-marquee", reverse && "[animation-direction:reverse]")}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {items.map((word, i) => (
                <span key={`${copy}-${i}`} className="flex items-center">
                  <span
                    className={cn(
                      "display-caps whitespace-nowrap px-[0.28em] text-[clamp(3.4rem,11vw,11.5rem)] leading-[0.95]",
                      tone === "ink" && i % 2 === 1 && "text-outline",
                    )}
                  >
                    {word}
                  </span>
                  <span
                    className={cn(
                      "block size-[clamp(0.7rem,1.3vw,1.3rem)] rotate-45",
                      tone === "paper" ? "bg-blue" : "border border-paper",
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
