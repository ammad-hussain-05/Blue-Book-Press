import { ArrowIcon } from "@/components/ui/Button";
import { DrawLine, Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { services } from "@/data/services";

/**
 * (03) Services — an editorial index. The main book holds the left of the
 * frame while the list scrolls on the right; rows open on hover.
 */
export function Services() {
  return (
    <section id="services" data-stage="services" className="relative py-section">
      <div className="container-site">
        <div className="lg:ml-[40%]">
          <Reveal>
            <SectionLabel index="04">
              Services
            </SectionLabel>
          </Reveal>
          <SplitHeading className="mt-8 text-headline" lines={["Eight crafts.", <em key="o">One publishing house.</em>]} />
          <Reveal delay={0.15} className="mt-6 max-w-lg text-lead text-ink-soft">
            Choose a single service or let us carry your book from manuscript to marketplace.
          </Reveal>

          <ol className="mt-16">
            {services.map((service, i) => (
              <li key={service.id}>
                <DrawLine delay={i * 0.04} />
                <Reveal delay={i * 0.04} y={24}>
                  <a
                    href="#contact"
                    className="group grid grid-cols-[3rem_1fr_auto] items-start gap-x-4 py-7 md:grid-cols-[4rem_1fr_auto]"
                  >
                    <span className="pt-2 font-sans text-sm tabular-nums text-ink-muted transition-colors duration-500 group-hover:text-blue">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[clamp(1.6rem,2.8vw,2.6rem)] leading-tight transition-transform duration-700 ease-out-expo group-hover:translate-x-2">
                        {service.title}
                      </h3>
                      {/* Expands on hover (desktop); always open on touch */}
                      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-out-expo lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] lg:group-focus-visible:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <p className="max-w-md pt-3 text-ink-soft">{service.summary}</p>
                          <p className="flex flex-wrap gap-2 pt-4">
                            {service.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
                                {tag}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 grid size-10 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-blue-deep group-hover:to-blue group-hover:text-paper">
                      <ArrowIcon className="size-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
            <DrawLine />
          </ol>
        </div>
      </div>
    </section>
  );
}
