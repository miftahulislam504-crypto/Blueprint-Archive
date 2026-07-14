import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loads a GLB, pulls out one named node, and returns a rescaled *clone* of
 * it whose world-space height matches `targetHeight` and whose base sits at
 * local y = 0 — regardless of whatever scale/pivot the source FBX→GLB
 * export happened to bake in. (Asset-pack exports are rarely consistent
 * with each other, or with this world's own unit scale — energy-tower.glb
 * and ruins-temple.glb both bake a literal ×100 node scale, a classic
 * "authored in centimeters" FBX export quirk.)
 *
 * Cloning matters because `nodes[name]` from useGLTF is one shared
 * Object3D — mounting it directly at two different positions doesn't
 * duplicate it, it just moves the one instance back and forth. Returning a
 * fresh clone per call means the same GLB/node can back several
 * independent instances (multiple towers, multiple ruin sites, etc.)
 * without them fighting over one reference.
 *
 * Deliberately returns the whole node as-is (via the caller doing
 * `<primitive object={...} />`) rather than hunting for "the" mesh the way
 * CrystalCore/CrystalTree do — those models have one material each, but
 * these ones export as multiple primitives/materials on one node (stone,
 * wood, trim...), so grabbing only the first mesh would silently drop the
 * rest of the model.
 */
export function useNormalizedGLTFNode(
  path: string,
  nodeName: string,
  targetHeight: number
): THREE.Object3D {
  const { nodes } = useGLTF(path) as unknown as { nodes: Record<string, THREE.Object3D> };

  return useMemo(() => {
    const source = nodes[nodeName];
    if (!source) {
      throw new Error(`useNormalizedGLTFNode: no node named "${nodeName}" in ${path}`);
    }

    const clone = source.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Measured on the clone before any further rescale, so this reflects
    // whatever the source already had baked in (e.g. that ×100).
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());

    if (size.y > 0) {
      const scaleFactor = targetHeight / size.y;
      clone.scale.multiplyScalar(scaleFactor);
      // Ground it: shift so the *bottom* of the bounding box lands at
      // local y = 0, not wherever the model's own pivot happened to be.
      // box.min.y is in the pre-multiply space, so it scales by the same
      // factor — cheaper than recomputing the box after the rescale.
      clone.position.y -= box.min.y * scaleFactor;
    }

    return clone;
  }, [nodes, nodeName, targetHeight, path]);
}
