import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { comparison } from "@/data/home";

/**
 * (05) Why authors choose us — challenge vs. approach. The stage sits
 * *behind* the content here; the main book turns slowly beneath the
 * frosted panels.
 */
export function WhyChooseUs() {
  return (
    <section id="why" data-stage="why" className="relative py-section">
      <div className="container-site">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal className="flex justify-center">
            <SectionLabel index="06">
              Why Authors Choose Us
            </SectionLabel>
          </Reveal>
          <SplitHeading
            className="mt-8 text-headline"
            lines={["The usual way,", <em key="b">and the Blue Book way.</em>]}
          />
        </div>

        <div className="mt-20 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Challenges */}
          <Reveal className="rounded-[2rem] border border-line bg-paper/60 p-8 backdrop-blur-xl md:p-12">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-ink-muted">Common publishing challenges</p>
              <span className="font-serif text-5xl text-ink/15 italic">i.</span>
            </div>
            <ul className="mt-10 divide-y divide-line">
              {comparison.map((row, i) => (
                <li key={i} className="flex gap-5 py-6">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/40">
                    <CrossIcon />
                  </span>
                  <p className="text-[1.05rem] text-ink-muted">{row.challenge}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Approach */}
          <Reveal delay={0.12} className="gradient-border rounded-[2rem] bg-paper/80 p-8 backdrop-blur-xl md:p-12">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-blue">The Blue Book Press approach</p>
              <span className="text-gradient-brand font-serif text-5xl italic">ii.</span>
            </div>
            <ul className="mt-10 divide-y divide-line">
              {comparison.map((row, i) => (
                <li key={i} className="flex gap-5 py-6">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-deep to-blue text-paper">
                    <CheckIcon />
                  </span>
                  <p className="text-[1.05rem] text-ink">{row.approach}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
      <path d="m2.5 6.2 2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
      <path d="m3 3 6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
