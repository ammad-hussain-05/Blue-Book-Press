/** Contact page ("Begin Your Story") — copy and details. */

import { site } from "./site";

export const contactCopy = {
  hero: {
    label: "Begin Your Story",
    heading: ["Every great book", "begins with a conversation."],
    body: "Whether your manuscript is finished, half-written or still an idea, tell us where you are. We’ll talk through publishing, editing, cover and interior design, audiobook production, marketing and how your book should be presented — and come back with a clear, honest plan.",
    topics: ["Publishing", "Editing", "Book design", "Audiobooks", "Marketing"],
  },
  form: {
    label: "Tell Us About Your Book",
    heading: ["Share the story", "behind the story."],
    body: "A few details help us reply with something useful rather than something generic. Every message is read by our team, and we’ll answer with next steps tailored to your book.",
    steps: [
      { title: "We read", body: "Your message goes straight to the publishing team." },
      { title: "We reply", body: "You receive a considered answer and clear next steps." },
      { title: "We begin", body: "Together we shape the plan for your book." },
    ],
  },
  details: {
    label: "Ways To Reach Us",
  },
  map: {
    label: "Where We Work",
    heading: "Publishing support, wherever you write.",
  },
  cta: {
    heading: ["Your story is ready.", "Let’s begin."],
    body: "One conversation is all it takes to turn a manuscript into a plan — and a plan into a finished book.",
  },
};

/**
 * Contact blocks. EDIT: the location and response-time wording below are
 * placeholders in the brand voice — confirm them before launch.
 */
export const contactDetails = [
  {
    id: "email",
    label: "Email",
    title: site.email,
    href: `mailto:${site.email}`,
    body: "Write to us about your manuscript, a project in progress or any publishing question.",
  },
  {
    id: "location",
    label: "Location",
    title: "Working with authors worldwide",
    body: "Consultations and project check-ins are held online, so distance is never a barrier to publishing well.",
  },
  {
    id: "support",
    label: "Publishing Support",
    title: "One team, every stage",
    body: "Editing, design, formatting, print, eBook, audiobook and marketing — guided from manuscript to market.",
  },
  {
    id: "response",
    label: "Response Time",
    title: "Within 1–2 business days",
    body: "Every enquiry receives a personal reply with clear next steps — never an automated template.",
  },
] as const;

/**
 * Map. EDIT: set `address` to the studio address to drop a pin there; while it
 * is null the map shows a calm world view (no invented location).
 */
export const contactMap = {
  address: null as string | null,
  world: { lat: 28, lng: 5, zoom: 2 },
};

export const mapEmbedUrl = () =>
  contactMap.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(contactMap.address)}&z=14&output=embed`
    : `https://maps.google.com/maps?ll=${contactMap.world.lat},${contactMap.world.lng}&z=${contactMap.world.zoom}&output=embed`;

export const mapLinkUrl = () =>
  contactMap.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactMap.address)}`
    : "https://www.google.com/maps";
