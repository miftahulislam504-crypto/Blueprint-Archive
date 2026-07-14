'use client';

import { useRef, useLayoutEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/noise/mulberry32';
import { normalizeGeometryHeight } from '@/lib/geometry/normalizeGeometryHeight';

interface CrystalScatterProps {
  /** Defaults to the thin-shard crystal — reads better repeated many times than the detailed hero one. */
  modelPath?: string;
  count?: number;
  center?: [number, number, number];
  /** Roughly how far from center instances scatter. */
  radius?: number;
  seed?: number;
  color?: string;
  emissiveColor?: string;
  scaleRange?: [number, number];
}

/**
 * Scatters instances in a rough ring/shell around `center` — an
 * approximation of "sitting on the island's surface," not a true raycast
 * onto the island's actual (noisy) geometry. Good enough to read as
 * "crystals growing out of the rock" at the distances/speeds this world
 * is viewed at; revisit with real surface raycasting if it ever needs to
 * hold up to close inspection.
 */
export function CrystalScatter({
  modelPath = '/models/crystal-spike-alt.glb',
  count = 24,
  center = [0, 0, 0],
  radius = 2.5,
  seed = 1,
  color = '#4B3F9E',
  emissiveColor = '#5CE1FF',
  scaleRange = [0.15, 0.4],
}: CrystalScatterProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { nodes } = useGLTF(modelPath) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };

  const geometry = useMemo(() => {
    const key = Object.keys(nodes).find((k) => (nodes[k] as THREE.Mesh).isMesh);
    return key ? normalizeGeometryHeight(nodes[key].geometry) : null;
  }, [nodes]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.2,
        toneMapped: false,
      }),
    [color, emissiveColor]
  );

  useLayoutEffect(() => {
    if (!meshRef.current || !geometry) return;
    const rand = mulberry32(seed);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = radius * (0.6 + rand() * 0.4);
      const height = (rand() - 0.5) * radius * 0.3;

      dummy.position.set(
        center[0] + Math.cos(angle) * dist,
        center[1] + height,
        center[2] + Math.sin(angle) * dist
      );
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      const scale = scaleRange[0] + rand() * (scaleRange[1] - scaleRange[0]);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, center, radius, seed, geometry, scaleRange]);

  if (!geometry) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
}
