'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoisyIcosahedron } from '@/lib/geometry/createNoisyIcosahedron';

interface FloatingIslandProps {
  position?: [number, number, number];
  radius?: number;
  /** Any integer. Same seed always produces the same shape. */
  seed?: number;
  color?: string;
  /** Icosahedron subdivision — 0-1 reads as angular/gem-like rock, 2+ reads smoother/more boulder-like. */
  detail?: number;
  noiseScale?: number;
  noiseStrength?: number;
  /** Vertical bob amplitude — set to 0 for a static island. */
  floatAmplitude?: number;
}

export function FloatingIsland({
  position = [0, 0, 0],
  radius = 2,
  seed = 1,
  color = '#3a3550',
  detail = 1,
  noiseScale = 0.6,
  noiseStrength = 0.35,
  floatAmplitude = 0.15,
}: FloatingIslandProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Random-looking but fixed per island: derived from the seed so islands
  // with different seeds also bob out of phase with each other.
  const floatOffset = useMemo(() => (seed * 137.5) % (Math.PI * 2), [seed]);

  const geometry = useMemo(
    () => createNoisyIcosahedron({ radius, detail, seed, noiseScale, noiseStrength }),
    [radius, detail, seed, noiseScale, noiseStrength]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.1,
        flatShading: detail === 0,
      }),
    [color, detail]
  );

  useFrame((state) => {
    if (!groupRef.current || floatAmplitude === 0) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.3 + floatOffset) * floatAmplitude;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  );
}
