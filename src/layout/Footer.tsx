import { primaryNav, suiteNav } from "@/data/navigation";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Editorial footer with an oversized wordmark. `tone="blue"` renders white
 * ink for solid-blue pages (Publishing Suite); `tone="dark"` for black pages
 * (Portfolio).
 */
export function Footer({ tone = "light" }: { tone?: "light" | "blue" | "dark" }) {
  const year = new Date().getFullYear();
  // "blue" and "dark" share white ink; only the surface differs.
  const blue = tone !== "light";

  return (
    <footer
      data-stage="footer"
      className={cn("relative border-t pt-20", tone === "blue" ? "border-paper/15 bg-blue text-paper" : tone === "dark" ? "border-paper/10 bg-ink text-paper" : "border-line")}
    >
      <div className="container-site">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-serif text-3xl leading-tight">
              Stories beyond <em className={blue ? "text-paper" : "text-blue"}>the page.</em>
            </p>
            <a
              href={`mailto:${site.email}`}
              className={cn(
                "mt-6 inline-block underline underline-offset-4 transition-colors",
                blue ? "text-paper/80 decoration-paper/30 hover:text-paper" : "text-ink-soft decoration-line hover:text-blue",
              )}
            >
              {site.email}
            </a>
          </div>
          <FooterList blue={blue} title="Explore" items={primaryNav.map((n) => ({ label: n.label, href: n.href }))} />
          <FooterList blue={blue} title="Publishing Suite" items={suiteNav.slice(0, 6)} />
          <FooterList blue={blue} title="Available on" items={site.platforms.map((p) => ({ label: p }))} />
        </div>

        <p
          aria-hidden
          className="mt-24 select-none whitespace-nowrap text-center font-serif text-[clamp(3rem,13.2vw,15rem)] leading-[0.8] tracking-[-0.05em]"
        >
          Blue Book <em className={tone === "dark" ? "text-blue" : blue ? "text-paper" : "text-gradient-brand"}>Press</em>
        </p>

        <div
          className={cn(
            "mt-10 flex flex-col gap-3 border-t py-8 text-sm md:flex-row md:justify-between",
            blue ? "border-paper/15 text-paper/70" : "border-line text-ink-muted",
          )}
        >
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className={cn("transition-colors", blue ? "hover:text-paper" : "hover:text-ink")}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterList({
  title,
  items,
  blue,
}: {
  title: string;
  items: { label: string; href?: string }[];
  blue: boolean;
}) {
  return (
    <div>
      <p className={cn("eyebrow", blue ? "text-paper/60" : "text-ink-muted")}>{title}</p>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a
                href={item.href}
                className={cn("transition-colors duration-300", blue ? "hover:text-paper/70" : "hover:text-blue")}
              >
                {item.label}
              </a>
            ) : (
              <span className={blue ? "text-paper/75" : "text-ink-soft"}>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
