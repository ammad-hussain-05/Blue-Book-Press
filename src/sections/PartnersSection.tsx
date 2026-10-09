import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { partnerRows, partnerScale, partnersCopy, type Partner } from "@/data/partners";
import { cn } from "@/lib/cn";

/**
 * Partners in Publishing — the retailers and platforms network. Two rows of
 * logo cards glide in opposite directions (paused on hover), shown in a calm
 * monochrome so every brand sits in the site's black / white / blue palette.
 * Own white surface: the 3D stage steps behind it (see `partners` keyframe).
 */
export function PartnersSection() {
  const c = partnersCopy;
  return (
    <section
      data-stage="partners"
      aria-labelledby="partners-title"
      className="relative overflow-hidden bg-paper py-[clamp(5rem,11vw,9rem)]"
    >
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-ink-soft">
                <span aria-hidden className="size-1.5 rounded-full bg-blue" />
                <span aria-hidden className="h-px w-8 bg-ink/25" />
                {c.label}
              </p>
            </Reveal>
            <SplitHeading
              className="mt-7 font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.98] tracking-[-0.035em]"
              lines={c.heading.map((line, i) => (i === 1 ? <em key={i} className="text-gradient-ink-blue">{line}</em> : line))}
            />
            <h2 id="partners-title" className="sr-only">
              {c.label}: {c.heading.join(" ")}
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-md text-[1.02rem] leading-relaxed text-ink-soft">{c.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {c.channels.map((ch) => (
                <li key={ch} className="rounded-full border border-line px-3.5 py-1.5 text-[0.76rem] text-ink-soft">
                  {ch}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Logo marquee: edges fade into the page */}
      <Reveal delay={0.2} y={30} className="relative mt-14 md:mt-20">
        <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)] md:space-y-5">
          {partnerRows.map((row, r) => (
            <Row key={r} partners={row} reverse={r % 2 === 1} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Row({ partners, reverse }: { partners: Partner[]; reverse?: boolean }) {
  // Enough copies that one half always spans the widest screens; the track
  // moves by exactly one half for a seamless loop.
  const half = [...partners, ...partners, ...partners];
  return (
    <div className="group/row overflow-hidden">
      <ul
        className={cn(
          "flex w-max animate-marquee-slow group-hover/row:[animation-play-state:paused] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {[0, 1].map((copy) =>
          half.map((p, i) => (
            <li key={`${copy}-${i}`} aria-hidden={copy === 1 || i >= partners.length} className="pr-4 md:pr-5">
              <PartnerCard partner={p} />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

function PartnerCard({ partner: p }: { partner: Partner }) {
  const s = partnerScale(p);
  const px = (n: number) => `calc(${(n * s).toFixed(2)}px * var(--u))`;
  return (
    <div
      className="group/card relative grid h-28 w-52 place-items-center overflow-hidden rounded-[1.4rem] border border-line bg-paper transition-[border-color,box-shadow,transform] duration-500 ease-out-expo [--u:0.78] hover:-translate-y-1 hover:border-blue/35 hover:shadow-[0_24px_60px_-30px_rgba(31,79,224,0.45)] sm:[--u:0.9] md:h-36 md:w-72 md:[--u:1]"
      title={p.name}
    >
      {/* soft blue wash on hover */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(31,79,224,0.08),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />
      {/* Artwork crop, never stretched: the file is positioned inside a box the size of its artwork. */}
      <span className="relative block overflow-hidden" style={{ width: px(p.box.w), height: px(p.box.h) }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt={p.name}
          width={p.file.w}
          height={p.file.h}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute max-w-none select-none opacity-70 transition-[opacity,filter] duration-500 [filter:grayscale(1)_contrast(1.08)] group-hover/card:opacity-100 group-hover/card:[filter:grayscale(1)_contrast(1.2)]"
          style={{ width: px(p.file.w), height: px(p.file.h), left: px(-p.box.x), top: px(-p.box.y) }}
        />
      </span>
      <span className="absolute bottom-3 left-1/2 h-px w-0 -translate-x-1/2 bg-blue transition-[width] duration-500 ease-out-expo group-hover/card:w-10" />
    </div>
  );
}
