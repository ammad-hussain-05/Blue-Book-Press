import { StageCanvas } from "@/3d/StageCanvas";
import { ScrollDirector } from "@/3d/ScrollDirector";
import { Hero } from "@/sections/Hero";
import { PublishingSupport } from "@/sections/PublishingSupport";
import { PartnersSection } from "@/sections/PartnersSection";
import { PublishingStory } from "@/sections/PublishingStory";
import { Services } from "@/sections/Services";
import { BookShowcase } from "@/sections/BookShowcase";
import { WhyChooseUs } from "@/sections/WhyChooseUs";
import { Process } from "@/sections/Process";
import { Audiobooks } from "@/sections/Audiobooks";
import { Testimonials } from "@/sections/Testimonials";
import { Faq } from "@/sections/Faq";
import { FinalCta } from "@/sections/FinalCta";
import { Footer } from "@/layout/Footer";

/**
 * Homepage. Each section carries `data-stage`, which the ScrollDirector maps
 * to a pose in `3d/choreography.ts` for the fixed 3D book stage.
 */
export default function HomePage() {
  return (
    <>
      <StageCanvas />
      <Hero />
      <PublishingSupport />
      <PartnersSection />
      <PublishingStory />
      <Services />
      <BookShowcase />
      <WhyChooseUs />
      <Process />
      <Audiobooks />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
      <ScrollDirector />
    </>
  );
}
