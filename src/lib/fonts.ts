import { Anton, Inter, Newsreader } from "next/font/google";

/**
 * Heading: Newsreader — a high-contrast editorial serif in the Times lineage,
 * with optical sizing for large display headlines.
 */
export const headingFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-heading",
  display: "swap",
});

/** Body: Inter — clean, neutral, modern. */
export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Display: Anton — a tall, condensed grotesque for the Publishing Suite's
 * oversized marquee and image-filled headlines.
 */
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
  display: "swap",
});
