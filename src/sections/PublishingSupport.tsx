import { DrawLine, Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { supportPillars } from "@/data/home";

/** (02) Complete publishing support — text left, main book drifts right. */
export function PublishingSupport() {
  return (
    <section id="about" data-stage="about" className="relative py-section">
      <div className="container-site">
        <div className="max-w-[44rem]">
          <Reveal>
            <SectionLabel index="02">Complete Publishing Support</SectionLabel>
          </Reveal>
          <SplitHeading
            className="mt-8 text-headline"
            lines={[
              "One studio for",
              <span key="pd">
                <em className="text-blue">print</em>, <em>digital</em>
              </span>,
              <span key="ap">
                &amp; <em>audio</em> publishing.
              </span>,
            ]}
          />
          <Reveal delay={0.2} className="mt-8 max-w-xl text-lead text-ink-soft">
            Every great story deserves to be published — beautifully. From the first read of your manuscript to
            the moment it lands on global shelves, our editors, designers, narrators and marketers work as one
            team around your book.
          </Reveal>

          <ul className="mt-16">
            {supportPillars.map((pillar, i) => (
              <li key={pillar.id}>
                <DrawLine delay={i * 0.1} />
                <Reveal delay={0.05 + i * 0.1} className="grid gap-2 py-7 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <span className="eyebrow pt-2 text-ink-muted">{pillar.kicker}</span>
                  <div>
                    <h3 className="text-title">{pillar.title}</h3>
                    <p className="mt-2 max-w-md text-ink-soft">{pillar.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
            <DrawLine delay={0.3} />
          </ul>
        </div>
      </div>
    </section>
  );
}
