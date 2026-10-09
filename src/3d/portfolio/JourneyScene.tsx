"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type LineBasicMaterial,
  type Mesh,
} from "three";
import { coverUrl } from "@/data/portfolio";
import { StudioLights } from "../StudioLights";
import { journeyStages, mix, portfolioState, smooth } from "./portfolioState";

const COVER = "mind-to-bend";
const BW = 1.32;
const BH = 2;
const BD = 0.16;

/** Rectangle outlines as one LineSegments geometry. */
function rects(list: [number, number][], cross = false) {
  const pts: number[] = [];
  for (const [w, h] of list) {
    const x = w / 2;
    const y = h / 2;
    pts.push(-x, -y, 0, x, -y, 0, x, -y, 0, x, y, 0, x, y, 0, -x, y, 0, -x, y, 0, -x, -y, 0);
  }
  if (cross) pts.push(-BW / 2, 0, 0, BW / 2, 0, 0, 0, -BH / 2, 0, 0, BH / 2, 0);
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
  return g;
}

function Journey() {
  const cover = useTexture(coverUrl(COVER));
  useMemo(() => (cover.colorSpace = SRGBColorSpace), [cover]);

  const book = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const guides = useRef<LineBasicMaterial>(null);
  const formats = useRef<Group>(null);

  const mats = useMemo(() => {
    const m = (o: ConstructorParameters<typeof MeshStandardMaterial>[0]) =>
      new MeshStandardMaterial({ transparent: true, ...o });
    const front = m({ map: cover, roughness: 0.4 });
    return {
      front,
      all: [
        m({ color: "#f1f0ec", roughness: 0.85 }),
        m({ color: "#0b0b0c" }),
        m({ color: "#f1f0ec" }),
        m({ color: "#f1f0ec" }),
        front,
        m({ color: "#101114" }),
      ],
    };
  }, [cover]);
  const formatMats = useMemo(
    () => [
      new MeshBasicMaterial({ map: cover, transparent: true, toneMapped: false }),
      new MeshBasicMaterial({ map: cover, transparent: true, toneMapped: false }),
    ],
    [cover],
  );
  const guideGeo = useMemo(
    () =>
      rects(
        [
          [BW * 1.08, BH * 1.06],
          [BW, BH],
          [BW * 0.84, BH * 0.88],
        ],
        true,
      ),
    [],
  );
  const tabletGeo = useMemo(() => rects([[1.0, 1.42]]), []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20);
    const q = portfolioState.journey;
    const { design, produce, publish } = journeyStages(q);

    // Cover paints in, then gains depth, then takes the stage.
    mats.front.opacity = mix(0.12, 1, design);
    mats.all.forEach((m, i) => i !== 4 && (m.opacity = mix(0, 1, produce)));
    if (body.current) body.current.scale.z = mix(0.04, 1, produce);
    if (guides.current) guides.current.opacity = 0.9 * smooth(0, 0.06, q) * (1 - produce);

    const g = book.current;
    if (g) {
      const x = mix(mix(0, 0.62, produce), 0, publish);
      const ry = mix(mix(0, -0.5, produce), -0.35 + q * 0.5, publish);
      g.position.x = MathUtils.damp(g.position.x, x, 5, d);
      g.position.y = MathUtils.damp(g.position.y, mix(0, 0.12, publish), 5, d);
      g.rotation.y = MathUtils.damp(g.rotation.y, ry, 5, d);
      g.rotation.x = MathUtils.damp(g.rotation.x, mix(0, 0.06, produce), 5, d);
    }
    const fo = produce * (1 - smooth(0.66, 0.8, q));
    formatMats.forEach((m) => (m.opacity = fo));
    if (formats.current) {
      formats.current.visible = fo > 0.01;
      formats.current.position.x = mix(-0.6, -1.25, produce);
    }
  });

  return (
    <>
      <group ref={book}>
        <mesh ref={body} material={mats.all}>
          <boxGeometry args={[BW, BH, BD]} />
        </mesh>
        {/* trim / bleed / safe guides on the cover */}
        <lineSegments geometry={guideGeo} position={[0, 0, BD / 2 + 0.004]}>
          <lineBasicMaterial ref={guides} color="#1f4fe0" transparent opacity={0} />
        </lineSegments>
      </group>

      {/* other formats: e-book + audiobook */}
      <group ref={formats} position={[-1.25, 0, 0.2]} visible={false}>
        <group position={[0, 0.45, 0]} rotation={[0, 0.35, 0]}>
          <lineSegments geometry={tabletGeo}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </lineSegments>
          <mesh material={formatMats[0]} position={[0, 0, -0.001]}>
            <planeGeometry args={[0.86, 1.28]} />
          </mesh>
        </group>
        <mesh material={formatMats[1]} position={[0.05, -0.85, 0]} rotation={[0, 0.35, 0]}>
          <planeGeometry args={[0.62, 0.62]} />
        </mesh>
      </group>
    </>
  );
}

export default function JourneyScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0.35, 6]} fov={36} />
      <StudioLights castShadow={false} />
      <pointLight position={[-3, 2, 3]} intensity={12} color="#1f4fe0" distance={12} />
      <pointLight position={[3, 1, 3]} intensity={8} color="#ffffff" distance={12} />
      <Suspense fallback={null}>
        <Journey />
      </Suspense>
    </Canvas>
  );
}
