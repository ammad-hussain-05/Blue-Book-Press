"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { ui } from "@/lib/uiStore";

const MIN_MS = 1100;
const MAX_MS = 7000;
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Cinematic preloader. Tracks GLB loading via the three.js loading manager,
 * never blocks longer than MAX_MS, then lifts away and signals `loaded`.
 */
export function Preloader() {
  const { progress, total, loaded: count, active } = useProgress();
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const min = window.setTimeout(() => setMinElapsed(true), MIN_MS);
    const max = window.setTimeout(() => setDone(true), MAX_MS);
    return () => {
      window.clearTimeout(min);
      window.clearTimeout(max);
    };
  }, []);

  // Ease the visible counter toward the real progress.
  useEffect(() => {
    const target = total > 0 ? progress : Math.min(shown + 8, 60);
    const id = window.setTimeout(() => setShown((s) => (s < target ? Math.min(target, s + Math.max(1, (target - s) * 0.25)) : s)), 40);
    return () => window.clearTimeout(id);
  }, [progress, total, shown]);

  const modelsReady = total > 0 && count >= total && !active;
  useEffect(() => {
    if (minElapsed && modelsReady && shown >= 99) setDone(true);
  }, [minElapsed, modelsReady, shown]);

  useEffect(() => {
    if (done) {
      setShown(100);
      ui.set({ loaded: true });
    }
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[80] flex flex-col justify-between bg-paper p-[var(--spacing-gutter)]"
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 1.1, ease: EASE, delay: 0.1 } }}
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <p className="eyebrow text-ink-muted">Print · Digital · Audio</p>
          <div className="text-center">
            <p className="font-serif text-[clamp(2.5rem,7vw,6rem)] leading-none tracking-[-0.04em]">
              Blue Book <em className="text-gradient-brand">Press</em>
            </p>
            <p className="eyebrow mt-6 text-ink-muted">Stories beyond the page</p>
          </div>
          <div>
            <div className="flex items-end justify-between">
              <span className="eyebrow text-ink-muted">Preparing the collection</span>
              <span className="font-serif text-5xl tabular-nums">{Math.round(shown)}</span>
            </div>
            <div className="mt-4 h-px w-full bg-line">
              <div
                className="h-px origin-left bg-gradient-to-r from-blue-deep to-blue transition-transform duration-300"
                style={{ transform: `scaleX(${shown / 100})` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
