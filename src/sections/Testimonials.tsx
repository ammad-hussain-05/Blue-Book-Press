import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { testimonials } from "@/data/home";

/** (08) Author trust — a slow, hover-pausable marquee of frosted cards. */
export function Testimonials() {
  const loop = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" data-stage="testimonials" className="relative overflow-hidden py-section">
      <div className="container-site grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Reveal>
            <SectionLabel index="09">Author Stories</SectionLabel>
          </Reveal>
          <SplitHeading className="mt-8 text-headline" lines={["Trusted with", <em key="s">their stories.</em>]} />
        </div>
        <Reveal delay={0.15} className="grid grid-cols-3 gap-6 border-t border-line pt-6 lg:mb-3">
          {[
            ["3", "Formats, one team"],
            ["6+", "Global platforms"],
            ["100%", "Author-owned rights"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-4xl md:text-5xl">{value}</p>
              <p className="mt-2 text-xs leading-snug text-ink-muted">{label}</p>
            </div>
          ))}
        </Reveal>
      </div>

      <div className="group/marquee mt-20 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee-slow gap-6 pr-6 group-hover/marquee:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <li
              key={i}
              aria-hidden={i >= testimonials.length}
              className="flex w-[min(84vw,27rem)] shrink-0 flex-col justify-between rounded-[1.75rem] border border-line bg-paper/85 p-8 backdrop-blur-xl transition-[border-color,transform] duration-700 hover:-translate-y-1 hover:border-blue/30 md:p-10"
            >
              <div>
                <span aria-hidden className="text-gradient-brand font-serif text-6xl leading-none">
                  &ldquo;
                </span>
                <blockquote className="mt-2 font-serif text-[1.45rem] leading-snug">{t.quote}</blockquote>
              </div>
              <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-blue-deep to-blue font-serif text-lg text-paper">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-ink-muted">{t.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
