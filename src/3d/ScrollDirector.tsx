"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ui } from "@/lib/uiStore";
import { stage } from "./stage";

/**
 * Bridges the DOM and the 3D stage:
 *  - one ScrollTrigger per `[data-stage]` section → `stage.progress[i]`
 *  - pointer position → `stage.pointer`
 *  - intro fly-in once the preloader finishes → `stage.intro`
 * Render once, after the sections, on any page that uses the stage.
 */
export function ScrollDirector() {
  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>("[data-stage]");
    stage.sections = sections.map((el) => el.dataset.stage ?? "");
    stage.progress = sections.map((_, i) => (i === 0 ? 1 : 0));

    sections.forEach((el, i) => {
      if (i === 0) return;
      ScrollTrigger.create({
        trigger: el,
        // The book travels while the section rises from the bottom of the
        // viewport to ~25% from the top, then holds until the next one.
        start: "top 92%",
        end: "top 22%",
        onUpdate: (self) => {
          stage.progress[i] = self.progress;
        },
        onRefresh: (self) => {
          stage.progress[i] = self.progress;
        },
      });
    });

    // Layout can shift once fonts land — re-measure.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  // Pointer parallax.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Intro fly-in after the preloader.
  useEffect(() => {
    const start = () => {
      gsap.to(stage, { intro: 1, duration: 2.4, ease: "power3.out", delay: 0.15 });
    };
    if (ui.get().loaded) {
      start();
      return;
    }
    const unsubscribe = ui.subscribe(() => {
      if (ui.get().loaded) {
        unsubscribe();
        start();
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
