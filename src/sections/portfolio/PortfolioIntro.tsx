"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { INTRO, portfolioState, resetPortfolioState, smooth } from "@/3d/portfolio/portfolioState";
import { portfolioAssets, portfolioBooks, portfolioCopy } from "@/data/portfolio";
import type { StageRect } from "@/3d/portfolio/IntroScene";
import { useDuckWhileAudible } from "@/lib/ambient";
import { ui, useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";

const IntroScene = dynamic(() => import("@/3d/portfolio/IntroScene"), { ssr: false, loading: () => null });

const EASE = [0.16, 1, 0.3, 1] as const;
type Sound = "pending" | "on" | "off" | "blocked";

/**
 * 00 → 01. One pinned stage:
 *  white page · The Press ring passing behind the centred intro film →
 *  scroll dollies the camera into the film → clouds → (under the fog) the
 *  page turns black → the Portfolio hero is revealed.
 */
export function PortfolioIntro() {
  const root = useRef<HTMLElement>(null);
  const white = useRef<HTMLDivElement>(null);
  const fog = useRef<HTMLDivElement>(null);
  const heroImg = useRef<HTMLDivElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const introUi = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [noteRect, setNoteRect] = useState<StageRect | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(true);
  const [sound, setSound] = useState<Sound>("pending");
  const [ended, setEnded] = useState(false);
  const loaded = useUI((s) => s.loaded);
  const firstRun = useRef(true);
  // The film's own sound has priority over the site ambience.
  useDuckWhileAudible(videoRef, "portfolio-intro");

  useGSAP(
    () => {
      const apply = (p: number) => {
        portfolioState.intro = p;
        const fogA = smooth(INTRO.fogIn[0], INTRO.fogIn[1], p) * (1 - smooth(INTRO.fogOut[0], INTRO.fogOut[1], p));
        if (fog.current) fog.current.style.opacity = fogA.toFixed(3);
        if (white.current) white.current.style.opacity = p < INTRO.swap ? "1" : "0";
        if (heroImg.current) {
          const h = smooth(INTRO.heroIn[0], INTRO.heroIn[1], p);
          heroImg.current.style.opacity = h.toFixed(3);
          heroImg.current.style.transform = `scale(${(1.12 - h * 0.12).toFixed(4)})`;
        }
        if (heroCopy.current) {
          const c = smooth(INTRO.copyIn[0], INTRO.copyIn[1], p);
          heroCopy.current.style.opacity = c.toFixed(3);
          heroCopy.current.style.transform = `translate3d(0, ${((1 - c) * 28).toFixed(1)}px, 0)`;
          heroCopy.current.style.pointerEvents = c > 0.6 ? "auto" : "none";
        }
        if (introUi.current) {
          introUi.current.style.opacity = (1 - smooth(0.04, 0.16, p)).toFixed(3);
          introUi.current.style.visibility = p > 0.17 ? "hidden" : "visible";
        }
        const dark = p >= INTRO.swap;
        if (ui.get().headerTheme !== (dark ? "dark" : "light")) ui.set({ headerTheme: dark ? "dark" : "light" });
      };
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => apply(s.progress),
        onRefresh: (s) => apply(s.progress),
        // Past the intro the page stays dark.
        onLeave: () => apply(1),
      });
      apply(0);
    },
    { scope: root },
  );

  // Video lifecycle: first run with sound (if the browser allows), then a
  // silent loop. Paused once the camera has passed through it.
  const startPlayback = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    try {
      await v.play();
      setSound("on");
    } catch {
      // Autoplay with sound blocked: play muted, offer "Tap to play sound".
      v.muted = true;
      try {
        await v.play();
      } catch {
        /* will retry on interaction */
      }
      setSound("blocked");
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ready = () => setVideo(v);
    if (v.readyState >= 1) ready();
    else v.addEventListener("loadedmetadata", ready, { once: true });
    const onEnded = () => {
      if (!firstRun.current) return;
      firstRun.current = false;
      setEnded(true);
      v.loop = true;
      v.play().catch(() => {});
    };
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", ready);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    if (loaded) startPlayback();
  }, [loaded, startPlayback]);

  // Blocked? Any real interaction unlocks the sound.
  useEffect(() => {
    if (sound !== "blocked") return;
    const unlock = () => {
      const v = videoRef.current;
      if (!v || portfolioState.intro > INTRO.swap) return;
      v.muted = false;
      v.play()
        .then(() => setSound("on"))
        .catch(() => {});
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [sound]);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.muted) {
      v.muted = false;
      v.play().catch(() => {});
      setSound("on");
    } else {
      v.muted = true;
      setSound("off");
    }
  };

  // Measure the intro note so the 3D ring is sized to stay clear of it.
  useEffect(() => {
    const s = stage.current;
    const n = noteRef.current;
    if (!s || !n) return;
    const measure = () => {
      const a = s.getBoundingClientRect();
      const b = n.getBoundingClientRect();
      if (!a.width || !a.height || !b.width) return;
      const next: StageRect = {
        x0: (b.left - a.left) / a.width,
        y0: (b.top - a.top) / a.height,
        x1: (b.right - a.left) / a.width,
        y1: (b.bottom - a.top) / a.height,
      };
      setNoteRect((prev) =>
        prev &&
        Math.abs(prev.x0 - next.x0) < 0.002 &&
        Math.abs(prev.y0 - next.y0) < 0.002 &&
        Math.abs(prev.x1 - next.x1) < 0.002 &&
        Math.abs(prev.y1 - next.y1) < 0.002
          ? prev
          : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    ro.observe(n);
    return () => ro.disconnect();
  }, []);

  // Only render / play while the intro is on screen; silence it once the
  // camera is through.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const v = videoRef.current;
        if (!v) return;
        if (s.progress > INTRO.swap && !v.paused) v.pause();
        else if (s.progress <= INTRO.swap && v.paused && v.readyState >= 2 && portfolioState.intro < INTRO.swap) {
          v.play().catch(() => {});
        }
      },
    });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      portfolioState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      portfolioState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      st.kill();
      window.removeEventListener("pointermove", onMove);
      resetPortfolioState();
      ui.set({ headerTheme: "light" });
    };
  }, []);

  return (
    <section ref={root} aria-label="Blue Book Press portfolio" className="relative h-[560svh]">
      <div ref={stage} className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {/* 01 — Portfolio hero (revealed after the clouds) */}
        <div ref={heroImg} aria-hidden className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portfolioAssets.heroImage}
            alt=""
            className="size-full object-cover portrait:object-contain portrait:[mask-image:linear-gradient(to_bottom,transparent_22%,black_34%,black_66%,transparent_78%)]"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-ink/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />
        </div>

        <div
          ref={heroCopy}
          className="absolute inset-0 flex flex-col justify-between pb-6 pt-[calc(var(--spacing-header)+1rem)] text-paper md:pb-8"
          style={{ opacity: 0 }}
        >
          <div className="container-site flex items-start justify-between">
            <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80">
              <span className="tabular-nums text-blue">(01)</span>
              <span aria-hidden className="h-px w-8 bg-blue/70" />
              {portfolioCopy.hero.eyebrow}
            </p>
          </div>
          <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="max-w-md font-serif text-[clamp(1.5rem,2.3vw,2.2rem)] leading-tight tracking-[-0.02em]">
              <span className="sr-only">Portfolio — </span>
              {portfolioCopy.hero.intro}
            </h1>
            <div className="flex items-end gap-10">
              <p className="text-sm tabular-nums text-paper/75">
                <span className="block font-serif text-4xl leading-none text-paper">{portfolioBooks.length}</span>
                titles featured
              </p>
              <div className="hidden flex-col items-center gap-2.5 md:flex">
                <span className="eyebrow text-[0.6rem] text-paper/70">Scroll</span>
                <span className="relative block h-9 w-px overflow-hidden bg-paper/25">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-blue" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 00 — white intro page */}
        <div ref={white} aria-hidden className="absolute inset-0 bg-paper" />

        {/* WebGL: ring + film + clouds */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-1000",
            loaded ? "opacity-100" : "opacity-0",
          )}
        >
          <IntroScene video={video} note={noteRect} active={active} />
        </div>

        {/* White fog that hides the white → black swap */}
        <div ref={fog} aria-hidden className="pointer-events-none absolute inset-0 bg-paper" style={{ opacity: 0 }} />

        {/* Intro UI (white page) */}
        <div
          ref={introUi}
          className="absolute inset-0 flex flex-col justify-between pb-6 pt-[calc(var(--spacing-header)+1rem)] text-ink"
        >
          <div className="container-site flex items-start justify-between">
            <motion.p
              className="eyebrow flex items-center gap-3 text-[0.68rem] text-ink-soft"
              initial={{ opacity: 0, y: 10 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
            >
              <span className="tabular-nums text-blue">(00)</span>
              <span aria-hidden className="h-px w-8 bg-blue/60" />
              Portfolio · 2026
            </motion.p>
            <p className="eyebrow hidden text-[0.68rem] text-ink-soft sm:block">Blue Book Press</p>
          </div>

          <div className="container-site grid grid-cols-[auto_1fr] items-end gap-x-4 gap-y-4 sm:landscape:grid-cols-[1fr_auto_1fr]">
            <SoundControl sound={sound} onToggle={toggleSound} />
            <div className="flex flex-col items-center gap-2.5 max-sm:justify-self-end portrait:justify-self-end">
              <span
                className={cn(
                  "eyebrow text-[0.6rem] transition-colors duration-700",
                  ended ? "text-ink" : "text-ink-muted",
                )}
              >
                {ended ? "Scroll to enter" : "Scroll"}
              </span>
              <span className="relative block h-9 w-px overflow-hidden bg-ink/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-blue" />
              </span>
            </div>
            {/* Intro note: a narrow column at the bottom right on landscape screens;
                above the controls in portrait. Narrower (≤ 3:2) and short screens show the
                opening lines with "Read more". The ring is sized around it. */}
            <motion.div
              ref={noteRef}
              className="col-span-2 order-first sm:landscape:order-none sm:landscape:col-span-1 sm:landscape:max-w-[18rem] sm:landscape:justify-self-end"
              initial={{ opacity: 0 }}
              animate={loaded ? { opacity: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
            >
              <p className="eyebrow flex items-center gap-3 text-[0.6rem] text-ink-soft">
                <span aria-hidden className="h-px w-6 bg-blue" />
                {portfolioCopy.introNote.label}
              </p>
              <p className="mt-2.5 font-serif text-[0.95rem] leading-snug text-ink sm:text-[1.02rem]">
                {portfolioCopy.introNote.lead}
              </p>
              <p
                id="intro-note-body"
                className={cn(
                  "mt-1.5 text-[0.68rem] leading-[1.6] text-ink-soft sm:text-[0.72rem]",
                  !noteOpen && "[@media(max-aspect-ratio:3/2)]:line-clamp-3 [@media(max-height:560px)]:line-clamp-3",
                )}
              >
                {portfolioCopy.introNote.body}
              </p>
              <button
                type="button"
                onClick={() => setNoteOpen((o) => !o)}
                aria-expanded={noteOpen}
                aria-controls="intro-note-body"
                className="eyebrow mt-2 hidden items-center gap-2 text-[0.58rem] text-blue [@media(max-aspect-ratio:3/2)]:inline-flex [@media(max-height:560px)]:inline-flex"
              >
                {noteOpen ? "Read less" : "Read more"}
                <span aria-hidden className="h-px w-4 bg-blue" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Source element for the WebGL video texture (kept in view so the
            browser keeps decoding it; visually hidden behind the canvas). */}
        <video
          ref={videoRef}
          src={portfolioAssets.introVideo}
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 -z-10 size-2 opacity-0"
        />
      </div>
    </section>
  );
}

function SoundControl({ sound, onToggle }: { sound: Sound; onToggle: () => void }) {
  const on = sound === "on";
  return (
    <div className="justify-self-start">
      <AnimatePresence mode="wait">
        <motion.button
          key={sound === "blocked" ? "blocked" : "toggle"}
          type="button"
          onClick={onToggle}
          aria-pressed={on}
          aria-label={on ? "Mute intro film" : "Play intro film sound"}
          className={cn(
            "group flex items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur transition-colors duration-500",
            sound === "blocked"
              ? "border-blue bg-blue text-paper hover:bg-blue/85"
              : "border-ink/15 bg-paper/70 text-ink hover:border-ink/40",
          )}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Bars on={on} />
          {sound === "blocked" ? "Tap to play sound" : on ? "Sound on" : "Sound off"}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}

/** Four equaliser bars — moving while sound is on. */
function Bars({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0.5, 1, 0.7, 0.9].map((h, i) => (
        <span
          key={i}
          className={cn("w-[2px] origin-bottom rounded-full bg-current", on && "animate-eq")}
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s`, transform: on ? undefined : "scaleY(0.35)" }}
        />
      ))}
    </span>
  );
}
