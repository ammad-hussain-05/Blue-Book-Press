"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { books, MAIN_BOOK, SATELLITE_BOOKS } from "@/data/books";
import { BookModel } from "./BookModel";
import { ease, hiddenPose, keyframes, lerpPose, type Layer, type Pose, type TrackStop } from "./choreography";
import { stage } from "./stage";

/** Below this width the stacked (mobile/tablet) choreography is used. */
const MOBILE_BREAKPOINT = 1024;
/** Damping factor for the follow (higher = snappier). */
const FOLLOW = 3.2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const blank = (): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 0 });

/**
 * The five scroll-choreographed books on the fixed stage. Targets are
 * resolved every frame from section progress, then damped for smooth,
 * weighty motion. No React state is touched while scrolling.
 */
export function StageBooks({ onLayerChange }: { onLayerChange?: (layer: Layer) => void }) {
  const refs = useRef<(Group | null)[]>([]);
  const target = useRef(books.map(blank));
  const scratch = useRef(blank());
  const layer = useRef<Layer>("front");
  const dimmed = useRef(false);
  const { size } = useThree();
  const mobile = size.width < MOBILE_BREAKPOINT;

  useFrame((state, dt) => {
    const delta = Math.min(dt, 1 / 20);
    const { width: vw, height: vh } = state.viewport;
    const unit = Math.min(vh, vw * 1.25);
    const ids = stage.sections;
    if (!ids.length) return;

    // Which section is "current" → canvas layer (front/back of the text).
    let active = 0;
    for (let i = 1; i < ids.length; i++) if (stage.progress[i] >= 0.5) active = i;
    const activeKey = keyframes[ids[active]];
    const nextLayer: Layer = mobile ? "back" : (activeKey?.layer ?? "front");
    if (nextLayer !== layer.current) {
      layer.current = nextLayer;
      if (stage.wrapper) stage.wrapper.dataset.layer = nextLayer;
      onLayerChange?.(nextLayer);
    }
    // Mobile: fade the stage to a watermark behind text-heavy sections.
    const featured =
      !activeKey || activeKey.kind !== "pose" || !!activeKey.mainMobile || !!activeKey.mainAnchor;
    const nextDim = mobile && !featured;
    if (nextDim !== dimmed.current) {
      dimmed.current = nextDim;
      if (stage.wrapper) stage.wrapper.dataset.dim = String(nextDim);
    }

    const velocityTilt = MathUtils.clamp(stage.velocity * 0.006, -0.25, 0.25);
    const motion = mobile ? 0.55 : 1;

    books.forEach((_, b) => {
      const group = refs.current[b];
      if (!group) return;

      // 1. Resolve the scroll target by chaining section keyframes.
      const t = target.current[b];
      resolvePose(t, ids[0], b, mobile, vw, vh, unit);
      for (let i = 1; i < ids.length; i++) {
        const k = ease(clamp01(stage.progress[i] ?? 0));
        if (k <= 0) continue;
        lerpPose(t, resolvePose(scratch.current, ids[i], b, mobile, vw, vh, unit), k);
      }

      // 2. Intro fly-in (staggered per book).
      const delay = b === MAIN_BOOK ? 0 : 0.12 + SATELLITE_BOOKS.indexOf(b as 0) * 0.08;
      const intro = ease(clamp01((stage.intro - delay) / (1 - delay)));
      const out = 1 - intro;

      // 3. Pointer parallax + scroll inertia (main book reacts most).
      const weight = b === MAIN_BOOK ? 1 : 0.5;
      const px = stage.pointer.x * 0.14 * weight * motion;
      const py = stage.pointer.y * 0.1 * weight * motion;

      const x = (t.x * vw) / 2;
      const y = (t.y * vh) / 2 - out * vh * 0.9;
      const z = t.z - out * 4;
      const scale = Math.max(0.0001, t.s * unit);

      const damp = (cur: number, to: number) => MathUtils.damp(cur, to, FOLLOW, delta);
      group.position.set(damp(group.position.x, x), damp(group.position.y, y), damp(group.position.z, z));
      group.rotation.set(
        damp(group.rotation.x, t.rx * motion - py + velocityTilt * 0.6 * weight),
        damp(group.rotation.y, t.ry - out * 2.2 + px),
        damp(group.rotation.z, t.rz * motion + velocityTilt * weight),
      );
      group.scale.setScalar(damp(group.scale.x, scale));
    });
  });

  return (
    <>
      {books.map((book, b) => (
        <group
          key={book.id}
          ref={(el) => {
            refs.current[b] = el;
          }}
          scale={0.0001}
        >
          <Float
            speed={b === MAIN_BOOK ? 1.2 : 1.6}
            floatIntensity={mobile ? 0.25 : 0.5}
            rotationIntensity={mobile ? 0.08 : 0.16}
            floatingRange={[-0.04, 0.04]}
          >
            <BookModel model={book.model} />
          </Float>
        </group>
      ))}
    </>
  );
}

/** Pose for book `b` in section `id`, written into `out`. */
function resolvePose(
  out: Pose,
  id: string,
  b: number,
  mobile: boolean,
  vw: number,
  vh: number,
  unit: number,
): Pose {
  const key = keyframes[id];
  if (!key) return Object.assign(out, hiddenPose);

  if (key.kind === "slots") {
    const el = stage.slots[b];
    if (!el) return Object.assign(out, hiddenPose);
    dockTo(out, el, vh, unit);
    out.rx = 0.04;
    out.ry = b === MAIN_BOOK ? -0.18 : b < MAIN_BOOK ? 0.32 : -0.32;
    out.rz = 0;
    return out;
  }

  const isMain = b === MAIN_BOOK;

  if (key.kind === "track") {
    if (isMain) return sampleTrack(out, key.stops, stage.track[id] ?? 0, mobile);
    return Object.assign(out, key.sats[SATELLITE_BOOKS.indexOf(b as 0)]);
  }

  const src = isMain ? (mobile && key.mainMobile) || key.main : key.sats[SATELLITE_BOOKS.indexOf(b as 0)];
  Object.assign(out, src);

  if (isMain && key.mainAnchor) {
    const id = key.mainAnchor;
    let el = stage.anchors[id];
    if (!el?.isConnected) el = stage.anchors[id] = document.querySelector<HTMLElement>(`[data-stage-anchor="${id}"]`);
    if (el) return dockTo(out, el, vh, unit, 1.1);
  }

  if (mobile) {
    // Single-column layouts: keep text clear. The main book becomes a small
    // companion in the top corner; satellites hug the side edges.
    if (isMain && !key.mainMobile) {
      out.x = 0.6;
      out.y = 0.55;
      out.z = 0;
      out.s = 0.3;
    } else if (!isMain && Math.abs(out.x) < 1.2) {
      out.x = out.x < 0 ? -0.82 : 0.82;
      out.y = out.y > 0 ? 0.62 : 0.12;
      out.s *= 0.8;
    }
  }
  // Short, wide desktop viewports (e.g. 1024×768) have less room above and
  // below the hero headline — shrink the satellites to keep clear of text.
  if (!mobile && !isMain) {
    const aspect = vw / vh;
    if (aspect < 1.5) out.s *= Math.max(0.72, 1 - (1.5 - aspect) * 1.1);
  }
  // Keep x placement proportional on ultra-wide screens.
  if (vw / vh > 2.2) out.x *= 0.85;
  return out;
}

/** Piecewise, eased interpolation along a scroll track. */
function sampleTrack(out: Pose, stops: TrackStop[], t: number, mobile: boolean): Pose {
  const pick = (s: TrackStop) => (mobile ? s.mainMobile : s.main);
  let i = 0;
  while (i < stops.length - 2 && t > stops[i + 1].at) i++;
  const from = stops[i];
  const to = stops[i + 1];
  Object.assign(out, pick(from));
  return lerpPose(out, pick(to), ease(clamp01((t - from.at) / (to.at - from.at))));
}

/** Centre the pose on a DOM element and match its height (rotation untouched). */
function dockTo(out: Pose, el: HTMLElement, vh: number, unit: number, maxAspect = Infinity): Pose {
  const r = el.getBoundingClientRect();
  // Optionally cap height relative to width so books never overflow narrow anchors.
  const height = Math.min(r.height, r.width * maxAspect);
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  out.x = ((r.left + r.width / 2) / iw) * 2 - 1;
  out.y = -(((r.top + r.height / 2) / ih) * 2 - 1);
  out.z = 0;
  out.s = ((height / ih) * vh) / unit;
  return out;
}
