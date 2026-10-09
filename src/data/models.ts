/**
 * GLB book models in `/public/3d models/` — each with its real cover art
 * baked in. The folder name contains a space, so URLs are built with
 * `modelUrl` (percent-encoded).
 */
export type ModelId = "mindToBend" | "darkestCraving" | "littleBird" | "kingpinsBaby" | "loserLuna";

export type ModelDef = {
  file: string;
  /**
   * Euler (radians) + order applied before normalisation so that
   * height = +Y, front cover faces +Z and the spine sits on the left.
   */
  fix: [number, number, number, "XYZ" | "ZYX"];
};

const HALF_PI = Math.PI / 2;

export const models: Record<ModelId, ModelDef> = {
  /** Main hero book — full wrap cover (front, spine and back). */
  mindToBend: { file: "book_model.glb", fix: [HALF_PI, 0, 0, "XYZ"] },
  darkestCraving: { file: "book.glb", fix: [HALF_PI, 0, 0, "XYZ"] },
  littleBird: { file: "little_bird_closed_book.glb", fix: [0, 0, 0, "XYZ"] },
  kingpinsBaby: { file: "simple_3d_black_book.glb", fix: [HALF_PI, 0, 0, "XYZ"] },
  loserLuna: { file: "simple_book.glb", fix: [HALF_PI, 0, HALF_PI, "ZYX"] },
};

export const modelUrl = (id: ModelId) => `/3d%20models/${encodeURIComponent(models[id].file)}`;
