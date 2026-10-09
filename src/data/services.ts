export type Service = { id: string; title: string; summary: string; tags: string[] };

export const services: Service[] = [
  {
    id: "audiobook",
    title: "Audio Book Production",
    summary:
      "Expert narration, studio-quality recording, precise editing and mastering — ready for every major audio platform.",
    tags: ["Narration", "Mastering", "Distribution"],
  },
  {
    id: "ebook",
    title: "E-Book Publishing",
    summary:
      "Professionally formatted digital editions with clean, reflowable layouts that read beautifully on every device.",
    tags: ["EPUB", "Kindle", "Apple Books"],
  },
  {
    id: "publishing",
    title: "Publishing Services",
    summary:
      "ISBNs, metadata, pricing and global distribution handled end to end, so your book reaches readers everywhere.",
    tags: ["ISBN", "Metadata", "Global Reach"],
  },
  {
    id: "cover",
    title: "Book Cover Design",
    summary: "Genre-aware, shelf-stopping covers designed to earn the click online and the second look in store.",
    tags: ["Front Cover", "Spine", "Back Copy"],
  },
  {
    id: "editing",
    title: "Editing & Proofreading",
    summary: "Refine your manuscript, correct errors and improve clarity while keeping your voice unmistakably yours.",
    tags: ["Developmental", "Copyediting", "Proofreading"],
  },
  {
    id: "interior",
    title: "Book Interior Format",
    summary: "Expert typesetting from margins to chapter styling — interiors that feel considered on every page.",
    tags: ["Typesetting", "Chapter Design", "Print-Ready"],
  },
  {
    id: "paperback",
    title: "Paperback Formatting",
    summary: "Trim sizes, bleed, gutters and spine width prepared to printer specification for flawless paperbacks.",
    tags: ["Trim Size", "Bleed", "Print Files"],
  },
  {
    id: "marketing",
    title: "Book Marketing & Promotion",
    summary: "Launch plans, author branding and targeted campaigns that help the right readers discover your book.",
    tags: ["Launch", "Author Brand", "Campaigns"],
  },
];
