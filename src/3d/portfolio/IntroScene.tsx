"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import {
  CanvasTexture,
  Color,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
  type Group,
  type Mesh,
  type Sprite,
  type SpriteMaterial,
} from "three";
import { INTRO_VIDEO_CROP } from "@/data/portfolio";
import { PointCloudModel } from "../about/PointCloudModel";
import { INTRO, mix, portfolioState, smooth } from "./portfolioState";

const CAM_Z = 10;
const FOV = 32;
const NEAR_Z = 1.15;
/** Cool-grey puffs read as cloud against the white page. */
const CLOUD = new Color("#dde3f1");
/** Ring tilt toward the camera (rad): nearly face-on, so the film sits in its opening. */
const RING_TILT = 1.25;
/** The Press ring's opening and outer edge, as fractions of its size (measured from the model). */
const RING_INNER = 0.35;
const RING_OUTER = 0.5;

/** Picture aspect of the intro film once its letterbox bars are cropped. */
function filmAspect(video: HTMLVideoElement | null) {
  const span = INTRO_VIDEO_CROP.bottom - INTRO_VIDEO_CROP.top;
  return video?.videoWidth && video.videoHeight ? video.videoWidth / (video.videoHeight * span) : 0.83;
}

/** A DOM block the ring must stay clear of, as fractions of the stage (0 → 1, y down). */
export type StageRect = { x0: number; y0: number; x1: number; y1: number };

/**
 * Composition: The Press ring centred and wholly in frame (a touch wider than
 * the screen on phones only), the film centred inside its opening — as large as
 * the opening allows while keeping a clear gap (`pad`) on every side. The
 * ring also shrinks, if needed, to stay clear of the intro note.
 */
function fitStage(width: number, height: number, aspect: number, note?: StageRect | null) {
  const viewH = 2 * Math.tan(MathUtils.degToRad(FOV / 2)) * CAM_Z;
  const viewW = viewH * (width / height);
  const portrait = width / height < 0.9;
  const lean = Math.sin(RING_TILT);
  // Phones: the ring may run just past the screen edges so the film stays legible.
  const widthShare = width / height < 0.6 ? 1.08 : portrait ? 0.96 : 0.9;
  let ring = Math.min((viewH * 0.84) / (RING_OUTER * 2 * lean), viewW * widthShare);
  if (note) {
    // Ring's outer edge on screen: an ellipse around the centre (fractions).
    const rx = (ring * RING_OUTER) / viewW;
    const ry = (ring * RING_OUTER * lean) / viewH;
    // Nearest point of the note to the centre, in ellipse-normalised space.
    const nx = (MathUtils.clamp(0.5, note.x0, note.x1) - 0.5) / rx;
    const ny = (MathUtils.clamp(0.5, note.y0, note.y1) - 0.5) / ry;
    const reach = Math.hypot(nx, ny);
    ring *= Math.min(1, reach / 1.08);
  }
  const pad = ring * (portrait ? 0.07 : 0.08);
  // Opening as seen by the camera: an ellipse (a across, b tall).
  const a = ring * RING_INNER;
  const b = a * lean;
  // Largest film height whose corners (plus pad) stay inside the opening.
  let lo = 0;
  let hi = viewH;
  for (let i = 0; i < 32; i++) {
    const h = (lo + hi) / 2;
    const fits = ((h * aspect) / 2 + pad) ** 2 / a ** 2 + (h / 2 + pad) ** 2 / b ** 2 <= 1;
    if (fits) lo = h;
    else hi = h;
  }
  return { ring, film: lo, pad, portrait };
}

/** Rounded-rectangle alpha mask so the video reads as an object, not a box. */
function roundedMask(aspect: number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = Math.round(256 / aspect);
  const ctx = c.getContext("2d")!;
  const r = 18;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(1, 1, c.width - 2, c.height - 2, r);
  ctx.fill();
  return new CanvasTexture(c);
}

/**
 * White passe-partout behind the film: an opaque card in the page's own
 * white (so it never shows) with a feathered edge. Drawn over the ring, it
 * keeps every ring point a clear margin away from the film, while the ring
 * still reads as passing behind it.
 */
function matTexture(aspect: number, margin: number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = Math.round(256 / aspect);
  const ctx = c.getContext("2d")!;
  const m = (margin / (1 + margin * 2)) * c.height;
  ctx.filter = `blur(${Math.max(1, Math.round(m * 0.3))}px)`;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(m * 0.4, m * 0.4, c.width - m * 0.8, c.height - m * 0.8, m);
  ctx.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Soft cloud puff: layered radial gradients with a little noise. */
function cloudTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = 128 + (rand() - 0.5) * 120;
    const y = 128 + (rand() - 0.5) * 70;
    const r = 40 + rand() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.35 + rand() * 0.3})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * The intro film, centred on a rounded plane inside the ring. The texture
 * is cropped to the film's picture area (its letterbox bars are dropped),
 * and the plane takes the cropped aspect — never stretched.
 */
function VideoPlane({ video, h, pad }: { video: HTMLVideoElement; h: number; pad: number }) {
  const ref = useRef<Mesh>(null);
  const { top, bottom } = INTRO_VIDEO_CROP;
  const span = bottom - top;
  const aspect = filmAspect(video);
  const texture = useMemo(() => {
    const t = new VideoTexture(video);
    t.colorSpace = SRGBColorSpace;
    // v runs bottom → top: show rows [top, bottom] of the frame.
    t.repeat.set(1, span);
    t.offset.set(0, 1 - bottom);
    return t;
  }, [video, span, bottom]);
  const mask = useMemo(() => roundedMask(aspect), [aspect]);
  useEffect(() => () => texture.dispose(), [texture]);

  // Size comes from fitStage (resting camera distance — the dolly must not
  // resize it). The invisible mat is a safety margin inside the clear gap.
  const margin = pad * 0.6;
  const matW = h * aspect + margin * 2;
  const matH = h + margin * 2;
  const mat = useMemo(() => matTexture(matW / matH, margin / h), [matW, matH, margin, h]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const d = Math.min(dt, 1 / 20);
    const p = portfolioState.intro;
    // Faces the camera; a slight pointer-led tilt sells the depth.
    m.rotation.y = MathUtils.damp(m.rotation.y, portfolioState.pointer.x * 0.08 * (1 - p), 3, d);
    m.rotation.x = MathUtils.damp(m.rotation.x, portfolioState.pointer.y * 0.05 * (1 - p), 3, d);
    m.visible = p < INTRO.swap;
  });

  return (
    // Film + mat are drawn after the ring and ignore depth: the ring always
    // passes behind them with a clear margin, never across the film.
    <mesh ref={ref} renderOrder={3}>
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial
        map={texture}
        alphaMap={mask}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
      <mesh renderOrder={2} position={[0, 0, -0.01]}>
        <planeGeometry args={[matW, matH]} />
        <meshBasicMaterial map={mat} transparent depthTest={false} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
    </mesh>
  );
}

/**
 * The Press point-cloud ring, centred and nearly face-on around the film.
 * Its spin turns it within its own plane, so the opening never closes in on
 * the film. Rendered as authored (black points).
 */
function Ring({ size, portrait }: { size: number; portrait: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = Math.min(dt, 1 / 20);
    const p = portfolioState.intro;
    g.rotation.y = MathUtils.damp(g.rotation.y, 0.35 + p * 1.1, 3, d);
    g.visible = p < INTRO.swap;
  });
  return (
    <group rotation={[RING_TILT, 0, 0]}>
      <group ref={ref}>
        <PointCloudModel size={size} pointSize={portrait ? 0.022 : 0.03} />
      </group>
    </group>
  );
}

/** Scroll-driven cloud tunnel in front of the camera. */
function Clouds({ portrait }: { portrait: boolean }) {
  const camera = useThree((s) => s.camera);
  const texture = useMemo(() => cloudTexture(), []);
  const count = portrait ? 46 : 80;
  const seeds = useMemo(() => {
    let s = 3;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: count }, () => ({
      x: r() * 2 - 1,
      y: r() * 2 - 1,
      d: r(),
      size: 0.8 + r() * 0.9,
      rot: r() * Math.PI * 2,
    }));
  }, [count]);
  const refs = useRef<(Sprite | null)[]>([]);
  const forward = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const p = portfolioState.intro;
    const amount =
      smooth(INTRO.cloudsIn[0], INTRO.cloudsIn[1], p) * (1 - smooth(INTRO.cloudsOut[0], INTRO.cloudsOut[1], p));
    const travel = smooth(INTRO.cloudsIn[0], INTRO.cloudsOut[1], p) * 2.4;
    camera.getWorldDirection(forward);
    seeds.forEach((sd, i) => {
      const s = refs.current[i];
      if (!s) return;
      const mat = s.material as SpriteMaterial;
      // Distance in front of the camera shrinks as you scroll: you fly in.
      const dist = 0.35 + (1 - ((sd.d + travel) % 1)) * 7;
      const fade = smooth(0.35, 1.3, dist) * (1 - smooth(5.6, 7.35, dist));
      mat.opacity = amount * fade;
      mat.color.copy(CLOUD);
      s.visible = mat.opacity > 0.005;
      const spread = portrait ? 0.3 : 0.5;
      s.position.copy(camera.position).addScaledVector(forward, dist);
      s.position.x += sd.x * spread * dist * 1.4;
      s.position.y += sd.y * spread * dist * 0.7;
      // The view at distance d is ~0.57·d tall: keep each puff ≈ a quarter of it.
      s.scale.setScalar(dist * sd.size * (portrait ? 0.2 : 0.24));
      mat.rotation = sd.rot + travel * 0.4;
    });
  });

  return (
    <>
      {seeds.map((_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          renderOrder={10}
        >
          <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} fog={false} opacity={0} />
        </sprite>
      ))}
    </>
  );
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20);
    const p = portfolioState.intro;
    const k = smooth(INTRO.dolly[0], INTRO.dolly[1], p);
    const z = mix(CAM_Z, NEAR_Z, k * k * (3 - 2 * k));
    const settle = 1 - k;
    camera.position.x = MathUtils.damp(camera.position.x, portfolioState.pointer.x * 0.3 * settle, 3, d);
    camera.position.y = MathUtils.damp(camera.position.y, -portfolioState.pointer.y * 0.18 * settle, 3, d);
    camera.position.z = MathUtils.damp(camera.position.z, z, 6, d);
    // Aim at the film itself: it stays dead centre while the ring parallaxes.
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ video, note }: { video: HTMLVideoElement | null; note?: StageRect | null }) {
  const size = useThree((s) => s.size);
  const fit = fitStage(size.width, size.height, filmAspect(video), note);
  const portrait = fit.portrait;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, CAM_Z]} fov={FOV} near={0.05} far={80} />
      <fog attach="fog" args={["#ffffff", 9, 30]} />
      <CameraRig />
      <Suspense fallback={null}>
        <Ring size={fit.ring} portrait={portrait} />
      </Suspense>
      {video && <VideoPlane video={video} h={fit.film} pad={fit.pad} />}
      <Clouds portrait={portrait} />
    </>
  );
}

/** Portfolio intro stage: The Press ring + the intro film + clouds. */
export default function IntroScene({
  video,
  note,
  active = true,
}: {
  video: HTMLVideoElement | null;
  /** The intro note's box: the ring is sized to stay clear of it. */
  note?: StageRect | null;
  active?: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene video={video} note={note} />
    </Canvas>
  );
}
