'use client';

import { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoisyIcosahedron } from '@/lib/geometry/createNoisyIcosahedron';
import { mulberry32 } from '@/lib/noise/mulberry32';
import { useWorldStore } from '@/stores/useWorldStore';

interface FloatingPlatformsProps {
  center?: [number, number, number];
  /** Roughly how far from center instances scatter. */
  radius?: number;
  count?: number;
  seed?: number;
  color?: string;
  emissiveColor?: string;
  /** Base size of each platform's own rock, before the flattening squash
   *  below — passed straight to createNoisyIcosahedron as its `radius`. */
  platformSize?: number;
}

interface PlatformInstance {
  basePosition: THREE.Vector3;
  bobAmplitude: number;
  bobSpeed: number;
  bobOffset: number;
  spinSpeed: number;
  scale: number;
}

/**
 * Small flattened rock slabs drifting through the world — a third rock
 * "type" alongside FloatingIsland (one big boulder landmark, detail 1) and
 * CrystalMountain (big jagged background peaks, detail 0). Same
 * createNoisyIcosahedron helper both of those already use, just squashed
 * flat on Y afterward.
 *
 * Numerous and small rather than a single focal point — call this several
 * times at different points along the journey (same pattern as
 * CrystalMountain being placed twice), rather than passing one big list of
 * clusters into a single call.
 */
export function FloatingPlatforms({
  center = [0, 0, 0],
  radius = 6,
  count = 10,
  seed = 1,
  color = '#3a3550',
  emissiveColor = '#5CE1FF',
  platformSize = 1,
}: FloatingPlatformsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Bobbing/spinning N instances every frame costs more than FloatingIsland's
  // single-object version of the same idea, so — unlike FloatingIsland —
  // this skips the per-frame animation on 'low' tier. Instances still get
  // positioned correctly by the layout effect below either way, just static.
  //
  // Deliberately NOT reducing `count` itself by tier here — CrystalScatter/
  // CrystalForest don't do that yet either, and adding it to only this one
  // component would be an inconsistent half-measure. That's the dedicated
  // Performance phase's job, applied to all of these at once.
  const quality = useWorldStore((s) => s.qualityTier);
  const animated = quality !== 'low';

  const geometry = useMemo(() => {
    const geo = createNoisyIcosahedron({
      radius: platformSize,
      detail: 1,
      seed,
      noiseScale: 0.7,
      noiseStrength: 0.3,
    });
    // Flattens the boulder into a slab. Baked into the geometry itself
    // (not the instance matrix) since every instance in this cluster
    // shares one geometry — per-instance variety comes from position/
    // rotation/scale in the instance matrix instead.
    geo.scale(1, 0.22, 1);
    return geo;
  }, [platformSize, seed]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.25,
        roughness: 0.8,
        metalness: 0.15,
        toneMapped: false,
      }),
    [color, emissiveColor]
  );

  const instances = useMemo<PlatformInstance[]>(() => {
    const rand = mulberry32(seed + 1000);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const dist = radius * (0.3 + rand() * 0.7);
      const height = (rand() - 0.5) * radius * 0.6;

      return {
        basePosition: new THREE.Vector3(
          center[0] + Math.cos(angle) * dist,
          center[1] + height,
          center[2] + Math.sin(angle) * dist
        ),
        bobAmplitude: 0.1 + rand() * 0.15,
        bobSpeed: 0.15 + rand() * 0.2,
        bobOffset: rand() * Math.PI * 2,
        spinSpeed: (rand() - 0.5) * 0.15,
        scale: 0.5 + rand() * 0.9,
      };
    });
  }, [center, radius, count, seed]);

  // One-time placement — matters on its own for 'low' tier, where the
  // useFrame below bails out and this is the only thing positioning them.
  // Mirrors CrystalScatter's own layout-effect pattern (plain for-loop, not
  // .forEach — meshRef.current's null-check needs to stay in the same
  // function scope as the loop body for TS to carry the narrowing through).
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.copy(inst.basePosition);
      dummy.rotation.set(0, inst.bobOffset, 0);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances, dummy]);

  useFrame((state) => {
    if (!animated || !meshRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.copy(inst.basePosition);
      dummy.position.y += Math.sin(t * inst.bobSpeed + inst.bobOffset) * inst.bobAmplitude;
      dummy.rotation.set(0, inst.bobOffset + t * inst.spinSpeed, 0);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
}
