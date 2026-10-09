/**
 * Content for the Publishing Suite page (`/publishing-suite`).
 * Each service renders as its own editorial section; `menu` feeds the
 * header dropdown (one service section can carry two menu entries).
 */

export type SuitePoint = { title: string; body: string };

export type SuiteService = {
  /** Section id — also the URL hash. */
  id: string;
  /** Short display word used in the giant condensed title. */
  word: string;
  title: string;
  positioning: string;
  body: string;
  points: SuitePoint[];
  menu: { label: string; anchor: string }[];
};

/** Abstract blue / white textures derived from `public/service-design/`. */
export const suiteTextures = {
  grain: "/service-design/suite-texture-grain.jpg",
  light: "/service-design/suite-texture-light.jpg",
} as const;

export const suiteHero = {
  eyebrow: "Blue Book Press presents",
  above: "The Author's",
  below: "Publishing Suite",
  intro:
    "Eight disciplines, one studio. Editing, design, formatting, audio, distribution and marketing — composed around a single manuscript: yours.",
};

export const suiteReveal = {
  label: "Complete Support",
  heading: ["Five books.", "One complete press."],
  body:
    "Every title that leaves Blue Book Press passes through the same considered sequence. Nothing is outsourced to chance — each stage hands a better book to the next.",
  stages: [
    { title: "Manuscript", body: "We read it end to end and map what it needs." },
    { title: "Refine", body: "Editing and proofreading sharpen every line." },
    { title: "Design", body: "Cover and interior built for its genre and shelf." },
    { title: "Produce", body: "Print, e-book and audio files made to spec." },
    { title: "Launch", body: "Distribution and promotion put it in readers' hands." },
  ],
};

export const suiteFormats = {
  label: "Format Universe",
  heading: ["One story,", "every format."],
  formats: [
    { word: "Print", body: "Paperback and hardcover editions, typeset and print-ready for global print-on-demand." },
    { word: "Digital", body: "Reflowable and fixed-layout e-books that read beautifully on every device and store." },
    { word: "Audio", body: "Studio-produced audiobooks, mastered for Audible, Apple Books, Spotify and beyond." },
  ],
};

export const suiteMarquee = [
  "Publishing",
  "Editing",
  "Audiobooks",
  "Cover Design",
  "Formatting",
  "Marketing",
  "Distribution",
  "Author Support",
];

export const suiteServices: SuiteService[] = [
  {
    id: "audiobook-production",
    word: "Audio",
    title: "Audio Book Production",
    positioning: "Your book, given a voice worth listening to.",
    body:
      "Audiobooks are the fastest-growing format in publishing, and listeners are unforgiving of thin sound or a mismatched narrator. We cast voice talent to suit your genre and characters, direct every session in a treated studio, then edit, master and package the finished files to the exact technical standards each retailer enforces — so your audiobook passes review the first time and holds a listener for hours.",
    points: [
      { title: "Narrator casting", body: "Auditions matched to your genre, tone and characters — you approve the voice." },
      { title: "Studio production", body: "Directed recording, line-by-line editing and pickups for a seamless performance." },
      { title: "Mastering to spec", body: "Levels, noise floor and room tone mastered to ACX and retailer requirements." },
      { title: "Audio distribution", body: "Delivered to Audible, Apple Books, Spotify, Google Play and Chirp." },
    ],
    menu: [{ label: "Audio Book Production", anchor: "audiobook-production" }],
  },
  {
    id: "ebook-publishing",
    word: "E-Book",
    title: "E-Book Publishing",
    positioning: "Digital editions that read as well as they look.",
    body:
      "A good e-book is engineered, not exported. We convert your manuscript into clean, validated EPUB and Kindle files with true reflowable text, a linked table of contents, styled chapter openings and properly handled images — then prepare the metadata that decides whether readers ever find it: categories, keywords, descriptions and pricing tuned for each store.",
    points: [
      { title: "Digital formatting", body: "Validated EPUB 3 and Kindle files with reflowable, accessible typography." },
      { title: "Platform readiness", body: "Tested across Kindle, Apple Books, Kobo and Google Play readers." },
      { title: "Metadata & keywords", body: "Categories, keywords and descriptions written to be discovered." },
      { title: "Store setup", body: "Pricing, territories and publishing accounts configured with you." },
    ],
    menu: [{ label: "E-Book Publishing", anchor: "ebook-publishing" }],
  },
  {
    id: "publishing-services",
    word: "Publish",
    title: "Publishing Services",
    positioning: "The whole road from manuscript to marketplace — mapped.",
    body:
      "Independent publishing gives you control, but it also hands you a hundred decisions: ISBNs, imprint details, copyright pages, pricing, retailer accounts, print-on-demand set-up. Our publishing team walks you through each one, prepares every file and record correctly, and coordinates release across print, digital and audio so your book goes live everywhere at once — with you retaining your rights and your royalties.",
    points: [
      { title: "Publishing plan", body: "A clear timeline and format strategy built around your goals." },
      { title: "ISBN & copyright", body: "ISBN assignment, imprint details, copyright page and legal front matter." },
      { title: "Distribution readiness", body: "Retail and print-on-demand accounts set up and files approved." },
      { title: "Guided release", body: "One coordinated launch day across every store and format." },
    ],
    menu: [{ label: "Publishing Services", anchor: "publishing-services" }],
  },
  {
    id: "cover-design",
    word: "Cover",
    title: "Book Cover Design",
    positioning: "Judged by its cover — so we make it worth judging.",
    body:
      "Readers decide in under a second, usually from a thumbnail. We study the bestsellers in your genre, then design an original concept that signals the right promise at a glance and still stands apart. Every cover is delivered as a complete wrap — front, spine and back — with typography, barcode space and back-cover copy set precisely to your trim size and page count.",
    points: [
      { title: "Cover concept", body: "Original art direction built from your story, not a stock template." },
      { title: "Front, spine & back", body: "A full wrap set to exact spine width, bleed and barcode placement." },
      { title: "Genre positioning", body: "Visual cues readers of your genre recognise and trust instantly." },
      { title: "Thumbnail impact", body: "Tested small, so it earns the click on a crowded results page." },
    ],
    menu: [{ label: "Book Cover Design", anchor: "cover-design" }],
  },
  {
    id: "editing-proofreading",
    word: "Edit",
    title: "Editing & Proofreading",
    positioning: "Every line, considered. Your voice, untouched.",
    body:
      "Great editing is invisible: the reader simply never stumbles. Our editors work at every depth your manuscript needs — from structure, pacing and character arcs, through sentence-level clarity and flow, to a final proofread that catches the last stray comma. Every change is tracked and explained, so you stay in control of the book and learn from the process.",
    points: [
      { title: "Structure & flow", body: "Developmental notes on pacing, arc and chapter architecture." },
      { title: "Clarity & style", body: "Line and copy editing that tightens prose and keeps your voice." },
      { title: "Grammar & consistency", body: "Spelling, punctuation, names and timelines held consistent." },
      { title: "Final proofread", body: "A last, meticulous pass on the typeset pages before release." },
    ],
    menu: [{ label: "Editing & Proofreading", anchor: "editing-proofreading" }],
  },
  {
    id: "interior-format",
    word: "Format",
    title: "Book Interior & Paperback Formatting",
    positioning: "Pages that feel published, not printed.",
    body:
      "Interior design is what separates a professional book from a manuscript with a cover. We typeset every page with a considered typeface, balanced margins and gutters, chapter openings, running heads and scene breaks — no widows, no orphans, no rivers. Then we prepare the paperback to printer specification: trim size, bleed, page count, spine calculation and print-ready PDFs that pass KDP and IngramSpark checks first time.",
    points: [
      { title: "Layout & typesetting", body: "Typeface, leading, chapter styling and running heads designed for your genre." },
      { title: "Readability", body: "Widows, orphans and awkward breaks removed; a calm, even page colour." },
      { title: "Trim size & margins", body: "Trim, gutter and bleed set for 5×8, 5.5×8.5, 6×9 or custom sizes." },
      { title: "Print-ready files", body: "Press-quality PDFs validated for KDP Print and IngramSpark." },
    ],
    menu: [
      { label: "Book Interior Format", anchor: "interior-format" },
      { label: "Paperback Formatting", anchor: "paperback-formatting" },
    ],
  },
  {
    id: "marketing-promotion",
    word: "Launch",
    title: "Book Marketing & Promotion",
    positioning: "Published is the beginning. Discovered is the goal.",
    body:
      "Thousands of books are released every day; the ones that find readers are positioned deliberately. We define who your book is for and how it should be presented, then build the launch around it — retailer pages that convert, an author brand that travels, review and outreach campaigns, and targeted advertising — with promotion that continues well after release day.",
    points: [
      { title: "Positioning & visibility", body: "Audience, comparable titles and store pages built to convert." },
      { title: "Launch campaigns", body: "Pre-order, release-week and review campaigns, planned and run." },
      { title: "Audience reach", body: "Targeted ads, newsletters and social content where your readers are." },
      { title: "Post-launch promotion", body: "Ongoing price promotions, seasonal pushes and series momentum." },
    ],
    menu: [{ label: "Book Marketing & Promotion", anchor: "marketing-promotion" }],
  },
];

export const suiteCta = {
  label: "Start Your Publishing Journey",
  heading: ["Your book is", "ready to begin."],
  body:
    "Tell us about your manuscript. We'll reply within one business day with a clear plan, a timeline and the services your book actually needs — nothing more.",
  steps: ["Share your manuscript", "Receive your plan", "We publish together"],
};
