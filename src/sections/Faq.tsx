"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { faqs } from "@/data/home";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/** (09) FAQ — publishing-only questions, smooth accordion. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" data-stage="faq" className="relative py-section">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-24">
        <div>
          <Reveal>
            <SectionLabel index="10">
              FAQ
            </SectionLabel>
          </Reveal>
          <SplitHeading className="mt-8 text-headline" lines={["Questions,", <em key="a">answered.</em>]} />
          <Reveal delay={0.15} className="mt-6 max-w-xs text-ink-soft">
            Something else on your mind? Write to{" "}
            <a href={`mailto:${site.email}`} className="text-blue underline decoration-blue/30 underline-offset-4">
              {site.email}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ul className="border-t border-line">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                    >
                      <span
                        className={cn(
                          "font-serif text-[clamp(1.25rem,2vw,1.65rem)] leading-snug transition-colors duration-500",
                          isOpen ? "text-ink" : "text-ink/80 group-hover:text-ink",
                        )}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "relative grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500",
                          isOpen ? "border-transparent bg-ink text-paper" : "border-line group-hover:border-ink/40",
                        )}
                      >
                        <span className="absolute h-px w-3.5 bg-current" />
                        <span
                          className={cn(
                            "absolute h-3.5 w-px bg-current transition-transform duration-500",
                            isOpen && "scale-y-0",
                          )}
                        />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-${i}`}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-8 pr-14 text-ink-soft">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
