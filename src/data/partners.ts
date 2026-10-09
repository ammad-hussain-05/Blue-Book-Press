/**
 * Partners in Publishing — logos from public/partners/ (transparent WebP).
 * `box` is each file's measured artwork bounds (x, y, w, h in file px), so
 * every logo can be cropped to its artwork and sized to the same visual
 * weight regardless of the padding baked into the file.
 */

export type Partner = {
  name: string;
  src: string;
  /** Whole file size. */
  file: { w: number; h: number };
  /** Artwork bounds inside the file. */
  box: { x: number; y: number; w: number; h: number };
};

const P = "/partners";

export const partners: Partner[] = [
  { name: "Amazon", src: `${P}/Amazon.webp`, file: { w: 300, h: 117 }, box: { x: 14, y: 18, w: 266, h: 82 } },
  { name: "Barnes & Noble", src: `${P}/Barnes-Nobles.webp`, file: { w: 300, h: 117 }, box: { x: 0, y: 35, w: 300, h: 46 } },
  { name: "Walmart", src: `${P}/Walmart.webp`, file: { w: 500, h: 300 }, box: { x: 149, y: 27, w: 202, h: 246 } },
  { name: "Waterstones", src: `${P}/Waterstones-1.webp`, file: { w: 300, h: 117 }, box: { x: 82, y: 3, w: 135, h: 111 } },
  { name: "WHSmith", src: `${P}/WHSmith.webp`, file: { w: 500, h: 300 }, box: { x: 40, y: 124, w: 421, h: 52 } },
  { name: "Powell’s City of Books", src: `${P}/Power-city-of-books.webp`, file: { w: 300, h: 117 }, box: { x: 43, y: 0, w: 213, h: 117 } },
  { name: "Scribd", src: `${P}/Scribd.webp`, file: { w: 300, h: 117 }, box: { x: 78, y: 11, w: 130, h: 96 } },
  { name: "tolino", src: `${P}/tolino.webp`, file: { w: 500, h: 300 }, box: { x: 123, y: 102, w: 253, h: 96 } },
  { name: "Trustpilot", src: `${P}/Trustpilot.webp`, file: { w: 500, h: 300 }, box: { x: 120, y: 90, w: 261, h: 121 } },
];

/** Two marquee rows, moving in opposite directions. */
export const partnerRows: Partner[][] = [partners.slice(0, 5), partners.slice(5)];

export const partnersCopy = {
  label: "Partners in Publishing",
  heading: ["Publishing reach across", "leading platforms."],
  body: "Every Blue Book Press title is prepared for the stores and reading platforms where readers discover, buy and review books — from global retailers to celebrated independent booksellers.",
  channels: ["Global retail", "Independent booksellers", "Subscription reading", "Reader reviews"],
};

/**
 * Display size of a logo's artwork (px at 1×): equal visual weight
 * (√(w·h) ≈ WEIGHT), capped so tall marks and long wordmarks stay in the card.
 */
const WEIGHT = 92;
const MAX_H = 76;
const MAX_W = 220;
export function partnerScale(p: Partner) {
  return Math.min(WEIGHT / Math.sqrt(p.box.w * p.box.h), MAX_H / p.box.h, MAX_W / p.box.w);
}
