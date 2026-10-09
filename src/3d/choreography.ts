/**
 * Scroll choreography for the five books.
 *
 * Every homepage section carries `data-stage="<id>"`. When a section scrolls
 * in, each book interpolates from its previous pose to the pose defined here.
 *
 * Pose units
 *  - x, y: normalised viewport position (-1 → 1, like NDC). 0,0 = screen centre.
 *  - z:    world depth offset (+ toward camera, - away).
 *  - rx, ry, rz: rotation in radians.
 *  - s:    book height as a fraction of the stage "unit" (≈ viewport height).
 */
export type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number };

export type Layer = "front" | "back";

export type Keyframe =
  | {
      kind: "pose";
      /** front = canvas above the text, back = behind it. */
      layer: Layer;
      main: Pose;
      mainMobile?: Pose;
      /** Dock the main book onto `[data-stage-anchor="<id>"]` (position + height); rotation from `main`. */
      mainAnchor?: string;
      /** top-left, top-right, bottom-left, bottom-right */
      sats: [Pose, Pose, Pose, Pose];
    }
  /** Books lock onto DOM slots (`stage.slots`). */
  | { kind: "slots"; layer: Layer }
  /**
   * Scroll-scrubbed: the main book is sampled along `stops` using the
   * section's own pin progress (`stage.track[id]`, 0 → 1).
   */
  | {
      kind: "track";
      layer: Layer;
      stops: TrackStop[];
      sats: [Pose, Pose, Pose, Pose];
    };

export type TrackStop = { at: number; main: Pose; mainMobile: Pose };

const p = (x: number, y: number, z: number, rx: number, ry: number, rz: number, s: number): Pose => ({
  x,
  y,
  z,
  rx,
  ry,
  rz,
  s,
});

/** Satellites tucked just beyond the frame edges, drifting in depth. */
const satsAway = (drift = 0): [Pose, Pose, Pose, Pose] => [
  p(-2.3, 1.2 + drift, -3, 0.6, 1.4, 0.3, 0.2),
  p(2.4, 1.0 - drift, -3.5, -0.4, -1.6, -0.3, 0.2),
  p(-2.4, -1.1 - drift, -3.2, -0.5, 1.9, 0.4, 0.2),
  p(2.3, -1.2 + drift, -2.8, 0.5, -1.2, -0.4, 0.2),
];

export const keyframes: Record<string, Keyframe> = {
  hero: {
    kind: "pose",
    layer: "front",
    // Centre book: large, turned enough to leave room for the flanking words.
    main: p(-0.008, -0.03, 0, 0.06, -0.5, 0.03, 0.5),
    mainMobile: p(0, 0.3, 0, 0.06, -0.36, 0.03, 0.44),
    // Satellites sit in the four empty corner zones (above / below the
    // headline rows), well clear of the centre book.
    sats: [
      p(-0.79, 0.545, 0, 0.3, 0.55, 0.46, 0.155),
      p(0.79, 0.545, 0, -0.25, -0.65, -0.42, 0.155),
      p(-0.78, -0.515, 0, -0.22, 0.75, -0.4, 0.15),
      p(0.79, -0.515, 0, 0.26, -0.55, 0.44, 0.155),
    ],
  },
  about: {
    kind: "pose",
    layer: "front",
    main: p(0.52, -0.02, 0.4, 0.12, -0.85, -0.08, 0.56),
    sats: [
      p(-2.3, 1.1, -3, 0.5, 1.1, 0.25, 0.2),
      p(0.9, 0.72, -2.5, -0.3, -1.3, -0.2, 0.16),
      p(-2.3, -1.0, -3, -0.35, 1.5, 0.3, 0.18),
      p(0.94, -0.78, -1.8, 0.4, -1, -0.3, 0.17),
    ],
  },
  /**
   * Partners in Publishing: the books lift away behind the section's white
   * surface, leaving the logo wall clean.
   */
  partners: {
    kind: "pose",
    layer: "back",
    main: p(0.52, 0.9, -2.4, 0.2, -1.4, -0.1, 0.4),
    sats: satsAway(0.4),
  },
  /**
   * Pinned storytelling section: normal → huge & close to camera → back out.
   * The book lives on the right, behind a white veil that keeps text crisp.
   */
  story: {
    kind: "track",
    layer: "back",
    stops: [
      { at: 0, main: p(0.46, -0.02, 0, 0.08, -0.62, 0.04, 0.5), mainMobile: p(0, 0.36, 0, 0.08, -0.5, 0.04, 0.36) },
      { at: 0.5, main: p(0.3, -0.06, 3.4, 0.14, -0.22, -0.05, 0.6), mainMobile: p(0, 0.25, 2.2, 0.12, -0.2, -0.04, 0.4) },
      { at: 1, main: p(0.46, -0.02, 0, 0.06, 0.38, 0.03, 0.46), mainMobile: p(0, 0.36, 0, 0.06, 0.3, 0.03, 0.34) },
    ],
    sats: satsAway(0.3),
  },
  services: {
    kind: "pose",
    layer: "front",
    main: p(-0.64, -0.02, 0, -0.06, 0.78, 0.06, 0.46),
    sats: satsAway(0.1),
  },
  portfolio: { kind: "slots", layer: "front" },
  why: {
    kind: "pose",
    layer: "back",
    main: p(0, 0.02, -2.6, 0.22, 2.55, 0.18, 0.6),
    sats: satsAway(0.2),
  },
  process: {
    kind: "pose",
    layer: "front",
    main: p(-0.6, -0.52, 0.6, 0.08, 0.6, -0.12, 0.32),
    sats: satsAway(0),
  },
  audiobooks: {
    kind: "pose",
    layer: "front",
    main: p(-0.54, 0, 0.6, 0.14, 0.95, 0.08, 0.54),
    sats: satsAway(0.15),
  },
  testimonials: {
    kind: "pose",
    layer: "back",
    main: p(0.05, -0.42, -2.2, 0.3, -2.3, 0.25, 0.5),
    sats: satsAway(0.25),
  },
  faq: {
    kind: "pose",
    layer: "front",
    main: p(-0.64, -0.52, -0.2, 0.1, 0.5, -0.1, 0.34),
    sats: satsAway(0.05),
  },
  contact: {
    kind: "pose",
    layer: "front",
    main: p(0, 0, 0, 0.05, 6.0, 0, 0.4),
    mainAnchor: "contact",
    sats: [
      p(-0.78, 0.48, -1, 0.3, 0.9, 0.2, 0.22),
      p(0.8, 0.52, -1.4, -0.25, -1.0, -0.2, 0.2),
      p(-0.76, -0.55, -1.2, -0.2, 1.1, -0.15, 0.2),
      p(0.78, -0.5, -0.8, 0.25, -0.8, 0.15, 0.22),
    ],
  },
  /** Footer: the collection lifts away so the wordmark has the stage. */
  footer: {
    kind: "pose",
    layer: "back",
    main: p(0.1, 1.6, -3, 0.5, 7.2, 0.3, 0.3),
    sats: satsAway(0.6),
  },
};

/** Fallback when a section has no keyframe. */
export const hiddenPose = p(0, -2, -6, 0, 0, 0, 0.2);

export function lerpPose(out: Pose, to: Pose, t: number) {
  out.x += (to.x - out.x) * t;
  out.y += (to.y - out.y) * t;
  out.z += (to.z - out.z) * t;
  out.rx += (to.rx - out.rx) * t;
  out.ry += (to.ry - out.ry) * t;
  out.rz += (to.rz - out.rz) * t;
  out.s += (to.s - out.s) * t;
  return out;
}

/** easeInOutCubic — keeps arrivals and departures soft. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
