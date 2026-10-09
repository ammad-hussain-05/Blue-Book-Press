"use client";

import { useEffect } from "react";
import { ambient, useAmbient } from "@/lib/ambient";
import { cn } from "@/lib/cn";

/**
 * Header control for the site-wide ambient sound. Starts the engine once,
 * then reflects its state: moving bars while audible, flat bars when off or
 * paused for page media, and an "Enable sound" prompt while the browser is
 * still waiting for a first interaction.
 */
export function SoundToggle({ inverse }: { inverse: boolean }) {
  const pref = useAmbient((s) => s.pref);
  const blocked = useAmbient((s) => s.blocked);
  const playing = useAmbient((s) => s.playing);
  const ducked = useAmbient((s) => s.ducked);

  useEffect(() => ambient.init(), []);

  const needsEnable = pref === "on" && blocked;
  const on = pref === "on" && !blocked;
  const label = needsEnable
    ? "Enable ambient sound"
    : on
      ? ducked
        ? "Ambient sound paused while the film plays — turn off"
        : "Turn ambient sound off"
      : "Turn ambient sound on";

  return (
    <button
      type="button"
      data-ambient-toggle
      onClick={() => ambient.toggle()}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "group flex h-10 items-center justify-center gap-2.5 rounded-full border backdrop-blur transition-colors duration-500 sm:h-11",
        needsEnable ? "px-3 sm:pl-4 sm:pr-3.5" : "w-10 sm:w-11",
        inverse
          ? "border-paper/30 bg-paper/10 text-paper hover:border-paper/70"
          : "border-ink/15 bg-paper/60 text-ink hover:border-ink/40",
      )}
    >
      {needsEnable && <span className="eyebrow hidden text-[0.6rem] sm:inline">Enable sound</span>}
      <Bars live={playing} on={on} inverse={inverse} />
    </button>
  );
}

/** Four equaliser bars: moving while audible, a flat dotted line when off. */
function Bars({ live, on, inverse }: { live: boolean; on: boolean; inverse: boolean }) {
  return (
    <span aria-hidden className="relative flex h-3.5 items-end gap-[2.5px]">
      {[0.55, 1, 0.7, 0.85].map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] origin-bottom rounded-full transition-[transform,background-color] duration-500",
            on ? (inverse ? "bg-paper" : "bg-blue") : "bg-current opacity-60",
            live && "animate-eq",
          )}
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 0.13}s`,
            animationDuration: `${1.1 + i * 0.15}s`,
            transform: live ? undefined : "scaleY(0.22)",
          }}
        />
      ))}
      {!on && (
        <span className="absolute -inset-x-0.5 top-1/2 h-px -translate-y-1/2 rotate-[-28deg] bg-current opacity-80" />
      )}
    </span>
  );
}
