"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, PerspectiveCamera } from "@react-three/drei";
import { useUI } from "@/lib/uiStore";
import { StageBooks } from "./StageBooks";
import { StudioLights } from "./StudioLights";
import { preloadBookModels } from "./BookModel";

preloadBookModels();

/** Pauses rendering while the full-screen menu covers the stage. */
function FrameloopController() {
  const menuOpen = useUI((s) => s.menuOpen);
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    setFrameloop(menuOpen ? "never" : "always");
  }, [menuOpen, setFrameloop]);
  return null;
}

/** The fixed, full-viewport homepage stage. Client-only (see `StageCanvas`). */
export default function StageScene() {
  const [dpr, setDpr] = useState(1.75);

  return (
    <Canvas
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows="percentage"
      fallback={null}
      style={{ pointerEvents: "none" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={30} near={0.1} far={60} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      <FrameloopController />
      <StudioLights />
      <Suspense fallback={null}>
        <StageBooks />
      </Suspense>
    </Canvas>
  );
}
