/**
 * Mutable, frame-friendly state shared between the DOM (ScrollTrigger,
 * Lenis, pointer) and the R3F stage. Written outside React and read inside
 * useFrame, so scrolling never causes React re-renders.
 */
export const stage = {
  /** `data-stage` ids in DOM order. */
  sections: [] as string[],
  /** Per-section arrival progress (0 → 1). Index 0 (hero) is always 1. */
  progress: [] as number[],
  /** DOM anchors in the showcase section, indexed like `books`. */
  slots: [] as (HTMLElement | null)[],
  /** Pin progress (0 → 1) for `track` keyframes, keyed by section id. */
  track: {} as Record<string, number>,
  /** Named DOM anchors (`data-stage-anchor`) the main book can dock to. */
  anchors: {} as Record<string, HTMLElement | null>,
  /** Lenis scroll velocity (px/frame), used for subtle inertia tilt. */
  velocity: 0,
  /** Normalised pointer position (-1 → 1). */
  pointer: { x: 0, y: 0 },
  /** Intro fly-in progress (0 → 1), tweened once the preloader exits. */
  intro: 0,
  /** Fixed canvas wrapper — its `data-layer` flips between front/back. */
  wrapper: null as HTMLElement | null,
};
