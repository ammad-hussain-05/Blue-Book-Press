/**
 * Frame-friendly state for the Publishing Suite 3D stage. ScrollTrigger
 * writes it from the DOM, `useFrame` reads it — scrolling never re-renders.
 */
export const suiteState = {
  /** Hero scrolling out of view (0 → 1): books fly past the camera. */
  hero: 0,
  /** Section 2 pin progress (0 → 1): books zoom back in one by one. */
  reveal: 0,
  /** Section 3 progress (0 → 1): formats layout, then the books leave. */
  formats: 0,
  /** Intro camera pull-back after the preloader (0 → 1). */
  intro: 0,
  /** Normalised pointer (-1 → 1) for a gentle camera parallax. */
  pointer: { x: 0, y: 0 },
};

export const resetSuiteState = () => {
  suiteState.hero = 0;
  suiteState.reveal = 0;
  suiteState.formats = 0;
  suiteState.intro = 0;
  suiteState.pointer.x = 0;
  suiteState.pointer.y = 0;
};
