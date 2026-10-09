"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Bright, soft "studio" lighting. The environment is built from
 * Lightformers (no HDR download), with faint blue rims that echo
 * the brand palette in the cover reflections.
 */
export function StudioLights({ castShadow = true }: { castShadow?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 6]}
        intensity={1.8}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 2, -4]} intensity={0.6} color="#bcd0ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 4]} scale={[10, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 0, 2]} scale={[2, 8, 1]} color="#dfe8ff" target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} position={[5, 1, 1]} scale={[2, 8, 1]} color="#eef2ff" target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={0.8} position={[0, -4, 3]} scale={4} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.6} position={[-2, 3, -5]} scale={3} color="#1f4fe0" target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.5} position={[3, -2, -5]} scale={3} color="#7d9bff" target={[0, 0, 0]} />
      </Environment>
    </>
  );
}
