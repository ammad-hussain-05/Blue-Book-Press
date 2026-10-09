import type { Metadata } from "next";
import { Footer } from "@/layout/Footer";
import { portfolioCopy } from "@/data/portfolio";
import { PortfolioChrome } from "@/sections/portfolio/PortfolioChrome";
import { PortfolioIntro } from "@/sections/portfolio/PortfolioIntro";
import { PortfolioMarquee } from "@/sections/portfolio/PortfolioMarquee";
import { CinemaSection } from "@/sections/portfolio/CinemaSection";
import { StatementSection } from "@/sections/portfolio/StatementSection";
import { ShowcaseSection } from "@/sections/portfolio/ShowcaseSection";
import { SlidersSection } from "@/sections/portfolio/SlidersSection";
import { MockupSection } from "@/sections/portfolio/MockupSection";
import { JourneySection } from "@/sections/portfolio/JourneySection";
import { PortfolioCta } from "@/sections/portfolio/PortfolioCta";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work from Blue Book Press — cover design, print and digital presentation, audiobook artwork and launch visuals for independent authors.",
};

/**
 * Portfolio. 00 white intro (The Press ring + film) → clouds → 01 black hero
 * · marquee · 03 film · 04 statement · 05 all books: the full collection,
 * then one book at a time (WebGL) · 06 the collection: four wave sliders
 * (WebGL) · 07 cover to reader (WebGL) · 08 visual systems · cross marquee ·
 * 09 CTA.
 * Everything after the white intro sits on pure black: `ink` is remapped
 * to #000 for this page.
 */
export default function PortfolioPage() {
  return (
    <div className="relative bg-ink text-paper [--color-ink:#000]">
      <PortfolioChrome />
      <PortfolioIntro />
      <PortfolioMarquee variant="parallel" words={portfolioCopy.marqueeA} label="Featured books, cover design, author stories and more" />
      <CinemaSection />
      <StatementSection />
      <ShowcaseSection />
      <SlidersSection />
      <JourneySection />
      <MockupSection />
      <PortfolioMarquee variant="cross" words={portfolioCopy.marqueeB} label="Seen, read, remembered" />
      <PortfolioCta />
      <Footer tone="dark" />
    </div>
  );
}
