import type { Metadata } from "next";
import { AboutTour } from "@/sections/about/AboutTour";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Blue Book Press is a modern publishing studio: editing, design, formatting, print, eBook and audiobook production, and marketing — complete author support in one place.",
};

/** About ("The Press"): a single pinned, immersive 3D scene with ten scroll states. */
export default function AboutPage() {
  return <AboutTour />;
}
