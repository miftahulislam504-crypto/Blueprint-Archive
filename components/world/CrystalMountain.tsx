'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { createNoisyIcosahedron } from '@/lib/geometry/createNoisyIcosahedron';

interface CrystalMountainProps {
  position?: [number, number, number];
  /** These get big — this is meant to read as background/mid-ground scenery, not a close-up prop. */
  radius?: number;
  seed?: number;
  color?: string;
  emissiveColor?: string;
}

export function CrystalMountain({
  position = [0, 0, 0],
  radius = 6,
  seed = 1,
  color = '#3a3480',
  emissiveColor = '#5CE1FF',
}: CrystalMountainProps) {
  // detail: 0 keeps the icosahedron's original sharp angular faces rather
  // than subdividing them smoother — that's what makes this read as
  // faceted crystal rather than a rounded boulder like FloatingIsland.
  // noiseStrength is also higher, for a jagged rather than gently-bumpy profile.
  const geometry = useMemo(
    () =>
      createNoisyIcosahedron({
        radius,
        detail: 0,
        seed,
        noiseScale: 0.35,
        noiseStrength: 0.55,
      }),
    [radius, seed]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.35,
        roughness: 0.25,
        metalness: 0.3,
        flatShading: true,
        toneMapped: false,
      }),
    [color, emissiveColor]
  );

  return <mesh position={position} geometry={geometry} material={material} castShadow receiveShadow />;
}
