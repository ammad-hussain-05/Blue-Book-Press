"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DrawLine, Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { contactCopy, contactDetails, mapEmbedUrl, mapLinkUrl } from "@/data/contact";
import { site } from "@/data/site";
import { useUI } from "@/lib/uiStore";
import { ContactForm } from "./ContactForm";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Small "(00) — Label" eyebrow used across the page. */
function Label({ n, children }: { n: string; children: string }) {
  return (
    <p className="eyebrow flex items-center gap-3 text-[0.68rem] text-ink-soft">
      <span className="tabular-nums text-blue">({n})</span>
      <span aria-hidden className="h-px w-8 bg-blue/60" />
      {children}
    </p>
  );
}

/** 00 — Hero: heading, invitation, topics. Plays after the preloader. */
export function ContactHero() {
  const loaded = useUI((s) => s.loaded);
  const c = contactCopy.hero;
  return (
    <section aria-labelledby="contact-title" className="relative overflow-hidden bg-paper pb-[clamp(3.5rem,8vw,6rem)] pt-[calc(var(--spacing-header)+clamp(3rem,9vw,7rem))]">
      {/* One quiet blue hairline, drawn across the hero */}
      <motion.span
        aria-hidden
        className="absolute left-0 top-[calc(var(--spacing-header)+1.5rem)] block h-px w-full origin-left bg-gradient-to-r from-blue/0 via-blue/40 to-blue/0"
        initial={{ scaleX: 0 }}
        animate={loaded ? { scaleX: 1 } : {}}
        transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
      />
      <div className="container-site">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={loaded ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE }}>
          <Label n="00">{c.label}</Label>
        </motion.div>
        <SplitHeading
          as="h1"
          play={loaded}
          delay={0.15}
          lines={c.heading.map((line, i) => (i === 1 ? <em key={i} className="text-gradient-ink-blue">{line}</em> : line))}
          className="mt-7 max-w-5xl font-serif text-[clamp(2.6rem,6.4vw,6.4rem)] leading-[0.98] tracking-[-0.04em]"
        />
        <span id="contact-title" className="sr-only">
          {c.heading.join(" ")}
        </span>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-16">
          <motion.p
            className="max-w-2xl text-lead text-ink-soft"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
          >
            {c.body}
          </motion.p>
          <motion.div
            className="flex flex-col gap-5 md:items-end"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
          >
            <ul className="flex flex-wrap gap-2 md:justify-end">
              {c.topics.map((t) => (
                <li key={t} className="rounded-full border border-line px-3.5 py-1.5 text-[0.78rem] text-ink-soft">
                  {t}
                </li>
              ))}
            </ul>
            <a
              href="#enquiry"
              className="eyebrow group inline-flex items-center gap-3 text-[0.68rem] text-ink transition-colors hover:text-blue"
            >
              Start the conversation
              <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-line">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-blue" />
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** 01 — The form, with a short "what happens next" beside it. */
export function ContactFormSection() {
  const c = contactCopy.form;
  return (
    <section id="enquiry" aria-labelledby="enquiry-title" className="relative scroll-mt-24 bg-ivory py-[clamp(4.5rem,10vw,8rem)]">
      <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
          <Label n="01">{c.label}</Label>
          <SplitHeading
            lines={c.heading.map((line, i) => (i === 1 ? <em key={i}>{line}</em> : line))}
            className="mt-6 font-serif text-[clamp(2.2rem,4vw,3.8rem)] leading-[1] tracking-[-0.035em]"
          />
          <span id="enquiry-title" className="sr-only">
            {c.heading.join(" ")}
          </span>
          <Reveal>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">{c.body}</p>
          </Reveal>
          <ol className="mt-10 max-w-md border-t border-line">
            {c.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.08 * i} y={20} className="flex gap-5 border-b border-line py-4">
                <span className="pt-1 text-xs tabular-nums text-blue">0{i + 1}</span>
                <span>
                  <span className="block font-serif text-[1.3rem] leading-tight">{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{s.body}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal y={40}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

const icons: Record<(typeof contactDetails)[number]["id"], ReactNode> = {
  email: <path d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6.5L20.5 7" />,
  location: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  support: <path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h10.5M9 8.5h6" />,
  response: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

/** 02 — Email, location, support, response time. */
export function ContactDetails() {
  return (
    <section aria-labelledby="details-title" className="bg-paper py-[clamp(4.5rem,9vw,7rem)]">
      <div className="container-site">
        <Label n="02">{contactCopy.details.label}</Label>
        <h2 id="details-title" className="sr-only">
          {contactCopy.details.label}
        </h2>
        <DrawLine className="mt-8" />
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((d, i) => (
            <Reveal
              as="li"
              key={d.id}
              delay={0.08 * i}
              y={24}
              className="group border-b border-line py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:px-6 lg:py-10 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <span className="grid size-11 place-items-center rounded-full border border-line text-blue transition-colors duration-500 group-hover:border-blue group-hover:bg-blue group-hover:text-paper">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {icons[d.id]}
                </svg>
              </span>
              <p className="eyebrow mt-6 text-[0.62rem] text-ink-muted">{d.label}</p>
              {"href" in d ? (
                <a href={d.href} className="mt-2 block break-words font-serif text-[1.4rem] leading-tight transition-colors hover:text-blue">
                  {d.title}
                </a>
              ) : (
                <p className="mt-2 font-serif text-[1.4rem] leading-tight">{d.title}</p>
              )}
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{d.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 03 — Map: monochrome, blue-tinted, compact, with a floating card. */
export function ContactMap() {
  const c = contactCopy.map;
  return (
    <section aria-labelledby="map-title" className="bg-paper pb-[clamp(4.5rem,9vw,7rem)]">
      <div className="container-site">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Label n="03">{c.label}</Label>
            <h2 id="map-title" className="mt-5 font-serif text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.05] tracking-[-0.03em]">
              {c.heading}
            </h2>
          </div>
          <a
            href={mapLinkUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow inline-flex items-center gap-3 text-[0.66rem] text-ink-soft transition-colors hover:text-blue"
          >
            Open in Google Maps <span aria-hidden className="h-px w-8 bg-current" />
          </a>
        </div>
        <Reveal y={40} className="relative mt-8 overflow-hidden rounded-[1.6rem] border border-line bg-mist">
          <div className="relative h-[clamp(16rem,38vw,26rem)]">
            <iframe
              title="Blue Book Press on the map"
              src={mapEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 [filter:grayscale(1)_contrast(1.05)_brightness(1.04)]"
            />
            {/* Brand tint over the monochrome map */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-blue/15 mix-blend-color" />
            <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(255,255,255,0.6)]" />
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:right-auto">
            <div className="pointer-events-auto max-w-xs rounded-2xl border border-line bg-paper/90 p-5 backdrop-blur">
              <p className="eyebrow text-[0.6rem] text-blue">{site.name}</p>
              <p className="mt-2 font-serif text-lg leading-snug">Working with authors worldwide</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">Consultations held online, wherever you write.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** 04 — Closing invitation. */
export function ContactCta() {
  const c = contactCopy.cta;
  return (
    <section aria-labelledby="contact-cta-title" className="bg-paper pb-[clamp(4.5rem,9vw,7rem)]">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-paper sm:px-12 md:py-20 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <SplitHeading
                lines={c.heading.map((line, i) => (i === 1 ? <em key={i} className="text-blue">{line}</em> : line))}
                className="font-serif text-[clamp(2.2rem,4.8vw,4.6rem)] leading-[1] tracking-[-0.035em]"
              />
              <span id="contact-cta-title" className="sr-only">
                {c.heading.join(" ")}
              </span>
              <Reveal>
                <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-paper/75">{c.body}</p>
              </Reveal>
            </div>
            <Reveal delay={0.15} className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Button href="#enquiry" variant="white">
                Begin Your Story
              </Button>
              <a href={`mailto:${site.email}`} className="eyebrow px-2 text-[0.66rem] text-paper/70 transition-colors hover:text-paper">
                {site.email}
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
