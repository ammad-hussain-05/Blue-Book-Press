import type { Metadata } from "next";
import { Footer } from "@/layout/Footer";
import { SuiteIntro } from "@/sections/suite/SuiteIntro";
import { SuiteMarquee } from "@/sections/suite/SuiteMarquee";
import { SuiteServices } from "@/sections/suite/SuiteServices";
import { SuiteCta } from "@/sections/suite/SuiteCta";
import { SuitePageChrome } from "@/sections/suite/SuitePageChrome";

export const metadata: Metadata = {
  title: "Publishing Suite",
  description:
    "The Author's Publishing Suite — audiobook production, e-book publishing, publishing services, cover design, editing, interior and paperback formatting, and book marketing from Blue Book Press.",
};

/**
 * Publishing Suite (services). Sections:
 * 01 Hero · 02 Reveal · 03 Formats (3D stage, then gone) · marquee ·
 * 04–10 services · 11 CTA.
 */
export default function PublishingSuitePage() {
  return (
    <div className="relative bg-blue text-paper">
      <SuitePageChrome />
      <SuiteIntro />
      <SuiteMarquee />
      <SuiteServices />
      <SuiteCta />
      <Footer tone="blue" />
    </div>
  );
}
