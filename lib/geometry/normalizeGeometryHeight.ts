import * as THREE from 'three';

/**
 * Uniformly rescales a geometry in place so its Y-extent (height) becomes
 * exactly `targetHeight`, and returns it. FBX2glTF exports from this
 * project's asset pipeline consistently come out tiny in raw vertex units
 * — their real intended scale gets baked into the *node's* transform
 * instead, which is lost the moment a caller pulls out `.geometry` alone,
 * as CrystalTree/CrystalScatter/CrystalCore all do. Normalizing once here
 * means consumers can keep their own scale props/expressions calibrated
 * against a sane, predictable baseline instead of each needing to know
 * the source file's particular raw dimensions.
 *
 * useGLTF caches by URL, so every component using the same model path
 * shares the exact same BufferGeometry instance — this can end up called
 * once per component instance that uses it. Marked via userData so a
 * geometry already normalized (by an earlier instance) is left alone
 * rather than re-measuring an already-corrected shape and applying a
 * second, redundant scale on top.
 */
export function normalizeGeometryHeight(
  geometry: THREE.BufferGeometry,
  targetHeight = 1
): THREE.BufferGeometry {
  if (geometry.userData.heightNormalized) return geometry;

  geometry.computeBoundingBox();
  const size = geometry.boundingBox?.getSize(new THREE.Vector3());

  if (size && size.y > 0) {
    const factor = targetHeight / size.y;
    geometry.scale(factor, factor, factor);
  }

  geometry.userData.heightNormalized = true;
  return geometry;
}
