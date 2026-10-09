import { suiteServices } from "./publishingSuite";

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/** Route of the Publishing Suite (services) page. */
export const SUITE_PATH = "/publishing-suite";

/** Every service in the suite, linked to its section on the suite page. */
export const suiteNav: NavChild[] = suiteServices.flatMap((s) =>
  s.menu.map((m) => ({ label: m.label, href: `${SUITE_PATH}#${m.anchor}` })),
);

/** Primary links shown in the header and the full-screen menu overlay. */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "The Press", href: "/about" },
  { label: "Publishing Suite", href: SUITE_PATH, children: suiteNav },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Begin Your Story", href: "/contact" },
];
