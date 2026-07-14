'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { CrystalMountain } from './CrystalMountain';
import { createNoisyIcosahedron } from '@/lib/geometry/createNoisyIcosahedron';

interface CaveProps {
  position?: [number, number, number];
  rotationY?: number;
  /** Overall scale — rock chunks, mouth, and tunnel all scale off this one knob. */
  size?: number;
  seed?: number;
  rockColor?: string;
  rockEmissiveColor?: string;
  /** Small crystal cluster glowing just inside the mouth — dimmer than
   *  EnergyTower's, closer to AncientRuins': "something's in there,"
   *  not "this is actively powered." */
  glow?: boolean;
  glowColor?: string;
}

/**
 * No CSG/boolean-subtraction library in this project, so rather than
 * literally cutting a hole into one rock mass, this frames an opening the
 * way a lot of real cave mouths actually look: several jagged rock chunks
 * — reusing CrystalMountain, not new geometry — clustered with a gap
 * between them, and a dark tapering tunnel sitting in that gap. Viewed
 * from the path, the effect reads the same either way, without needing a
 * dependency this project has no way to verify builds correctly without
 * a real npm install.
 *
 * No floating-rock plinth underneath, unlike EnergyTower/AncientRuins —
 * this IS a rock mass already (like CrystalMountain, which doesn't get one
 * either), not a built structure that needs something to visibly rest on.
 * Static, no bob animation, same reasoning: that's a FloatingIsland thing,
 * not a CrystalMountain-family thing.
 */
export function Cave({
  position = [0, 0, 0],
  rotationY = 0,
  size = 1,
  seed = 41,
  rockColor = '#3a3480',
  rockEmissiveColor = '#5CE1FF',
  glow = true,
  glowColor = '#5CE1FF',
}: CaveProps) {
  const tunnelDepth = size * 3.2;

  // Tapers from a wide mouth down to almost a point, for a "recedes into
  // infinite darkness" read rather than visibly dead-ending.
  const tunnelGeometry = useMemo(() => {
    const mouthRadius = size * 0.85;
    return new THREE.CylinderGeometry(mouthRadius, mouthRadius * 0.35, tunnelDepth, 9, 1, true);
  }, [size, tunnelDepth]);

  // BackSide, not the default FrontSide: CylinderGeometry's walls are
  // wound to be seen from outside, like a solid rod. Looking INTO its open
  // end needs the faces default culling would normally hide — the same
  // reason a skybox sphere is always rendered BackSide.
  const tunnelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#07060c',
        roughness: 1,
        metalness: 0,
        side: THREE.BackSide,
      }),
    []
  );

  // Same helper as CrystalMountain/FloatingPlatforms, a 4th variation:
  // detail 0 + strong noiseStrength again, but much smaller — a rough
  // crystal shard rather than a landmark-scale rock.
  const crystalGeometry = useMemo(
    () =>
      createNoisyIcosahedron({
        radius: size * 0.22,
        detail: 0,
        seed: seed + 500,
        noiseScale: 0.9,
        noiseStrength: 0.6,
      }),
    [size, seed]
  );

  const crystalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4B3F9E',
        emissive: glowColor,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.2,
        flatShading: true,
        toneMapped: false,
      }),
    [glowColor]
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Left, right, and a lintel across the top frame the gap; a
          smaller filler piece behind them breaks up what would otherwise
          be three obviously-identical blobs. */}
      <CrystalMountain
        position={[-size * 1.6, -size * 0.3, size * 0.3]}
        radius={size * 1.4}
        seed={seed}
        color={rockColor}
        emissiveColor={rockEmissiveColor}
      />
      <CrystalMountain
        position={[size * 1.7, -size * 0.2, size * 0.2]}
        radius={size * 1.6}
        seed={seed + 1}
        color={rockColor}
        emissiveColor={rockEmissiveColor}
      />
      <CrystalMountain
        position={[size * 0.1, size * 1.6, size * 0.1]}
        radius={size * 1.5}
        seed={seed + 2}
        color={rockColor}
        emissiveColor={rockEmissiveColor}
      />
      <CrystalMountain
        position={[-size * 0.4, size * 0.9, -size * 0.5]}
        radius={size * 0.9}
        seed={seed + 3}
        color={rockColor}
        emissiveColor={rockEmissiveColor}
      />

      {/* The opening itself. Rotating a cylinder 90° about X turns its
          original top (radiusTop end) into local +Z and its original
          bottom into local -Z; offsetting position by -tunnelDepth/2 on
          top of that lands the wide mouth at this group's own origin
          (z=0, right where the rock cluster above is centered) and the
          narrow far end at z=-tunnelDepth, receding straight back. */}
      <mesh
        geometry={tunnelGeometry}
        material={tunnelMaterial}
        position={[0, 0, -tunnelDepth * 0.5]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {glow && (
        <>
          <mesh
            geometry={crystalGeometry}
            material={crystalMaterial}
            position={[size * 0.3, -size * 0.3, -tunnelDepth * 0.35]}
          />
          <mesh
            geometry={crystalGeometry}
            material={crystalMaterial}
            position={[-size * 0.25, -size * 0.35, -tunnelDepth * 0.45]}
            rotation={[0, Math.PI * 0.6, 0]}
          />
          <pointLight
            color={glowColor}
            position={[0, -size * 0.2, -tunnelDepth * 0.4]}
            intensity={0.45}
            distance={size * 3}
            decay={2}
          />
        </>
      )}
    </group>
  );
}
