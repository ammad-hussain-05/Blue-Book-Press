"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, PerspectiveCamera } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { books, SATELLITE_BOOKS } from "@/data/books";
import { BookModel } from "./BookModel";
import { StudioLights } from "./StudioLights";

/** Same 2-top / 2-bottom arrangement as the hero satellites. */
const LAYOUT: { pos: [number, number, number]; tilt: [number, number, number] }[] = [
  { pos: [-0.75, 1.05, 0], tilt: [0.18, 0.5, 0.12] },
  { pos: [0.8, 0.85, -0.6], tilt: [-0.14, -0.6, -0.1] },
  { pos: [-0.7, -0.95, -0.4], tilt: [-0.12, 0.8, -0.08] },
  { pos: [0.75, -1.1, 0.2], tilt: [0.16, -0.4, 0.1] },
];

function RotatingBook({ index, slot }: { index: number; slot: number }) {
  const ref = useRef<Group>(null);
  const book = books[index];
  const { pos, tilt } = LAYOUT[slot];

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    // Slow 3D sway around the front cover (so the artwork stays readable),
    // each book on its own phase + entrance ease.
    const t = state.clock.elapsedTime;
    g.rotation.y = tilt[1] + Math.sin(t * 0.45 + slot * 1.3) * 0.75;
    const s = MathUtils.damp(g.scale.x, 1, 2.6, dt);
    g.scale.setScalar(s);
    g.position.y = MathUtils.damp(g.position.y, pos[1], 2.6, dt);
  });

  return (
    <group ref={ref} position={[pos[0], pos[1] - 0.6, pos[2]]} rotation={tilt} scale={0.001}>
      <Float speed={1.4} floatIntensity={0.4} rotationIntensity={0.15}>
        <BookModel model={book.model} height={1.15} />
      </Float>
    </group>
  );
}

/** Left column of the full-screen menu: the four satellite books, rotating. */
export default function MenuScene() {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} shadows="percentage">
      <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={32} />
      <StudioLights />
      <Suspense fallback={null}>
        {SATELLITE_BOOKS.map((index, slot) => (
          <RotatingBook key={index} index={index} slot={slot} />
        ))}
        <ContactShadows position={[0, -1.9, 0]} opacity={0.22} scale={6} blur={2.6} far={3} resolution={256} />
      </Suspense>
    </Canvas>
  );
}
