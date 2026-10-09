"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, Group, Points, PointsMaterial, Vector3 } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { ABOUT_MODEL } from "./aboutModel";

type Props = Omit<ThreeElements["group"], "ref"> & {
  /** Normalised size: the model's largest dimension in scene units. */
  size?: number;
  /** Point size in world units (size-attenuated). */
  pointSize?: number;
};

/**
 * Loads the About point cloud, centres it and normalises its size. Points
 * keep their authored vertex colours; only the render material (point size,
 * attenuation, soft edges) is set so it reads well at any distance.
 */
export function PointCloudModel({ size = 4, pointSize = 0.02, ...props }: Props) {
  const { scene } = useGLTF(ABOUT_MODEL.url);

  const object = useMemo(() => {
    const inner = scene.clone(true);
    const root = new Group();
    root.add(inner);
    root.updateMatrixWorld(true);
    const box = new Box3().setFromObject(inner);
    const dims = box.getSize(new Vector3());
    inner.position.sub(box.getCenter(new Vector3()));
    root.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z));

    const material = new PointsMaterial({
      size: pointSize,
      // Soft round sprites instead of hard squares (noticeable up close).
      map: dotTexture(),
      alphaTest: 0.35,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    inner.traverse((o) => {
      if (o instanceof Points) o.material = material;
    });
    return root;
  }, [scene, size, pointSize]);

  return (
    <group {...props}>
      <primitive object={object} />
    </group>
  );
}

/** Small radial-gradient sprite used as the point shape. */
export function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

useGLTF.preload(ABOUT_MODEL.url);
