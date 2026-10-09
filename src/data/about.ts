/** About ("The Press") — ten states of one pinned, immersive scene. */

export type AboutAlign = "left" | "right" | "center";

export type AboutStep = {
  id: string;
  label: string;
  /** Art-directed heading lines. */
  heading: string[];
  body: string;
  /** Where the copy sits on desktop (the camera frames the model opposite). */
  align: AboutAlign;
  /** Optional inline list. */
  points?: string[];
  /** Final step shows calls to action. */
  cta?: boolean;
};

export const aboutSteps: AboutStep[] = [
  {
    id: "press",
    label: "The Press",
    heading: ["Stories, prepared", "for the world."],
    body: "Blue Book Press is a modern publishing studio for authors who want their work handled with real care. We take a manuscript and prepare it properly — edited, designed, formatted and produced to a professional standard — so it arrives in front of readers looking and reading like the book it was always meant to be. Print, eBook and audio, presented as one finished, recognisable work.",
    align: "left",
  },
  {
    id: "philosophy",
    label: "Our Publishing Philosophy",
    heading: ["More than", "an upload."],
    body: "Publishing is not simply uploading a manuscript and hoping it finds an audience. It is the work of shaping a book for the people who will read it and the platforms that will carry it. We bring clarity to every decision, creativity to every surface and structure to every stage — so each choice, from the first edit to the final file, serves the story and the reader it is written for.",
    align: "left",
  },
  {
    id: "authors",
    label: "Built For Authors",
    heading: ["Guided at", "every stage."],
    body: "Every author we work with is guided from manuscript to market. Editing, design, formatting, production, publishing and promotion are handled as one connected journey rather than a set of separate vendors. You always know what happens next, why it matters and what it means for your book — with a team that explains each step clearly, answers questions plainly and keeps you involved in every decision that shapes your work.",
    align: "right",
  },
  {
    id: "editorial",
    label: "Editorial Standards",
    heading: ["Craft in", "every line."],
    body: "Strong books begin with strong editing. We refine manuscripts for structure, pacing, flow and voice, then proofread for the details that readers notice — consistency, grammar, punctuation and polish. Every stage passes through careful quality control, so the text that goes to print is clean, confident and true to what you set out to write. The goal is never to replace your voice, only to let it read at its very best.",
    align: "right",
  },
  {
    id: "design",
    label: "Design & Book Presentation",
    heading: ["Designed to be", "picked up."],
    body: "Readers judge a book in seconds, so presentation matters. We design covers with clear genre signals and a distinct identity, then build interiors that read beautifully — paperback layouts set to exact trim and bleed, and eBook files structured to flow cleanly on every device. The result is a professional visual identity that holds together across the shelf, the store page and the screen, and carries from one title into a series.",
    align: "left",
  },
  {
    id: "formats",
    label: "Print, Digital & Audio",
    heading: ["One story.", "Every format."],
    body: "Your book should meet readers wherever they are. We prepare every title for paperback, eBook and audiobook — print-ready files, properly structured digital editions and professionally produced audio — so the same story reaches readers on the shelf, on their devices and in their headphones, presented to one consistent standard across every format it lives in.",
    align: "center",
  },
  {
    id: "visibility",
    label: "Marketing & Visibility",
    heading: ["Visibility beyond", "the launch."],
    body: "A finished book still needs to be found. We help position each title clearly in its market, shape promotional support around its readers and plan campaigns that build discovery around release day. After publication, we keep guiding authors on how to sustain visibility — because a book’s life does not end at launch, and long-term attention is built deliberately, not left to chance.",
    align: "left",
  },
  {
    id: "why",
    label: "Why Authors Choose Blue Book Press",
    heading: ["Everything,", "in one place."],
    body: "Authors choose us because publishing feels clear, supported and professional from the first conversation. Complete support lives under one roof, communication stays open and honest, and you keep creative control of your work while benefiting from experienced creative direction. Every book is held to high production standards and presented to be market-ready.",
    points: [
      "Complete publishing support",
      "Clear communication",
      "Professional creative direction",
      "Print, digital & audio",
      "Creative control stays with you",
    ],
    align: "right",
  },
  {
    id: "presence",
    label: "A Recognised Publishing Presence",
    heading: ["Known for", "the finish."],
    body: "Blue Book Press is recognised for professional presentation, trusted for complete author support and known for clear publishing guidance. What sets the press apart is consistency: modern production, strong design and careful editing applied to every title, whatever the genre. Authors come to us for a book that stands confidently beside any other on the shelf — and readers meet one that feels finished.",
    align: "center",
  },
  {
    id: "future",
    label: "The Future Of Every Story",
    heading: ["From manuscript", "to market."],
    body: "Every story deserves to be read the way its author imagined it. Blue Book Press exists to move manuscripts into the market with confidence, polish and purpose — professionally prepared, beautifully presented and ready for readers everywhere. When you are ready to take the next step, we are ready to begin it with you.",
    align: "left",
    cta: true,
  },
];
