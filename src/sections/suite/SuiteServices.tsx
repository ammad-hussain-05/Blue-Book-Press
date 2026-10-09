"use client";

import { motion } from "framer-motion";
import { suiteServices } from "@/data/publishingSuite";
import { PointGrid, ServiceBody, ServiceHeader, SuiteSection } from "./ServiceParts";
import {
  AudioVisual,
  CoverVisual,
  EbookVisual,
  ManuscriptVisual,
  ReachVisual,
  RouteVisual,
  SpreadVisual,
  StairImage,
} from "./SuiteVisuals";

const EASE = [0.16, 1, 0.3, 1] as const;
const byId = (id: string) => {
  const s = suiteServices.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown suite service: ${id}`);
  return s;
};

/** Sections 04–10: one editorial section per service, each with its own layout. */
export function SuiteServices() {
  return (
    <>
      <AudioSection />
      <EbookSection />
      <PublishingSection />
      <CoverSection />
      <EditingSection />
      <InteriorSection />
      <MarketingSection />
    </>
  );
}

/* 04 — copy left, tall studio panel right */
function AudioSection() {
  const s = byId("audiobook-production");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 grid gap-12 md:mt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <ServiceHeader index={4} service={s} />
          <ServiceBody className="mt-10">{s.body}</ServiceBody>
        </div>
        <AudioVisual className="lg:mt-24" />
      </div>
      <div className="container-site mt-14 md:mt-20">
        <PointGrid points={s.points} />
      </div>
    </SuiteSection>
  );
}

/* 05 — device composition left, copy right-aligned */
function EbookSection() {
  const s = byId("ebook-publishing");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 grid items-center gap-14 md:mt-14 lg:grid-cols-2 lg:gap-20">
        <EbookVisual className="order-2 lg:order-1" />
        <div className="order-1 lg:order-2">
          <ServiceHeader index={5} service={s} align="right" />
          <ServiceBody className="mt-10 lg:ml-auto lg:text-right">{s.body}</ServiceBody>
        </div>
      </div>
      <div className="container-site mt-14 md:mt-20">
        <PointGrid points={s.points} />
      </div>
    </SuiteSection>
  );
}

/* 06 — full-width: header, staircase image band, route, points */
function PublishingSection() {
  const s = byId("publishing-services");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:gap-20">
        <ServiceHeader index={6} service={s} />
        <ServiceBody>{s.body}</ServiceBody>
      </div>
      <div className="mt-14 md:mt-20">
        <StairImage className="h-[38vw] max-h-[30rem] min-h-[14rem] w-full" slices={7} />
      </div>
      <div className="container-site mt-14 md:mt-20">
        <RouteVisual />
        <PointGrid points={s.points} className="mt-14 md:mt-20" />
      </div>
    </SuiteSection>
  );
}

/* 07 — centred header, folding cover wrap, points as 2×2 beside copy */
function CoverSection() {
  const s = byId("cover-design");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 md:mt-14">
        <ServiceHeader index={7} service={s} align="center" />
        <CoverVisual className="mx-auto mt-14 max-w-5xl pb-10 md:mt-20" />
        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <ServiceBody>{s.body}</ServiceBody>
          <PointGrid points={s.points} cols={2} />
        </div>
      </div>
    </SuiteSection>
  );
}

/* 08 — clean: header + manuscript side by side, points row below */
function EditingSection() {
  const s = byId("editing-proofreading");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 grid gap-12 md:mt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <ServiceHeader index={8} service={s} />
          <ServiceBody className="mt-10">{s.body}</ServiceBody>
        </div>
        <ManuscriptVisual className="lg:mt-32" />
      </div>
      <div className="container-site mt-16 md:mt-24">
        <PointGrid points={s.points} />
      </div>
    </SuiteSection>
  );
}

/* 09 — Interior + Paperback, two linked columns around one spread */
function InteriorSection() {
  const s = byId("interior-format");
  const [interior, paperback] = [s.points.slice(0, 2), s.points.slice(2)];
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 md:mt-14">
        <ServiceHeader index={9} service={s} />
        <div className="mt-12 grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <ServiceBody>{s.body}</ServiceBody>
          <SpreadVisual />
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-2 lg:gap-10">
          <SubService title="Book Interior Format" kicker="Inside the book" points={interior} />
          <SubService
            id="paperback-formatting"
            title="Paperback Formatting"
            kicker="Ready for the press"
            points={paperback}
          />
        </div>
      </div>
    </SuiteSection>
  );
}

function SubService({
  id,
  title,
  kicker,
  points,
}: {
  id?: string;
  title: string;
  kicker: string;
  points: typeof suiteServices[number]["points"];
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <motion.p
        className="eyebrow text-[0.66rem] text-paper/75"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {kicker}
      </motion.p>
      <motion.h3
        className="mt-3 font-serif text-[clamp(1.7rem,2.8vw,2.6rem)] leading-tight tracking-[-0.025em]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
      >
        {title}
      </motion.h3>
      <PointGrid points={points} cols={2} className="mt-6" />
    </div>
  );
}

/* 10 — reach rings left, copy right; points stacked */
function MarketingSection() {
  const s = byId("marketing-promotion");
  return (
    <SuiteSection id={s.id} label={s.title}>
      <div className="container-site mt-10 grid items-center gap-14 md:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <ReachVisual className="order-2 lg:order-1" />
        <div className="order-1 lg:order-2">
          <ServiceHeader index={10} service={s} />
          <ServiceBody className="mt-10">{s.body}</ServiceBody>
        </div>
      </div>
      <div className="container-site mt-16 md:mt-24">
        <PointGrid points={s.points} />
      </div>
    </SuiteSection>
  );
}
