"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { suiteTextures, type SuitePoint, type SuiteService } from "@/data/publishingSuite";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/** Section shell: anchor id, hairline top rule that draws in, generous rhythm. */
export function SuiteSection({
  id,
  children,
  className,
  label,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <section id={id} aria-label={label} className={cn("relative scroll-mt-4 py-[clamp(5rem,11vw,10rem)]", className)}>
      <div className="container-site">
        <motion.span
          aria-hidden
          className="block h-px origin-left bg-paper/25"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
        />
      </div>
      {children}
    </section>
  );
}

/**
 * Service header: index row, a giant texture-filled condensed word, the
 * serif title and the one-line positioning in italic.
 */
export function ServiceHeader({
  index,
  service,
  align = "left",
  className,
}: {
  index: number;
  service: SuiteService;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-tex-word]",
        { "--tex-y": "0%" },
        {
          "--tex-y": "100%",
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        align === "right" && "lg:text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      <p
        className={cn(
          "eyebrow flex items-center gap-3 text-[0.68rem] text-paper/80",
          align === "right" && "lg:justify-end",
          align === "center" && "justify-center",
        )}
      >
        <span className="tabular-nums text-paper">({pad(index)})</span>
        <span aria-hidden className="h-px w-8 bg-paper/50" />
        <span>Publishing Suite</span>
      </p>

      <span aria-hidden className="mt-4 block overflow-hidden">
        <motion.span
          data-tex-word
          className="display-caps text-texture block text-[clamp(4.4rem,12vw,13rem)]"
          style={{ "--tex": `url(${suiteTextures.grain})` } as React.CSSProperties}
          initial={{ y: "100%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.3, ease: EASE }}
        >
          {service.word}
        </motion.span>
      </span>

      <SplitHeading
        lines={[service.title]}
        className="relative -mt-[0.35em] font-serif text-[clamp(2rem,4vw,4rem)] leading-[1] tracking-[-0.03em] md:-mt-[0.45em]"
        delay={0.15}
      />
      <motion.p
        className={cn(
          "mt-4 max-w-xl font-serif text-[clamp(1.2rem,1.8vw,1.6rem)] italic leading-snug text-paper/90",
          align === "right" && "lg:ml-auto",
          align === "center" && "mx-auto",
        )}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
      >
        {service.positioning}
      </motion.p>
    </div>
  );
}

/** The one useful paragraph. */
export function ServiceBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.p
      className={cn("max-w-2xl text-[clamp(1.02rem,1.25vw,1.2rem)] leading-[1.7] text-paper/88", className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      {children}
    </motion.p>
  );
}

/**
 * Key points as a row of hairline boxes that share borders. Boxes reveal
 * as a staircase: each one starts a step lower and a beat later.
 */
export function PointGrid({ points, className, cols = 4 }: { points: SuitePoint[]; className?: string; cols?: 2 | 4 }) {
  return (
    <ul
      className={cn(
        "grid border-l border-t border-paper/30 sm:grid-cols-2",
        cols === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {points.map((p, i) => (
        <motion.li
          key={p.title}
          className="group/pt relative border-b border-r border-paper/30 p-5 transition-colors duration-500 hover:bg-paper hover:text-blue-deep md:p-6"
          initial={{ opacity: 0, y: 28 + i * 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
        >
          <span aria-hidden className="absolute right-4 top-4 text-[0.68rem] tabular-nums tracking-[0.14em] opacity-60">
            {pad(i + 1)}
          </span>
          <StepIcon i={i} />
          <p className="mt-6 font-serif text-[1.35rem] leading-tight">{p.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-paper/80 transition-colors duration-500 group-hover/pt:text-blue-deep/80">
            {p.body}
          </p>
        </motion.li>
      ))}
    </ul>
  );
}

/** Minimal stair / 90° glyph that climbs one step per point. */
function StepIcon({ i }: { i: number }) {
  const steps = i + 1;
  const w = 28;
  const s = w / 4;
  let d = `M0 ${w}`;
  for (let k = 0; k < steps; k++) d += ` V${w - (k + 1) * s} H${(k + 1) * s}`;
  d += ` V${w} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${w}`} className="size-7" aria-hidden>
      <path d={d} fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Image panel: unmasks from the bottom on entry, while the image inside
 * drifts and settles with scroll (parallax + slow de-zoom).
 */
export function ImagePanel({
  src,
  className,
  children,
  position = "50% 50%",
}: {
  src: string;
  className?: string;
  children?: ReactNode;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-panel-img]",
        { yPercent: -8, scale: 1.25 },
        {
          yPercent: 8,
          scale: 1.05,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden bg-blue-deep", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        data-panel-img
        aria-hidden
        className="absolute -inset-[8%] bg-cover will-change-transform"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
      />
      {children}
    </motion.div>
  );
}
