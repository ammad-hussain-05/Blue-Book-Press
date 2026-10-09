import type { Metadata } from "next";
import { Footer } from "@/layout/Footer";
import {
  ContactCta,
  ContactDetails,
  ContactFormSection,
  ContactHero,
  ContactMap,
} from "@/sections/contact/ContactSections";

export const metadata: Metadata = {
  title: "Begin Your Story",
  description:
    "Talk to Blue Book Press about publishing, editing, cover and interior design, audiobook production, marketing and book presentation.",
};

/** Contact ("Begin Your Story"): hero · enquiry form · details · map · CTA. */
export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
      <ContactDetails />
      <ContactMap />
      <ContactCta />
      <Footer />
    </>
  );
}
