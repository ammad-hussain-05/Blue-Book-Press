"use client";

import dynamic from "next/dynamic";
import { stage } from "./stage";

const StageScene = dynamic(() => import("./StageScene"), { ssr: false, loading: () => null });

/**
 * Fixed full-screen layer that hosts the homepage 3D stage. `data-layer`
 * is flipped by the stage itself to sit in front of or behind the content.
 */
export function StageCanvas() {
  return (
    <div
      ref={(el) => {
        stage.wrapper = el;
      }}
      data-layer="front"
      aria-hidden
      className="stage-layer pointer-events-none fixed inset-0 h-lvh w-full"
    >
      <StageScene />
    </div>
  );
}
