"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { stage } from "@/3d/stage";

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance (e.g. to lock scroll while the menu is open). */
export const useLenis = () => useContext(LenisContext);

/** Smooth-scroll to a selector / element / y offset, with a native fallback. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | number | HTMLElement) => {
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
      else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis],
  );
}

/**
 * Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and
 * Lenis stay frame-synced. Disabled when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis({ duration: 1.25, smoothWheel: true, anchors: true });
    instance.on("scroll", (e: Lenis) => {
      stage.velocity = e.velocity;
      ScrollTrigger.update();
    });

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      stage.velocity = 0;
      setLenis(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
