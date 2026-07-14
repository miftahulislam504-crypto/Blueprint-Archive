import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { mulberry32 } from '@/lib/noise/mulberry32';

interface NoisyIcosahedronOptions {
  radius: number;
  /** Icosahedron subdivision level. 0 = 20 faces (angular/gem-like), higher = smoother/rounder. */
  detail: number;
  seed: number;
  /** How zoomed-in the noise field is. Smaller = broader bumps, larger = busier/craggier. */
  noiseScale: number;
  /** How far vertices get pushed, as a fraction of radius. */
  noiseStrength: number;
}

/**
 * Builds a one-off displaced-icosahedron BufferGeometry. This runs once
 * (wrap it in useMemo at the call site) — the shape doesn't need to be
 * recomputed per frame, only regenerated if its seed/params change.
 */
export function createNoisyIcosahedron({
  radius,
  detail,
  seed,
  noiseScale,
  noiseStrength,
}: NoisyIcosahedronOptions): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const noise3D = createNoise3D(mulberry32(seed));
  const posAttr = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);

    // Sample noise at the vertex's own (pre-displacement) position, so
    // neighboring vertices — which start close together — sample similar
    // noise values and displace by similar amounts. That's what keeps the
    // surface a continuous bumpy blob instead of jagged per-vertex noise.
    const n = noise3D(
      vertex.x * noiseScale,
      vertex.y * noiseScale,
      vertex.z * noiseScale
    );

    // Push each vertex along its own direction from center — works well
    // here specifically because the base shape is roughly spherical, so
    // "outward from center" is a sensible displacement direction everywhere.
    vertex.multiplyScalar(1 + n * noiseStrength);
    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  posAttr.needsUpdate = true;
  // Required after manually moving vertices — otherwise lighting uses the
  // original (undisplaced) normals and the surface looks subtly wrong,
  // like a bumpy shape lit as if it were still smooth.
  geometry.computeVertexNormals();

  return geometry;
}
