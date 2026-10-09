"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { stage } from "@/3d/stage";
import { storySteps } from "@/data/home";
import { cn } from "@/lib/cn";

const STEP_COUNT = storySteps.length;

/**
 * (03) The Blue Book Method — a pinned, scroll-scrubbed story.
 *
 * The section pins for one viewport per step. Scroll progress drives:
 *  - the step crossfade (GSAP timeline, scrubbed)
 *  - the blue progress rail and counter
 *  - `stage.track.story`, which the 3D stage uses to zoom the main book
 *    from normal → huge (mid-scroll) → back out (see `story` in choreography.ts)
 */
export function PublishingStory() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".story-step");
      gsap.set(steps.slice(1), { autoAlpha: 0, y: 70 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * STEP_COUNT}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            stage.track.story = self.progress;
            const index = Math.min(STEP_COUNT - 1, Math.floor(self.progress * STEP_COUNT));
            setActive((current) => (current === index ? current : index));
          },
          onRefresh: (self) => {
            stage.track.story = self.progress;
          },
        },
      });

      // Timeline length = STEP_COUNT units; step i owns [i, i + 1).
      tl.fromTo(".story-rail-fill", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: STEP_COUNT }, 0);
      steps.forEach((step, i) => {
        if (i === 0) return;
        tl.to(steps[i - 1], { autoAlpha: 0, y: -60, duration: 0.32 }, i - 0.3);
        tl.to(step, { autoAlpha: 1, y: 0, duration: 0.36 }, i - 0.04);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="method"
      data-stage="story"
      className="relative h-svh min-h-[620px] overflow-hidden"
      aria-label="The Blue Book Method"
    >
      {/* White veil keeps copy crisp while the book zooms behind it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper from-42% via-paper/70 via-50% to-transparent to-58% lg:bg-gradient-to-r lg:from-paper lg:from-38% lg:via-paper/75 lg:via-52% lg:to-transparent lg:to-70%"
      />

      <div className="container-site relative flex h-full flex-col pb-8 pt-[calc(var(--spacing-header)+1.5rem)] lg:pb-12">
        <SectionLabel index="03">The Blue Book Method</SectionLabel>

        {/* Steps: stacked in one grid cell, crossfaded by the scrubbed timeline */}
        <div className="grid flex-1 content-end lg:max-w-[46%] lg:content-center">
          {storySteps.map((step, i) => (
            <article
              key={step.id}
              className="story-step [grid-area:1/1]"
              aria-hidden={active !== i}
            >
              <p className="font-serif text-[clamp(4.5rem,11vw,9.5rem)] leading-[0.8] tracking-[-0.04em] text-blue italic">
                {String(i + 1).padStart(2, "0")}
              </p>
              <span aria-hidden className="mt-6 block h-px w-16 bg-blue" />
              <h3 className="mt-6 text-[clamp(2.2rem,4.6vw,4.6rem)] leading-[1] tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-5 max-w-md text-lead text-ink-soft">{step.body}</p>
            </article>
          ))}
        </div>

        {/* Progress rail + step index */}
        <div className="mt-8 lg:max-w-[46%]">
          <div className="flex items-center gap-5">
            <div className="relative h-[2px] flex-1 bg-line">
              <span className="story-rail-fill absolute inset-0 origin-left bg-blue" />
            </div>
            <p className="eyebrow shrink-0 tabular-nums text-ink-muted">
              <span className="text-blue">{String(active + 1).padStart(2, "0")}</span> / {String(STEP_COUNT).padStart(2, "0")}
            </p>
          </div>
          <ol className="mt-4 hidden grid-cols-5 gap-4 md:grid">
            {storySteps.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  "text-[0.7rem] leading-snug tracking-wide transition-colors duration-500",
                  i === active ? "text-ink" : "text-ink-muted/70",
                )}
              >
                <span className={cn("block tabular-nums", i <= active ? "text-blue" : "")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
