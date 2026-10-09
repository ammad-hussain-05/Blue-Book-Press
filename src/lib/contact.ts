/**
 * Contact form schema — shared by the form (client) and the API route
 * (server), so both validate exactly the same way.
 */

export const CONTACT_SERVICES = [
  "Publishing",
  "Editing & Proofreading",
  "Book Cover Design",
  "Formatting",
  "Audiobook Production",
  "Marketing & Promotion",
  "General Inquiry",
] as const;

export type ContactService = (typeof CONTACT_SERVICES)[number];

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  bookTitle: string;
  service: string;
  message: string;
};

export type ContactField = keyof ContactPayload;
export type ContactErrors = Partial<Record<ContactField, string>>;

const LIMITS: Record<ContactField, number> = {
  name: 120,
  email: 200,
  phone: 40,
  bookTitle: 200,
  service: 60,
  message: 5000,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-.\s\d]{6,40}$/;

/** Trims every field and coerces anything missing to "". */
export function normalizeContact(input: unknown): ContactPayload {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (k: ContactField) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    bookTitle: str("bookTitle"),
    service: str("service"),
    message: str("message"),
  };
}

/** Field-level errors; an empty object means the payload is valid. */
export function validateContact(d: ContactPayload): ContactErrors {
  const e: ContactErrors = {};
  if (!d.name) e.name = "Please tell us your name.";
  if (!d.email) e.email = "Please add your email address.";
  else if (!EMAIL.test(d.email)) e.email = "That email address doesn’t look quite right.";
  if (!d.phone) e.phone = "Please add a phone number.";
  else if (!PHONE.test(d.phone)) e.phone = "Please use digits, spaces and + ( ) - only.";
  if (!d.bookTitle) e.bookTitle = "Please add your book title (a working title is fine).";
  if (!d.service) e.service = "Please choose a service.";
  else if (!(CONTACT_SERVICES as readonly string[]).includes(d.service)) e.service = "Please choose a service from the list.";
  if (!d.message) e.message = "Please tell us a little about your book.";
  else if (d.message.length < 10) e.message = "A few more words would help us reply properly.";
  (Object.keys(LIMITS) as ContactField[]).forEach((k) => {
    if (!e[k] && d[k].length > LIMITS[k]) e[k] = `Please keep this under ${LIMITS[k]} characters.`;
  });
  return e;
}
