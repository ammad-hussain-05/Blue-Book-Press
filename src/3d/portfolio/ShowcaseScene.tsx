"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { BoxGeometry, MathUtils, MeshStandardMaterial, SRGBColorSpace, type Group, type Texture } from "three";
import { collectionBooks, coverUrl } from "@/data/portfolio";
import { StudioLights } from "../StudioLights";
import {
  collectionFocus,
  collectionK,
  collectionRecede,
  COLLECTION,
  copySide,
  mix,
  portfolioState,
  smooth,
} from "./portfolioState";

type V3 = [number, number, number];
type Pose = { p: V3; r: V3; s: number };

const N = collectionBooks.length;
const W = 0.66; // cover width : height
const D = 0.08; // thickness
const CAM_Z = 10;
const FOV = 30;
/** Depth of the collection wall, of the collection once it steps back, and of the focused book. */
const SLOT_Z = -2.5;
const BACK_Z = -7.5;
const FOCUS_Z = 3.4;
/**
 * Screen bands kept clear for the DOM copy (px): header + section heading
 * above the collection, header + label above the focused book, and the
 * progress rail below.
 */
const TOP_PX = 200;
const FOCUS_TOP_PX = 144;
const BOTTOM_PX = 64;
/** Portrait: the focused book's copy (with its Amazon button) sits under it, in the bottom 46%. */
const PORTRAIT_COPY = 0.46;

const viewH = (z: number) => 2 * Math.tan(MathUtils.degToRad(FOV / 2)) * (CAM_Z - z);

type Layout = {
  portrait: boolean;
  aspect: number;
  slots: Pose[];
  focus: { x: number; y: number; s: number };
  backY: number;
};

/**
 * All books as one full wall: staggered rows that fill the frame between
 * the copy bands, each book a little turned and set at its own depth.
 */
function buildLayout(width: number, height: number): Layout {
  const aspect = width / height;
  const portrait = aspect < 1;
  const h = viewH(SLOT_Z);
  const w = h * aspect;
  const yTop = h / 2 - (Math.min(TOP_PX, height * 0.3) / height) * h;
  const yBot = -h / 2 + (BOTTOM_PX / height) * h;

  const cols = aspect >= 1.25 ? 8 : aspect >= 1 ? 6 : aspect >= 0.7 ? 5 : 4;
  const rows = Math.max(1, Math.round(N / (cols - 0.5)));
  const base = Math.floor(N / rows);
  let extra = N - base * rows;
  const counts = Array.from({ length: rows }, () => base);
  // Longer rows alternate with shorter ones: a brick pattern.
  for (let r = 0; r < rows && extra > 0; r += 2, extra--) counts[r]++;
  for (let r = 1; r < rows && extra > 0; r += 2, extra--) counts[r]++;

  const widest = Math.max(...counts);
  const cellW = (w * 0.95) / widest;
  const cellH = (yTop - yBot) / rows;
  const s = Math.min(cellH * 0.8, (cellW * 0.8) / W);

  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const cells: Pose[] = [];
  counts.forEach((n, r) => {
    for (let c = 0; c < n; c++) {
      cells.push({
        p: [(c - (n - 1) / 2) * cellW + rand() * cellW * 0.06, yTop - (r + 0.5) * cellH + rand() * cellH * 0.04, SLOT_Z + rand() * 0.6],
        r: [0.04, rand() * 0.28, rand() * 0.05],
        s,
      });
    }
  });
  // Spread the scroll order across the wall so books come forward from everywhere.
  const order = cells.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(((rand() + 1) / 2) * (i + 1)) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const slots = order.map((i) => cells[i]);

  // The focused book: as large as its band allows, never into the copy.
  const fh = viewH(FOCUS_Z);
  const fw = fh * aspect;
  const top = FOCUS_TOP_PX / height;
  const bottom = portrait ? PORTRAIT_COPY : BOTTOM_PX / height;
  const avail = (1 - top - bottom) * fh;
  const focus = portrait
    ? { x: 0, y: ((bottom - top) / 2) * fh, s: Math.min(avail * 0.9, (fw * 0.6) / W) }
    : { x: fw * 0.24, y: ((bottom - top) / 2) * fh, s: Math.min(avail * 0.9, (fw * 0.3) / W) };

  // Portrait: the stepped-back wall gathers behind the focused book.
  const backY = portrait ? ((PORTRAIT_COPY - top) / 2) * viewH(BACK_Z) : 0;
  return { portrait, aspect, slots, focus, backY };
}

/**
 * Pose of book i at scroll q. Every book lives on the wall; when the focus
 * starts the wall steps back and gathers on the book's side of the frame,
 * leaving the other side clear for the copy. Book i then comes forward,
 * holds while its copy shows, and returns to the wall as book i + 1 comes.
 */
function pose(i: number, q: number, L: Layout): Pose {
  const slot = L.slots[i];
  const k = collectionK(q, N);
  const recede = collectionRecede(q, N);

  // The wall's side follows the focused book; it swaps during each hand-off.
  const cur = MathUtils.clamp(Math.floor(k), 0, N - 1);
  const next = Math.min(cur + 1, N - 1);
  const side = mix(-copySide(cur), -copySide(next), smooth(COLLECTION.exit, 1, k - cur));

  const bh = viewH(BACK_Z);
  const bw = bh * L.aspect;
  const back: V3 = L.portrait
    ? [slot.p[0] * 0.85, L.backY + slot.p[1] * 0.45, slot.p[2] + (BACK_Z - SLOT_Z)]
    : [side * bw * 0.25 + slot.p[0] * 0.5, slot.p[1] * 0.75, slot.p[2] + (BACK_Z - SLOT_Z)];
  const wall: V3 = [mix(slot.p[0], back[0], recede), mix(slot.p[1], back[1], recede), mix(slot.p[2], back[2], recede)];

  const f = collectionFocus(k, i);
  if (f <= 0) return { p: wall, r: slot.r, s: slot.s * (1 - recede * 0.15) };

  const cs = copySide(i);
  const target: V3 = [L.portrait ? 0 : -cs * L.focus.x, L.focus.y, FOCUS_Z];
  // Turn the cover toward its copy; scroll adds a slow quarter-turn drift.
  const drift = (k - i - 0.5) * 0.35;
  const fr: V3 = [0.02, (L.portrait ? 0.12 : cs * 0.26) + drift, 0];
  const e = f * f * (3 - 2 * f);
  return {
    p: [mix(wall[0], target[0], e), mix(wall[1], target[1], e) + Math.sin(f * Math.PI) * 0.15, mix(wall[2], target[2], e)],
    r: [mix(slot.r[0], fr[0], e), mix(slot.r[1], fr[1], e) + Math.sin(f * Math.PI) * 0.45 * cs, mix(slot.r[2], fr[2], e)],
    s: mix(slot.s, L.focus.s, e),
  };
}

function Book({
  i,
  layout,
  cover,
  shared,
}: {
  i: number;
  layout: Layout;
  cover: Texture;
  shared: { geometry: BoxGeometry; pages: MeshStandardMaterial; spine: MeshStandardMaterial; back: MeshStandardMaterial };
}) {
  const ref = useRef<Group>(null);
  const front = useMemo(() => new MeshStandardMaterial({ map: cover, roughness: 0.42, metalness: 0 }), [cover]);
  // Box faces: +x pages, -x spine, +y/-y pages, +z cover, -z back.
  const mats = useMemo(
    () => [shared.pages, shared.spine, shared.pages, shared.pages, front, shared.back],
    [shared, front],
  );
  const first = useRef(true);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = pose(i, portfolioState.showcase, layout);
    if (first.current) {
      first.current = false;
      g.position.set(...t.p);
      g.rotation.set(...t.r);
      g.scale.setScalar(t.s);
      return;
    }
    const d = Math.min(dt, 1 / 20);
    const damp = (c: number, v: number) => MathUtils.damp(c, v, 6, d);
    g.position.set(damp(g.position.x, t.p[0]), damp(g.position.y, t.p[1]), damp(g.position.z, t.p[2]));
    g.rotation.set(damp(g.rotation.x, t.r[0]), damp(g.rotation.y, t.r[1]), damp(g.rotation.z, t.r[2]));
    g.scale.setScalar(damp(g.scale.x, t.s));
  });

  return (
    <group ref={ref}>
      <mesh geometry={shared.geometry} material={mats} />
    </group>
  );
}

function Books() {
  const size = useThree((s) => s.size);
  const layout = useMemo(() => buildLayout(size.width, size.height), [size.width, size.height]);
  const covers = useTexture(collectionBooks.map((b) => coverUrl(b.slug)));
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
      {collectionBooks.map((b, i) => (
        <Book key={b.slug} i={i} layout={layout} cover={covers[i]} shared={shared} />
      ))}
    </>
  );
}

/** Blue / white key lights on pure black — light only, no visible geometry. */
function Lights() {
  return (
    <>
      <StudioLights castShadow={false} />
      <pointLight position={[-5, 2, 4]} intensity={16} color="#1f4fe0" distance={16} />
      <pointLight position={[5, -1, 4]} intensity={12} color="#ffffff" distance={16} />
    </>
  );
}

/** All Books: the full collection, then one book at a time at the camera. */
export default function ShowcaseScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, CAM_Z]} fov={FOV} />
      {/* Black fog: the stepped-back wall sinks into the dark behind the focus. */}
      <fog attach="fog" args={["#000000", 11, 25]} />
      <Lights />
      <Suspense fallback={null}>
        <Books />
      </Suspense>
    </Canvas>
  );
}
