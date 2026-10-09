"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";

type Tone = "light" | "dark" | "blue";

/** Show the control once the page has moved this far (px). */
const SHOW_AFTER = 480;

/**
 * Back to top: a slim vertical control fixed in the right-hand gutter — an
 * arrow between two hairlines. The lower hairline fills with scroll
 * progress. It reads the surface behind it (white / black / brand blue) and
 * switches ink so it stays clear on every section, and glides home with the
 * site's Lenis easing.
 */
export function BackToTop() {
  const lenis = useLenis();
  const pathname = usePathname();
  const menuOpen = useUI((s) => s.menuOpen);
  const btn = useRef<HTMLButtonElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<Tone>("light");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > SHOW_AFTER);
      if (fill.current) fill.current.style.transform = `scaleY(${max > 0 ? Math.min(1, y / max).toFixed(4) : 0})`;
      const el = btn.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const next = toneBehind(r.left + r.width / 2, r.top + r.height / 2, el);
        setTone((t) => (t === next ? t : next));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Page themes change as sections pin / swap (e.g. the Portfolio intro).
    const timer = window.setInterval(schedule, 700);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const toTop = () => {
    const y = window.scrollY;
    if (lenis) {
      // Longer pages glide a little longer, within a calm range.
      const duration = Math.min(2.8, 1.3 + (y / window.innerHeight) * 0.06);
      lenis.scrollTo(0, { duration, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const shown = visible && !menuOpen;
  const onDark = tone !== "light";

  return (
    <button
      ref={btn}
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={cn(
        // Sits in the right gutter, vertically centred; a wide transparent
        // hit area, a 13px visual.
        "group fixed right-0 top-1/2 z-50 flex w-5 -translate-y-1/2 cursor-pointer flex-col items-center gap-2.5 py-3 outline-offset-2 transition-[opacity,transform] duration-700 ease-out-expo sm:right-[calc(var(--spacing-gutter)/2-0.875rem)] sm:w-7",
        shown ? "opacity-100" : "pointer-events-none translate-x-3 opacity-0",
      )}
    >
      {/* upper hairline: extends upward on hover */}
      <span
        aria-hidden
        className={cn(
          "block h-8 w-px origin-bottom transition-[transform,background-color,box-shadow] duration-500 ease-out-expo group-hover:scale-y-[1.35] md:h-11",
          onDark
            ? "bg-paper/35 group-hover:bg-paper group-hover:shadow-[0_0_10px_rgba(255,255,255,0.65)]"
            : "bg-ink/20 group-hover:bg-blue group-hover:shadow-[0_0_10px_rgba(31,79,224,0.6)]",
        )}
      />
      <svg
        viewBox="0 0 14 14"
        aria-hidden
        className={cn(
          "size-3 transition-[transform,color] duration-500 ease-out-expo group-hover:-translate-y-1 md:size-3.5",
          tone === "light" ? "text-ink group-hover:text-blue" : "text-paper",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 12.5V1.8M2.5 6.2 7 1.6l4.5 4.6" />
      </svg>
      {/* lower hairline: track + scroll-progress fill */}
      <span
        aria-hidden
        className={cn(
          "relative block h-8 w-px origin-top overflow-hidden transition-[transform,box-shadow] duration-500 ease-out-expo group-hover:scale-y-[1.35] md:h-11",
          onDark ? "bg-paper/20" : "bg-ink/12",
          onDark ? "group-hover:shadow-[0_0_10px_rgba(255,255,255,0.45)]" : "group-hover:shadow-[0_0_10px_rgba(31,79,224,0.45)]",
        )}
      >
        <span
          ref={fill}
          className={cn("absolute inset-0 origin-top", tone === "blue" ? "bg-paper" : "bg-blue")}
          style={{ transform: "scaleY(0)" }}
        />
      </span>
    </button>
  );
}

/**
 * Surface tone at a screen point: the topmost visible, opaque background in
 * the hit-test stack (which skips the control itself and pointer-events:none
 * overlays such as the fixed 3D stage, and includes every ancestor down to
 * <html>). Faded layers (opacity < 0.5) are looked through.
 */
function toneBehind(x: number, y: number, self: HTMLElement): Tone {
  for (const el of document.elementsFromPoint(x, y)) {
    if (self.contains(el)) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) < 0.5) continue;
    const tone = classify(cs.backgroundColor);
    if (tone) return tone;
  }
  return "light";
}

function classify(color: string): Tone | null {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  if (a < 0.5) return null;
  if (b > 150 && b - r > 90 && b - g > 50) return "blue";
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.4 ? "dark" : "light";
}
