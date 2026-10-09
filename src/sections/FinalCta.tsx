import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { site } from "@/data/site";

const headline = "mx-auto max-w-5xl font-serif text-[clamp(2.6rem,6vw,6.25rem)] leading-[0.95] tracking-[-0.035em]";

/**
 * (10) Final call to action. The main book docks into the gap between the
 * two halves of the headline (`data-stage-anchor`), with the four
 * satellites around it — a mirror of the opening shot.
 */
export function FinalCta() {
  return (
    <section
      id="contact"
      data-stage="contact"
      className="relative flex min-h-[760px] flex-col overflow-hidden py-16 h-svh md:py-20"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue/[0.09] to-blue-light/[0.08] blur-[120px]" />
      </div>

      <div className="container-site flex flex-1 flex-col text-center">
        <SplitHeading className={headline} lines={["Your story deserves", <em key="s">to be seen,</em>]} />

        {/* The main book docks here */}
        <div data-stage-anchor="contact" aria-hidden className="mx-auto my-6 min-h-[12rem] w-full max-w-md flex-1" />

        <SplitHeading
          className={headline}
          lines={[
            <span key="rh">
              <em>read,</em> and <span className="text-gradient-brand italic">heard.</span>
            </span>,
          ]}
        />
        <Reveal delay={0.2} className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={`mailto:${site.email}`}>Start Publishing</Button>
          <Button href="#services" variant="light">
            Explore Services
          </Button>
        </Reveal>
        <Reveal delay={0.3} className="mt-6">
          <a href={`mailto:${site.email}`} className="eyebrow text-ink-soft transition-colors duration-500 hover:text-blue">
            {site.email}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
