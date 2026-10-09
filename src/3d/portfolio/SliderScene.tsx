"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { BoxGeometry, MathUtils, MeshStandardMaterial, SRGBColorSpace, type Group, type Texture } from "three";
import { coverUrl, showcaseWaves } from "@/data/portfolio";
import { StudioLights } from "../StudioLights";
import { portfolioState, smooth, WAVE, waveFocus, waveLocal } from "./portfolioState";

type V3 = [number, number, number];
type Pose = { p: V3; r: V3; s: number };

const W = 0.66; // cover width : height
const D = 0.08; // thickness
const WAVES = showcaseWaves.length;
const HIDDEN: Pose = { p: [0, -6, -8], r: [0, 0, 0], s: 0.001 };

/** Vertical centre of the book band (kept clear of the copy above / below). */
const bandY = (portrait: boolean) => (portrait ? -0.42 : -0.25);

/**
 * Book j of wave k. Within its wave the books ride a sine wave: they rise in
 * from the lower right, slide past the focused centre (rotating as they go),
 * then flow up and out as the next wave rolls in beneath them.
 */
function pose(k: number, j: number, n: number, q: number, portrait: boolean): Pose {
  const u = waveLocal(q, k, WAVES);
  if (u < -0.05 || u > 1.05) return HIDDEN;
  const f = waveFocus(u, n);
  const d = j - f;
  const ad = Math.abs(d);
  const phase = k * 1.3;
  const gap = portrait ? 0.95 : 1.75;
  const y0 = bandY(portrait);

  const p: V3 = [d * gap, y0 + Math.sin(d * 0.9 + phase) * (portrait ? 0.12 : 0.22), -Math.min(ad, 4) * 0.55];
  const r: V3 = [0.05, -MathUtils.clamp(d * 0.32, -1.2, 1.2), Math.cos(d * 0.9 + phase) * 0.05];
  let s = (portrait ? 1.08 : 1.58) - Math.min(ad, 1) * (portrait ? 0.3 : 0.42);

  // Hand-offs stay inside the book band (never crossing the copy): the
  // next wave flows in from the right out of depth, the current one flows
  // on to the left and recedes — one continuous wave.
  const travel = portrait ? 3.2 : 7.5;
  const enter = smooth(j * 0.012, WAVE.enter + j * 0.012, u);
  const exit = smooth(WAVE.exit + j * 0.008, 1 + j * 0.008, u);
  p[0] += (1 - enter) * travel - exit * travel;
  p[1] += Math.sin((1 - enter + exit) * Math.PI) * 0.12;
  p[2] -= (1 - enter) * 3 + exit * 3;
  r[1] += (1 - enter) * 0.6 - exit * 0.6;
  s *= 1 - (1 - enter) * 0.35 - exit * 0.35;

  if (ad > (portrait ? 1.9 : 3.4)) s = 0.001;
  return { p, r, s };
}

function Book({
  k,
  j,
  n,
  cover,
  shared,
}: {
  k: number;
  j: number;
  n: number;
  cover: Texture;
  shared: {
    geometry: BoxGeometry;
    pages: MeshStandardMaterial;
    spine: MeshStandardMaterial;
    back: MeshStandardMaterial;
  };
}) {
  const ref = useRef<Group>(null);
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  const front = useMemo(() => new MeshStandardMaterial({ map: cover, roughness: 0.42, metalness: 0 }), [cover]);
  // Box faces: +x pages, -x spine, +y/-y pages, +z cover, -z back.
  const mats = useMemo(
    () => [shared.pages, shared.spine, shared.pages, shared.pages, front, shared.back],
    [shared, front],
  );

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 1 / 20);
    const t = pose(k, j, n, portfolioState.sliders, portrait);
    const damp = (c: number, v: number) => MathUtils.damp(c, v, 5.5, d);
    g.position.set(damp(g.position.x, t.p[0]), damp(g.position.y, t.p[1]), damp(g.position.z, t.p[2]));
    g.rotation.set(damp(g.rotation.x, t.r[0]), damp(g.rotation.y, t.r[1]), damp(g.rotation.z, t.r[2]));
    g.scale.setScalar(damp(g.scale.x, t.s));
    g.visible = g.scale.x > 0.01;
  });

  return (
    <group ref={ref} position={HIDDEN.p} scale={0.001}>
      <mesh geometry={shared.geometry} material={mats} />
    </group>
  );
}

function Books() {
  const slots = useMemo(
    () => showcaseWaves.flatMap((w, k) => w.books.map((b, j) => ({ k, j, n: w.books.length, slug: b.slug }))),
    [],
  );
  const covers = useTexture(slots.map((s) => coverUrl(s.slug)));
  useMemo(() => {
    covers.forEach((t) => {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [covers]);
  const shared = useMemo(
    () => ({
      geometry: new BoxGeometry(W, 1, D),
      pages: new MeshStandardMaterial({ color: "#f1f0ec", roughness: 0.85 }),
      spine: new MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.5 }),
      back: new MeshStandardMaterial({ color: "#101114", roughness: 0.6 }),
    }),
    [],
  );
  return (
    <>
      {slots.map((s, i) => (
        <Book key={`${s.k}-${s.slug}`} k={s.k} j={s.j} n={s.n} cover={covers[i]} shared={shared} />
      ))}
    </>
  );
}

/** Blue / white lighting on black — light only, no visible geometry. */
function Lights() {
  return (
    <>
      <StudioLights castShadow={false} />
      <pointLight position={[-5, 2, 3]} intensity={18} color="#1f4fe0" distance={14} />
      <pointLight position={[5, -1, 3]} intensity={14} color="#ffffff" distance={14} />
      <pointLight position={[0, 4, -4]} intensity={10} color="#ffffff" distance={12} />
    </>
  );
}

/** The collection's four wave sliders (Best Sellers → Upcoming → Featured → Complete Shelf). */
export default function SliderScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={30} />
      <Lights />
      <Suspense fallback={null}>
        <Books />
      </Suspense>
    </Canvas>
  );
}
