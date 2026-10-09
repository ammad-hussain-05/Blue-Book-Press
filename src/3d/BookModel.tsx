"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector3, type Material } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { models, modelUrl, type ModelId } from "@/data/models";

type Props = Omit<ThreeElements["group"], "ref"> & {
  model: ModelId;
  /** Normalised height in scene units. */
  height?: number;
};

/**
 * Loads a GLB, re-orients it, centres it and scales it to a known height so
 * every model behaves identically in the choreography. Each instance clones
 * the scene + materials, so one file can appear in several places at once.
 */
export function BookModel({ model, height = 1, ...props }: Props) {
  const { scene } = useGLTF(modelUrl(model));

  const object = useMemo(() => {
    const def = models[model];
    const inner = scene.clone(true);
    inner.rotation.set(...def.fix);
    const root = new Group();
    root.add(inner);
    root.updateMatrixWorld(true);

    const box = new Box3().setFromObject(inner);
    const size = box.getSize(new Vector3());
    inner.position.sub(box.getCenter(new Vector3()));
    root.scale.setScalar(1 / size.y);

    const swap = (source: Material) => {
      const m = source.clone();
      if (m instanceof MeshStandardMaterial) {
        m.envMapIntensity = 1.1;
        if (m.map) {
          // Cover artwork: keep colours true and give the print a satin finish.
          m.map.colorSpace = SRGBColorSpace;
          m.map.anisotropy = 8;
          m.roughness = Math.min(m.roughness, 0.55);
          m.metalness = 0;
        }
      }
      return m;
    };

    inner.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
    });
    return root;
  }, [scene, model]);

  return (
    <group {...props}>
      <group scale={height}>
        <primitive object={object} />
      </group>
    </group>
  );
}

export function preloadBookModels() {
  (Object.keys(models) as ModelId[]).forEach((id) => useGLTF.preload(modelUrl(id)));
}
