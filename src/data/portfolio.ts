/**
 * Content + assets for the Portfolio page (`/portfolio`). Everything lives
 * in `public/portfolio/`. Covers are served from `books-web/` (600×900 JPEG
 * copies of `books/`, renamed); two originals with green artwork
 * (A Christmas Dare, A Baptism Book for Girls) are intentionally left out.
 */

const P = "/portfolio";

export const portfolioAssets = {
  heroImage: `${P}/hero-background.png`,
  secondImage: `${P}/2nd%20hero%20portfolio.jpg`,
  mockup: `${P}/portfolio-mockup-3books.webp`,
  /** Video 2 (56 s, 1440×2558) — the intro, played inside The Press ring. */
  introVideo: `${P}/portfolio-videos/portfolio-video-2-web.mp4`,
  /** Video 1 (5.3 s loop, 1080×1920) — the cinematic film section. */
  filmVideo: `${P}/portfolio-videos/portfolio-video-1-web.mp4`,
} as const;

/**
 * Video 2 carries letterbox bars inside its portrait frame. The intro panel
 * crops to the picture (fractions of frame height, measured from the top).
 */
export const INTRO_VIDEO_CROP = { top: 0.17, bottom: 0.85 } as const;

export type PortfolioBook = {
  slug: string;
  title: string;
  author: string;
  /** Series / genre line as printed on the cover. */
  line: string;
  description: string;
  /** Store page for the "View on Amazon" button. Placeholder "#" until the real links are in. */
  amazonUrl?: string;
};

export const coverUrl = (slug: string) => `${P}/books-web/${slug}.jpg`;

/** Every featured title. The All Books collection orders them in `collectionBooks`. */
export const portfolioBooks: PortfolioBook[] = [
  {
    slug: "a-tempting-arrangement",
    title: "A Tempting Arrangement",
    author: "J. Wilder",
    line: "USA Today bestselling author",
    description: "Gilded serif type over black florals and a black card — luxury signalled before a word is read.",
  },
  {
    slug: "mind-to-bend",
    title: "Mind to Bend",
    author: "Aurelia Knight",
    line: "Stolen Obsessions · Book One",
    description: "Condensed white caps on a deep-blue collage of rope and feathers — tension, held in place.",
  },
  {
    slug: "his-darkest-craving",
    title: "His Darkest Craving",
    author: "Tiffany Roberts",
    line: "The Cursed Ones · Book One",
    description: "Painted fantasy romance under moonlight, with an ornate initial cap that reads at any size.",
  },
  {
    slug: "stolen",
    title: "Stolen",
    author: "J.M. Johnson",
    line: "A Devil's Disciples Novel",
    description: "Blood-red accents, a cracked skull and fine-line webbing — a motorcycle-club thriller at a glance.",
  },
  {
    slug: "little-bird",
    title: "Little Bird",
    author: "Ria Wilde",
    line: "Twisted City Duet · Book One",
    description: "Distressed red display type cut with a delicate script — rough and tender on one cover.",
  },
  {
    slug: "catalyst",
    title: "Catalyst",
    author: "Nicole Fanning",
    line: "Heart of the Inferno Series",
    description: "A torn-paper skyline and a vertical red title that turns the spine-side into a statement.",
  },
  {
    slug: "wicked-heart",
    title: "Wicked Heart",
    author: "Ria Wilde",
    line: "A Wreck & Ruin Novel",
    description: "Monochrome portrait with gold-rule typography and crown ornaments — restrained, expensive.",
  },
  {
    slug: "sabotage",
    title: "Sabotage",
    author: "Shantel Tessier",
    line: "USA Today & WSJ bestselling author",
    description: "Shattered glass, a single red wash and a hand-drawn signature title for a bestselling author.",
  },
  {
    slug: "ruining-him",
    title: "Ruining Him",
    author: "S. Wilson",
    line: "A Dark College Romance",
    description: "Cathedral tracery and red roses framing heavy white caps — campus gothic, instantly legible.",
  },
  {
    slug: "chaotic",
    title: "Chaotic",
    author: "Shantel Tessier",
    line: "A Dark Romance",
    description: "Blackletter title shattering into the portrait beneath — the series look, built to repeat.",
  },
  {
    slug: "graves",
    title: "Graves",
    author: "Katelyn Taylor",
    line: "Cover design",
    description: "Wrought-iron gates in silver monochrome with an engraved, weathered title treatment.",
  },
  {
    slug: "little-dove",
    title: "Little Dove",
    author: "Layla Frost",
    line: "USA Today bestselling author",
    description: "Black-and-white portrait with a soft blush script — sharp tailoring, quiet edge.",
  },
  {
    slug: "priest",
    title: "Priest",
    author: "Cathleen Cole & Frank Jensen",
    line: "Cover design",
    description: "Bold slab caps across a tattooed figure, with the club emblem carried into the design.",
  },
  {
    slug: "make-me",
    title: "Make Me",
    author: "Summer O'Toole",
    line: "The Fox Family Crime Syndicate",
    description: "Engraved hands and a gold script crossing a thin roman title — crime family, done elegantly.",
  },
  {
    slug: "f-ck-you",
    title: "F*ck You",
    author: "Crystal North & Jaye Pratt",
    line: "Knox Academy · Term One",
    description: "Mascara tears and gold-flecked condensed type — an academy romance with attitude.",
  },
  {
    slug: "touching-oblivion",
    title: "Touching Oblivion",
    author: "Albany Walker",
    line: "Tasting Madness · Book Two",
    description: "Silver filigree, a hanging key and spaced roman caps — a matched pair with Seeing Sound.",
  },
  {
    slug: "seeing-sound",
    title: "Seeing Sound",
    author: "Albany Walker",
    line: "Tasting Madness · Book One",
    description: "The series opener: the same grid and ornament, so the two read as one collection.",
  },
  {
    slug: "the-rage-of-angels",
    title: "The Rage of Angels",
    author: "Elizabeth N. Harris",
    line: "Rage MC · Book Ten",
    description: "Electric-blue storm sky and a classic MC figure — ten books in, still unmistakably the series.",
  },
  {
    slug: "the-insanity-criterion",
    title: "The Insanity Criterion",
    author: "Raymond Finkle",
    line: "Cover design",
    description: "Rifle-scope framing and stacked white caps — a suspense cover that explains itself in a thumbnail.",
  },
  {
    slug: "life-after-phantom",
    title: "Life After Phantom",
    author: "Samantha",
    line: "A Gothic Romance",
    description: "Painted candlelit romance inside an ornamental frame, with a red serif title.",
  },
  {
    slug: "emotional-intelligence-for-anxiety",
    title: "Emotional Intelligence for Anxiety",
    author: "Somer Zappe",
    line: "Non-fiction",
    description: "Clean coral type, a single lotus and generous white space — calm, clear non-fiction.",
  },
  {
    slug: "playing-with-fire",
    title: "Playing with Fire",
    author: "Ria Wilde",
    line: "Cover design",
    description: "Smoke, embers and a scorched script title fading into black.",
  },
];

export type ShelfLabel = "Featured Title" | "Best Seller" | "Upcoming Release" | "Editor's Choice" | "Reader Favorite";

/**
 * All Books — the WebGL collection. Every featured title, in the order the
 * scroll brings them forward, each with its shelf label.
 * NOTE: "Best Seller" / "Upcoming Release" labels are editorial placeholders —
 * confirm them against each title's real status before launch.
 */
export const collectionBooks: { slug: string; label: ShelfLabel }[] = [
  { slug: "sabotage", label: "Best Seller" },
  { slug: "little-bird", label: "Featured Title" },
  { slug: "seeing-sound", label: "Upcoming Release" },
  { slug: "mind-to-bend", label: "Editor's Choice" },
  { slug: "little-dove", label: "Reader Favorite" },
  { slug: "chaotic", label: "Best Seller" },
  { slug: "catalyst", label: "Featured Title" },
  { slug: "touching-oblivion", label: "Upcoming Release" },
  { slug: "ruining-him", label: "Editor's Choice" },
  { slug: "graves", label: "Reader Favorite" },
  { slug: "a-tempting-arrangement", label: "Best Seller" },
  { slug: "stolen", label: "Featured Title" },
  { slug: "the-rage-of-angels", label: "Upcoming Release" },
  { slug: "wicked-heart", label: "Editor's Choice" },
  { slug: "his-darkest-craving", label: "Reader Favorite" },
  { slug: "make-me", label: "Best Seller" },
  { slug: "the-insanity-criterion", label: "Featured Title" },
  { slug: "life-after-phantom", label: "Upcoming Release" },
  { slug: "playing-with-fire", label: "Editor's Choice" },
  { slug: "priest", label: "Reader Favorite" },
  { slug: "f-ck-you", label: "Featured Title" },
  { slug: "emotional-intelligence-for-anxiety", label: "Upcoming Release" },
];

export type WaveLabel = "Best Seller" | "Upcoming" | "Featured" | "Editor's Choice" | "Reader Favorite";

export type ShowcaseWave = {
  id: string;
  label: string;
  heading: string;
  subtitle: string;
  description: string;
  books: { slug: string; label: WaveLabel }[];
};

/**
 * The four wave sliders of the WebGL collection, five books each.
 * NOTE: "Best Seller" / "Upcoming" groupings are editorial placeholders —
 * confirm them against each title's real status before launch.
 */
export const showcaseWaves: ShowcaseWave[] = [
  {
    id: "best-sellers",
    label: "Best Sellers",
    heading: "Presenting Our Best-Selling Books",
    subtitle: "Covers that earned their place on the charts.",
    description:
      "Titles from USA Today, Wall Street Journal and New York Times bestselling authors — each built to stop the scroll and hold the shelf.",
    books: [
      { slug: "sabotage", label: "Best Seller" },
      { slug: "chaotic", label: "Best Seller" },
      { slug: "a-tempting-arrangement", label: "Best Seller" },
      { slug: "little-dove", label: "Reader Favorite" },
      { slug: "mind-to-bend", label: "Editor's Choice" },
    ],
  },
  {
    id: "upcoming",
    label: "Upcoming",
    heading: "Presenting Our Upcoming Releases",
    subtitle: "Next on the shelf — finished, formatted and ready to launch.",
    description:
      "From a two-book series to gothic romance and clear-eyed non-fiction — launch visuals ready ahead of release day.",
    books: [
      { slug: "seeing-sound", label: "Upcoming" },
      { slug: "touching-oblivion", label: "Upcoming" },
      { slug: "the-rage-of-angels", label: "Upcoming" },
      { slug: "life-after-phantom", label: "Upcoming" },
      { slug: "emotional-intelligence-for-anxiety", label: "Upcoming" },
    ],
  },
  {
    id: "featured",
    label: "Featured",
    heading: "Explore Our Featured Titles",
    subtitle: "The covers we point to when authors ask what's possible.",
    description:
      "Distressed display type, cathedral tracery, wrought iron and blood-red accents — five very different promises, each made at a glance.",
    books: [
      { slug: "little-bird", label: "Featured" },
      { slug: "catalyst", label: "Featured" },
      { slug: "ruining-him", label: "Editor's Choice" },
      { slug: "stolen", label: "Featured" },
      { slug: "graves", label: "Reader Favorite" },
    ],
  },
  {
    id: "complete-shelf",
    label: "Complete Shelf",
    heading: "The Complete Blue Book Press Shelf",
    subtitle: "Romance, fantasy, suspense — one standard across every genre.",
    description:
      "Painted fantasy, monochrome portraiture, club romance and suspense: the range of the press, finished with the same care.",
    books: [
      { slug: "his-darkest-craving", label: "Reader Favorite" },
      { slug: "wicked-heart", label: "Editor's Choice" },
      { slug: "the-insanity-criterion", label: "Featured" },
      { slug: "priest", label: "Reader Favorite" },
      { slug: "playing-with-fire", label: "Editor's Choice" },
    ],
  },
];

export const bookBySlug = (slug: string) => {
  const b = portfolioBooks.find((x) => x.slug === slug);
  if (!b) throw new Error(`Unknown portfolio book: ${slug}`);
  return b;
};

export const portfolioCopy = {
  /** Bottom-right note on the white intro, beside the film. */
  introNote: {
    label: "About the Press",
    lead: "Blue Book Press turns manuscripts into professionally published books — in print, eBook and audio.",
    body: "Editing and proofreading, cover design and interior formatting, publishing, audiobook production, marketing and promotion: every stage is handled with care and clarity. What sets us apart is a wholly author-focused approach, where creative quality, professional presentation and long-term visibility work as one. We don’t simply prepare books for release — we shape them for readers, for platforms and for their place in the market. Every story receives the structure, polish and publishing support it deserves. Scroll on to explore a selection of the books we’ve helped bring to life.",
  },
  hero: {
    eyebrow: "Selected Work",
    intro:
      "Covers, interiors, audio and launch visuals for independent authors — every title finished to a single standard.",
  },
  marqueeA: [
    "Featured Books",
    "Cover Design",
    "Author Stories",
    "Editorial Work",
    "Publishing Visuals",
    "Audiobooks",
    "Book Launches",
    "Blue Book Press",
  ],
  marqueeB: ["Seen", "Read", "Remembered", "Print", "Digital", "Audio", "Blue Book Press"],
  film: {
    label: "In Motion",
    heading: ["Every book", "has a world."],
    body: "We build it in type, image and sound — then carry it across every format the book will live in.",
  },
  statement: {
    label: "The Work",
    heading: ["Publishing work", "designed to be seen,", "read and remembered."],
    body: "Blue Book Press turns an author's project into a finished, recognisable book: cover identity, print and digital presentation, audiobook artwork and launch visuals — all held to one standard and backed by full publishing support.",
    pillars: ["Cover identity", "Print & digital", "Audiobook artwork", "Launch visuals", "Publishing support"],
  },
  sliders: {
    label: "The Collection",
  },
  showcase: {
    label: "All Books",
    heading: "The complete collection",
    intro: "Every title, one standard. Scroll to bring each book forward.",
  },
  journey: {
    label: "From Cover to Reader",
    heading: ["From first sketch", "to the reader's hands."],
    steps: [
      { title: "Design", body: "Concept, typography and the full wrap — set on a grid to exact trim and bleed." },
      { title: "Produce", body: "Print-ready files, e-book and audiobook artwork, every format checked." },
      { title: "Publish", body: "Live on every major store, presented the way readers will meet it." },
    ],
  },
  mockup: {
    label: "Visual Systems",
    heading: ["Not a file.", "A finished book."],
    body: "Authors don't need isolated assets — they need a book that looks the same on a shelf, a store page and a phone screen. We design the system: cover identity, spine and back, series continuity and the reader-facing presentation around it.",
    points: [
      { title: "Cover identity", body: "A look that belongs to this book and scales across a series." },
      { title: "Publishing polish", body: "Print-ready wraps, spines and barcodes set to exact spec." },
      { title: "Reader-facing", body: "Mockups, store art and launch visuals that sell the book." },
    ],
  },
  cta: {
    label: "Your Book Next",
    heading: ["Turn your manuscript", "into a book worth showing."],
    body: "Tell us where your manuscript is today. We'll come back with a plan for the cover, the formats and the launch.",
  },
};
