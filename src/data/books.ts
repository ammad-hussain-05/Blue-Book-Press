import type { ModelId } from "./models";

export type ShowcaseBook = {
  id: string;
  model: ModelId;
  title: string;
  author: string;
  genre: string;
  description: string;
  label: "Best Selling" | "Editor's Choice" | "Upcoming Release" | "Featured Title" | "Reader Favorite";
  accent: "blue" | "ink" | "outline";
};

/**
 * The five books in the 3D collection, ordered left → right in the showcase.
 * Each uses a unique GLB with its real cover. Index MAIN_BOOK is the large
 * centre/hero book (book_model — the only model with front + back covers);
 * the rest are the four satellites.
 */
export const books: ShowcaseBook[] = [
  {
    id: "darkest-craving",
    model: "darkestCraving",
    title: "His Darkest Craving",
    author: "Tiffany Roberts",
    genre: "Fantasy Romance",
    description: "Book one of The Cursed Ones — a moonlit fantasy romance of curses and longing.",
    label: "Best Selling",
    accent: "ink",
  },
  {
    id: "little-bird",
    model: "littleBird",
    title: "Little Bird",
    author: "Ria Wilde",
    genre: "Dark Romance",
    description: "Book one of the Twisted City Duet — a dark, gripping romance.",
    label: "Editor's Choice",
    accent: "outline",
  },
  {
    id: "mind-to-bend",
    model: "mindToBend",
    title: "Mind to Bend",
    author: "Aurelia Knight",
    genre: "Dark Romance",
    description: "Book one of Stolen Obsessions — how far can he bend her before she breaks?",
    label: "Featured Title",
    accent: "blue",
  },
  {
    id: "kingpins-baby",
    model: "kingpinsBaby",
    title: "Kingpin's Baby",
    author: "Evie Rose",
    genre: "Mafia Romance",
    description: "A sweet and spicy mafia romance novella.",
    label: "Upcoming Release",
    accent: "outline",
  },
  {
    id: "loser-luna",
    model: "loserLuna",
    title: "Loser Luna",
    author: "S. F. Heart",
    genre: "Paranormal Romance",
    description: "A shifter romance wrapped in botanical, storybook cover art.",
    label: "Reader Favorite",
    accent: "blue",
  },
];

/** Index of the large centre book (book_model) in `books`. */
export const MAIN_BOOK = 2;
/** Satellites in hero order: top-left, top-right, bottom-left, bottom-right. */
export const SATELLITE_BOOKS = [0, 1, 3, 4] as const;
