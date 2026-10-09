/**
 * About page camera tour. One keyframe per scroll step (must match
 * `aboutSteps`). The scene samples these with eased "hold" plateaus, so
 * each step settles before the camera travels to the next.
 *
 * Model: twisted point-cloud ribbon, normalised to MODEL_SIZE, lying in XZ.
 */
export type V3 = [number, number, number];

export type TourKey = {
  /** Camera position. */
  cam: V3;
  /** Point the camera looks at. Offsetting it frames the model left/right. */
  target: V3;
  fov: number;
  /** Model rotation (radians). */
  rot: V3;
  /** Mobile only: extra upward shift of the model when the copy is tall. */
  mobileLift?: number;
};

export const MODEL_SIZE = 4.4;

export const tour: TourKey[] = [
  // 1 The Press — front wide, model framed right, copy left
  { cam: [0, 1.7, 9.8], target: [-1.5, 0, 0], fov: 32, rot: [0.18, -0.45, 0] },
  // 2 Philosophy — closer, subtle turn to show depth, copy left
  { cam: [0.8, 1.15, 7.0], target: [-1.25, 0, 0], fov: 34, rot: [0.3, -0.05, 0.08] },
  // 3 Built for Authors — camera swings to the left side, copy right
  { cam: [-7.0, 1.2, 4.2], target: [0.6, -0.1, 1.6], fov: 34, rot: [0.22, 0.35, 0] },
  // 4 Editorial Standards — around the back/side, deeper perspective, copy right
  { cam: [-3.4, 2.7, -6.6], target: [-0.9, 0, 1.0], fov: 42, rot: [0.38, 1.15, 0.1] },
  // 5 Design & Presentation — swing out to the front right, model framed right, copy left
  { cam: [5.6, 3.0, 5.4], target: [-0.97, 0, 1.0], fov: 36, rot: [0.28, 0.75, -0.06] },
  // 6 Formats — zoom into the ribbon: the camera enters the structure
  { cam: [0.25, 0.35, 1.15], target: [0, 0.75, -3], fov: 58, rot: [0.06, 0.9, 0] },
  // 7 Marketing & Visibility — pull out and rise to reveal the full form, copy left
  { cam: [0.4, 7.4, 6.4], target: [-1.2, -0.3, 0], fov: 34, rot: [0.12, 1.85, 0] },
  // 8 Why Authors Choose Us — orbit to the right, copy right
  { cam: [7.2, 1.9, -1.8], target: [0.4, 0, -1.6], fov: 36, rot: [0.3, 2.6, -0.1] },
  // 9 Recognised Presence — premium centred view, model low, copy above
  { cam: [0, 2.4, 8.6], target: [0, 1.75, 0], fov: 34, rot: [0.5, 3.45, 0], mobileLift: 3.2 },
  // 10 The Future of Every Story — polished composition, model right, copy + CTA left
  { cam: [0, 1.3, 10.6], target: [-1.6, 0.05, 0], fov: 32, rot: [0.2, 6.05, 0.05], mobileLift: 1.9 },
];

/** Live scroll state shared between the DOM and the scene (no React state). */
export const tourState = {
  /** 0 → 1 across the pinned scroll. */
  progress: 0,
  /** Normalised pointer, -1 → 1. */
  pointer: { x: 0, y: 0 },
};
