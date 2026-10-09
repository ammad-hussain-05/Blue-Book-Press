"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, PerspectiveCamera } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  MathUtils,
  Vector3,
  type Group,
  type PerspectiveCamera as PerspectiveCameraImpl,
  type Points,
} from "three";
import { dotTexture, PointCloudModel } from "./PointCloudModel";
import { MODEL_SIZE, tour, tourState, type TourKey, type V3 } from "./tour";

const FOLLOW = 3.4;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp3 = (out: Vector3, a: V3, b: V3, t: number) =>
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);

/**
 * Scroll-driven camera rig. Each segment between keyframes holds at both
 * ends (smoothstep 0.16 → 0.84), so every step settles before the camera
 * travels on. All motion is damped for a weighty, cinematic feel.
 */
function TourRig({ model }: { model: React.RefObject<Group | null> }) {
  const camera = useThree((s) => s.camera) as PerspectiveCameraImpl;
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  const goalCam = useMemo(() => new Vector3(), []);
  const goalTarget = useMemo(() => new Vector3(), []);
  const goalRot = useMemo(() => new Vector3(), []);
  const lookAt = useRef(new Vector3(...tour[0].target));
  const tmp = useMemo(() => new Vector3(), []);

  useFrame((_, dt) => {
    const delta = Math.min(dt, 1 / 20);
    const s = tourState.progress * (tour.length - 1);
    const i = Math.min(tour.length - 2, Math.floor(s));
    const k = smoothstep(0.16, 0.84, s - i);
    const a: TourKey = tour[i];
    const b: TourKey = tour[i + 1];

    lerp3(goalCam, a.cam, b.cam, k);
    lerp3(goalTarget, a.target, b.target, k);
    lerp3(goalRot, a.rot, b.rot, k);
    let fov = a.fov + (b.fov - a.fov) * k;

    if (portrait) {
      // Mobile: keep the model centred in the upper half and pull the camera
      // back; copy sits in the lower half.
      goalTarget.x *= 0.15;
      goalTarget.y -= 1.15 + (a.mobileLift ?? 0) + ((b.mobileLift ?? 0) - (a.mobileLift ?? 0)) * k;
      tmp.copy(goalCam).sub(goalTarget).multiplyScalar(1.55);
      goalCam.copy(goalTarget).add(tmp);
      fov += 6;
    }

    // Subtle pointer parallax on the camera.
    goalCam.x += tourState.pointer.x * 0.35;
    goalCam.y += -tourState.pointer.y * 0.2;

    const damp = (c: number, t: number) => MathUtils.damp(c, t, FOLLOW, delta);
    camera.position.set(damp(camera.position.x, goalCam.x), damp(camera.position.y, goalCam.y), damp(camera.position.z, goalCam.z));
    lookAt.current.set(
      damp(lookAt.current.x, goalTarget.x),
      damp(lookAt.current.y, goalTarget.y),
      damp(lookAt.current.z, goalTarget.z),
    );
    camera.lookAt(lookAt.current);
    const nextFov = damp(camera.fov, fov);
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }

    const g = model.current;
    if (g) g.rotation.set(damp(g.rotation.x, goalRot.x), damp(g.rotation.y, goalRot.y), damp(g.rotation.z, goalRot.z));
  });

  return null;
}

/** White atmospheric depth; portrait views sit further back, so push it out. */
function FogByAspect() {
  const size = useThree((s) => s.size);
  const portrait = size.width / size.height < 0.9;
  return <fog attach="fog" args={["#ffffff", portrait ? 11 : 7, portrait ? 32 : 22]} />;
}

/** Sparse brand-blue particles around the model — scroll-driven parallax depth. */
function BlueDust({ count = 320 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    // Deterministic pseudo-random shell distribution.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + rand() * 7;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.6;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const sprite = useMemo(() => dotTexture(), []);

  useFrame((_, dt) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y = MathUtils.damp(p.rotation.y, tourState.progress * 1.4, 2.5, Math.min(dt, 1 / 20));
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial map={sprite} alphaTest={0.3} color="#1f4fe0" size={0.06} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

/** Soft radial contact shadow beneath the ribbon. */
function GroundShadow() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(11,11,12,0.55)");
    g.addColorStop(0.45, "rgba(11,11,12,0.18)");
    g.addColorStop(1, "rgba(11,11,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]} renderOrder={-1}>
      <planeGeometry args={[MODEL_SIZE * 1.6, MODEL_SIZE * 1.1]} />
      <meshBasicMaterial map={texture} transparent opacity={0.22} depthWrite={false} />
    </mesh>
  );
}

/** Full-screen About scene. Client-only (loaded via next/dynamic). */
export default function AboutScene() {
  const model = useRef<Group>(null);
  const [dpr, setDpr] = useState(1.75);

  return (
    <Canvas dpr={[1, dpr]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} fallback={null}>
      <PerspectiveCamera makeDefault position={tour[0].cam} fov={tour[0].fov} near={0.05} far={80} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      {/* White atmospheric depth: distant points fade into the page. */}
      <FogByAspect />
      <TourRig model={model} />
      <Suspense fallback={null}>
        <group ref={model}>
          <PointCloudModel size={MODEL_SIZE} pointSize={0.022} />
        </group>
        <GroundShadow />
      </Suspense>
      <BlueDust />
    </Canvas>
  );
}
