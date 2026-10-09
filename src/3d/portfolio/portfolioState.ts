/**
 * Frame-friendly state for the Portfolio page's WebGL layers. Written by
 * ScrollTrigger / pointer listeners, read inside `useFrame` — scrolling
 * never re-renders React.
 */
export const portfolioState = {
  /** Intro pin progress (0 → 1): ring + video → dolly in → clouds → hero. */
  intro: 0,
  /** All Books pin progress (0 → 1). */
  showcase: 0,
  /** Collection sliders pin progress (0 → 1). */
  sliders: 0,
  /** "From Cover to Reader" pin progress (0 → 1). */
  journey: 0,
  /** Normalised pointer (-1 → 1). */
  pointer: { x: 0, y: 0 },
};

export const resetPortfolioState = () => {
  portfolioState.intro = 0;
  portfolioState.showcase = 0;
  portfolioState.sliders = 0;
  portfolioState.journey = 0;
  portfolioState.pointer.x = 0;
  portfolioState.pointer.y = 0;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Intro timeline (fractions of the pinned scroll). Shared by the DOM layers
 * and the WebGL scene so both stay in lock-step.
 */
export const INTRO = {
  /** Camera dolly into the video. */
  dolly: [0.1, 0.58] as const,
  /** Clouds build, peak and thin out. */
  cloudsIn: [0.38, 0.6] as const,
  cloudsOut: [0.72, 0.88] as const,
  /** Solid white fog overlay covering the white → black swap. */
  fogIn: [0.54, 0.64] as const,
  fogOut: [0.69, 0.8] as const,
  /** Moment the page underneath turns black (hidden by the fog). */
  swap: 0.665,
  /** Portfolio hero image + copy. */
  heroIn: [0.7, 0.84] as const,
  copyIn: [0.82, 0.92] as const,
};

/**
 * All Books timeline (fractions of the pinned scroll). The full collection
 * holds the frame until `start`; between `start` and `end` each book gets an
 * equal slot (local t: 0 → 1) — it comes forward (0 → enter), holds beside
 * its copy (enter → exit), then returns to the collection (exit → 1).
 */
export const COLLECTION = { start: 0.06, end: 0.95, enter: 0.3, exit: 0.7 } as const;

/** Continuous focus position: book i owns the stage while i ≤ k < i + 1. */
export const collectionK = (q: number, n: number) =>
  ((q - COLLECTION.start) / (COLLECTION.end - COLLECTION.start)) * n;

/** How far book i is out of the collection and at the camera (0 → 1). */
export const collectionFocus = (k: number, i: number) => {
  const t = k - i;
  if (t <= 0 || t >= 1) return 0;
  return smooth(0, COLLECTION.enter, t) * (1 - smooth(COLLECTION.exit, 1, t));
};

/** Visibility of book i's title + description: only while it holds still. */
export const collectionCopy = (k: number, i: number) => {
  const t = k - i;
  return smooth(COLLECTION.enter - 0.06, COLLECTION.enter + 0.04, t) * (1 - smooth(COLLECTION.exit - 0.06, COLLECTION.exit + 0.02, t));
};

/** Copy alternates sides: book 0 → right, book 1 → left, … (the book takes the other side). */
export const copySide = (i: number) => (i % 2 === 0 ? 1 : -1);

/** How far the rest of the collection has stepped back for the focus (0 → 1). */
export const collectionRecede = (q: number, n: number) => {
  const slot = (COLLECTION.end - COLLECTION.start) / n;
  return smooth(COLLECTION.start - 0.02, COLLECTION.start + slot * 0.3, q) * (1 - smooth(COLLECTION.end - slot * 0.3, COLLECTION.end + 0.02, q));
};

/**
 * Collection sliders: the pin is split evenly between `count` waves. Inside
 * a wave (local u: 0 → 1) books rise in, slide past the focus, then flow out.
 */
export const WAVE = { enter: 0.14, exit: 0.86 } as const;

/** Local progress of wave k (can be < 0 before it, > 1 after it). */
export const waveLocal = (q: number, k: number, count: number) => q * count - k;

/** Focused position (0 … books-1) inside wave k. */
export const waveFocus = (u: number, books: number) => smooth(WAVE.enter, WAVE.exit, u) * (books - 1);

/** Active wave index for a progress value. */
export const activeWave = (q: number, count: number) => Math.min(count - 1, Math.max(0, Math.floor(q * count)));

/** "From Cover to Reader" stage weights: design → produce → publish. */
export const journeyStages = (q: number) => ({
  design: smooth(0.02, 0.3, q),
  produce: smooth(0.36, 0.62, q),
  publish: smooth(0.68, 0.94, q),
});
