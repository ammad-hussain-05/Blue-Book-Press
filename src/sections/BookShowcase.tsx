"use client";

import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { stage } from "@/3d/stage";
import { books, MAIN_BOOK, type ShowcaseBook } from "@/data/books";
import { cn } from "@/lib/cn";

const chip: Record<ShowcaseBook["accent"], string> = {
  blue: "bg-blue-soft text-blue-deep",
  ink: "bg-ink text-paper",
  outline: "border border-ink/20 text-ink",
};

/**
 * (04) 3D collection. All five stage books lock onto the empty "slot"
 * elements below, so they sit exactly above their captions at any size.
 */
export function BookShowcase() {
  return (
    <section id="portfolio" data-stage="portfolio" className="relative py-section">
      <ShelfGlow />
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <SectionLabel index="05">The Collection</SectionLabel>
          </Reveal>
          <SplitHeading
            className="mt-8 text-headline"
            lines={["Books that found", <em key="r">their readers.</em>]}
          />
          <Reveal delay={0.15} className="mx-auto mt-6 max-w-xl text-lead text-ink-soft">
            A glimpse of the titles shaped in our studio — edited, designed, produced and launched with care.
          </Reveal>
        </div>

        <ul className="mt-20 grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0">
          {books.map((book, i) => (
            <li
              key={book.id}
              className={cn(
                "flex flex-col lg:border-l lg:border-line lg:px-6 lg:first:border-l-0",
                i === MAIN_BOOK && "lg:-mt-8",
                i === books.length - 1 && "col-span-2 mx-auto max-w-[16rem] sm:col-span-1 sm:max-w-none lg:mx-0",
              )}
            >
              {/* Empty anchor the 3D book docks to */}
              <div
                ref={(el) => {
                  stage.slots[i] = el;
                }}
                aria-hidden
                className={cn("relative w-full", i === MAIN_BOOK ? "h-[30vh] lg:h-[33vh]" : "h-[24vh] lg:h-[26vh]")}
              >
                <span className="absolute inset-x-[18%] bottom-0 h-3 rounded-[50%] bg-ink/10 blur-md" />
              </div>

              <Reveal delay={0.1 + i * 0.08} className="mt-8 text-center lg:text-left">
                <span className={cn("eyebrow inline-block rounded-full px-3 py-1.5 text-[0.62rem]", chip[book.accent])}>
                  {book.label}
                </span>
                <h3 className="mt-5 text-[1.45rem] leading-tight">{book.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {book.author} · {book.genre}
                </p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{book.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShelfGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[48%] h-[36rem] w-[80rem] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-blue/[0.07] via-paper to-blue-light/[0.08] blur-3xl" />
    </div>
  );
}
