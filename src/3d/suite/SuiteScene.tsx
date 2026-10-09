"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Sparkles } from "@react-three/drei";
import { MathUtils, Points, PointsMaterial, type Group } from "three";
import { books } from "@/data/books";
import { BookModel } from "../BookModel";
import { StudioLights } from "../StudioLights";
import { PointCloudModel } from "../about/PointCloudModel";
import { suiteState } from "./suiteState";

type V3 = [number, number, number];
type Pose = { p: V3; r: V3; s: number };

const CAM_Z = 10;
/** Camera distance at the start of the intro — inside the hero layout. */
const INTRO_Z = 3.4;
const FOLLOW = 5.2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  p: [mix(a.p[0], b.p[0], t), mix(a.p[1], b.p[1], t), mix(a.p[2], b.p[2], t)],
  r: [mix(a.r[0], b.r[0], t), mix(a.r[1], b.r[1], t), mix(a.r[2], b.r[2], t)],
  s: mix(a.s, b.s, t),
});

/* ------------------------------------------------------------------
   Layouts. Landscape positions are authored for ~16:9 and compressed
   horizontally by `fit` on narrower screens; portrait has its own.
   Book order follows `books` — index 2 is the large hero title.
   ------------------------------------------------------------------ */

function heroPose(i: number, portrait: boolean, fit: number): Pose {
  if (portrait) {
    const x = [-0.84, -0.43, 0, 0.43, 0.84][i];
    return {
      p: [x, [0.02, -0.03, 0, -0.03, 0.02][i], [-0.9, -0.35, 0.35, -0.35, -0.9][i]],
      r: [0, [0.5, 0.26, 0, -0.26, -0.5][i], 0],
      s: [0.78, 0.84, 1.02, 0.84, 0.78][i],
    };
  }
  return {
    p: [[-2.3, -1.18, 0, 1.18, 2.3][i] * fit, [0.02, -0.04, 0, -0.04, 0.02][i], [-0.9, -0.35, 0.35, -0.35, -0.9][i]],
    r: [0, [0.55, 0.28, 0, -0.28, -0.55][i], [0.04, 0.02, 0, -0.02, -0.04][i]],
    s: [1.28, 1.34, 1.62, 1.34, 1.28][i],
  };
}

/** Section 2: a descending staircase of books beside the copy. */
function spreadPose(i: number, portrait: boolean, fit: number): Pose {
  if (portrait) {
    return {
      p: [-0.72 + i * 0.36, -0.55 - i * 0.24, -i * 0.15],
      r: [0.05, -0.35, 0.03],
      s: 0.64,
    };
  }
  return {
    p: [(0.55 + i * 0.8) * fit, 1.15 - i * 0.55, -i * 0.2],
    r: [0.06, -0.45 + i * 0.05, 0.04],
    s: 1.22,
  };
}

/** Section 3: Print (0, 1) · Digital (2) · Audio (3, 4). */
function formatPose(i: number, portrait: boolean, fit: number, q: number): Pose {
  const dir = i % 2 ? -1 : 1;
  // Scroll-driven turn — never time-driven.
  const turn = (q - 0.5) * 1.1 * dir;
  if (portrait) {
    return {
      p: [[-0.86, -0.46, 0, 0.46, 0.86][i], [0.16, 0.06, 0.2, 0.06, 0.16][i], [-0.5, 0.1, 0.3, 0.1, -0.5][i]],
      r: [0, [0.4, 0.18, 0, -0.18, -0.4][i] + turn * 0.6, 0],
      s: [0.86, 0.92, 1.12, 0.92, 0.86][i],
    };
  }
  return {
    p: [[-3.2, -2.45, 0, 2.45, 3.2][i] * fit, [0.48, 0.32, 0.48, 0.32, 0.48][i], [-0.5, 0.1, 0.3, 0.1, -0.5][i]],
    r: [0, [0.45, 0.2, 0, -0.2, -0.45][i] + turn, 0],
    s: [1.22, 1.28, 1.48, 1.28, 1.22][i],
  };
}

function targetPose(i: number, portrait: boolean, fit: number): Pose {
  const { hero, reveal, formats } = suiteState;

  // Hero: the cluster holds, then flies past the camera as the hero leaves.
  if (reveal <= 0.001 && formats <= 0.001) {
    const base = heroPose(i, portrait, fit);
    const e = smooth(0.05, 1, hero);
    const off = i - 2;
    return {
      p: [base.p[0] * (1 + e * 1.8), base.p[1] + off * e * 0.25, base.p[2] + e * e * 11.5],
      r: [base.r[0] - e * 0.3, base.r[1] + off * e * 0.35, base.r[2]],
      s: base.s,
    };
  }

  const spread = spreadPose(i, portrait, fit);

  // Section 2: each book starts behind the camera and zooms out into place.
  if (formats <= 0.001) {
    const t = smooth(i * 0.15, i * 0.15 + 0.32, reveal);
    const pre: Pose = {
      p: [spread.p[0] * 0.2, spread.p[1] * 0.2, CAM_Z + 1.5],
      r: [0.35, spread.r[1] + 1.4, -0.25],
      s: spread.s,
    };
    return mixPose(pre, spread, t);
  }

  // Section 3: staircase → format groups, then away and out.
  const f = smooth(0, 0.32, formats);
  const pose = mixPose(spread, formatPose(i, portrait, fit, formats), f);
  const x = smooth(0.78, 1, formats);
  pose.p[1] += x * 1.6;
  pose.p[2] -= x * 5;
  pose.r[1] += x * (i - 2) * 0.5;
  pose.s *= 1 - x * 0.35;
  return pose;
}

function SuiteBook({ index }: { index: number }) {
  const ref = useRef<Group>(null);
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  const fit = Math.min(1, Math.max(0.6, size.width / size.height / 1.78));
  const book = books[index];

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 1 / 20);
    const t = targetPose(index, portrait, fit);
    const damp = (c: number, v: number) => MathUtils.damp(c, v, FOLLOW, d);
    g.position.set(damp(g.position.x, t.p[0]), damp(g.position.y, t.p[1]), damp(g.position.z, t.p[2]));
    g.rotation.set(damp(g.rotation.x, t.r[0]), damp(g.rotation.y, t.r[1]), damp(g.rotation.z, t.r[2]));
    g.scale.setScalar(damp(g.scale.x, t.s));
    // Hide while behind / inside the camera so the near plane never slices it.
    g.visible = g.position.z < CAM_Z - 0.6;
  });

  const start = heroPose(index, portrait, fit);
  return (
    <group ref={ref} position={start.p} rotation={start.r} scale={start.s}>
      <BookModel model={book.model} />
    </group>
  );
}

/**
 * The Press point-cloud ring, scaled up so the whole hero sits inside it.
 * Held steady through the hero and the books' arrival (01–02), turned only
 * by scroll, then it widens and dissolves through section 03 — gone before
 * the marquee and the service sections.
 */
function HeroRing({ portrait }: { portrait: boolean }) {
  const ref = useRef<Group>(null);
  const mats = useRef<PointsMaterial[]>([]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 1 / 20);
    const { hero, reveal, formats } = suiteState;
    if (!mats.current.length) {
      g.traverse((o) => {
        if (o instanceof Points && o.material instanceof PointsMaterial) mats.current.push(o.material);
      });
    }
    const out = smooth(0.3, 0.78, formats);
    g.rotation.y = MathUtils.damp(g.rotation.y, -0.35 + hero * 0.55 + reveal * 0.6 + formats * 0.5, 3, d);
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1 + out * 0.45, 3, d));
    let opacity = 0;
    for (const m of mats.current) {
      m.opacity = MathUtils.damp(m.opacity, 0.95 * (1 - out), 4, d);
      opacity = m.opacity;
    }
    g.visible = opacity > 0.01;
  });

  return (
    <group position={[0, portrait ? -0.05 : -0.1, -1.2]} rotation={[portrait ? 0.9 : 0.48, 0, portrait ? 0.08 : 0.06]}>
      <group ref={ref}>
        <PointCloudModel size={portrait ? 5.6 : 12.5} pointSize={portrait ? 0.04 : 0.065} />
      </group>
    </group>
  );
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20);
    const intro = suiteState.intro;
    const z = mix(INTRO_Z, CAM_Z, intro);
    camera.position.x = MathUtils.damp(camera.position.x, suiteState.pointer.x * 0.28, 3, d);
    camera.position.y = MathUtils.damp(camera.position.y, -suiteState.pointer.y * 0.16, 3, d);
    camera.position.z = intro < 1 ? z : MathUtils.damp(camera.position.z, z, 3, d);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  const order = useMemo(() => books.map((_, i) => i), []);
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, INTRO_Z]} fov={30} near={0.1} far={60} />
      <CameraRig />
      <StudioLights castShadow={false} />
      <Suspense fallback={null}>
        {order.map((i) => (
          <SuiteBook key={books[i].id} index={i} />
        ))}
      </Suspense>
      <Suspense fallback={null}>
        <HeroRing portrait={portrait} />
      </Suspense>
      <Sparkles
        count={portrait ? 40 : 90}
        scale={portrait ? [4, 7, 4] : [12, 7, 5]}
        size={portrait ? 1.6 : 2.2}
        speed={0.25}
        opacity={0.55}
        color="#ffffff"
      />
    </>
  );
}

/** Publishing Suite stage: the five books, choreographed by scroll. */
export default function SuiteScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
