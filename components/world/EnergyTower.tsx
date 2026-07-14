'use client';

import { useGLTF } from '@react-three/drei';
import { useNormalizedGLTFNode } from '@/lib/hooks/useNormalizedGLTFNode';
import { FloatingIsland } from './FloatingIsland';

const MODEL_PATH = '/models/energy-tower.glb';
const NODE_NAME = 'WatchTower_SecondAge_Level3';

interface EnergyTowerProps {
  position?: [number, number, number];
  /** Target world-space height in units. The source asset's own baked
   *  scale isn't meaningful on its own — see useNormalizedGLTFNode — so
   *  this is the real "how big is this thing" control. */
  height?: number;
  rotationY?: number;
  /** Small procedural rock chunk underneath, reusing the same displaced-
   *  icosahedron look every other floating landmark in this world sits
   *  on. Set false if you'd rather rest this against something else
   *  already in the scene (e.g. a CrystalMountain slope). */
  withBase?: boolean;
  baseSeed?: number;
  /** Cyan point light near the top — this is what actually reads as
   *  "energy tower" rather than just "stone tower," tying the mundane
   *  stone/wood asset into the rest of the crystal-energy palette. */
  glow?: boolean;
  glowColor?: string;
}

/**
 * The model file has been in public/models since early on, but nothing
 * ever rendered it — this is that missing piece. Position/height below
 * are a first pass for the currently-bare stretch of the journey; nudge
 * once actually seen rendered, same as everything else placed this way.
 */
export function EnergyTower({
  position = [0, 0, 0],
  height = 3.4,
  rotationY = 0,
  withBase = true,
  baseSeed = 11,
  glow = true,
  glowColor = '#5CE1FF',
}: EnergyTowerProps) {
  const tower = useNormalizedGLTFNode(MODEL_PATH, NODE_NAME, height);
  const baseRadius = height * 0.35;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {withBase && (
        <FloatingIsland
          position={[0, -baseRadius * 0.8, 0]}
          radius={baseRadius}
          seed={baseSeed}
          floatAmplitude={0.08}
        />
      )}

      <primitive object={tower} />

      {glow && (
        <pointLight
          color={glowColor}
          position={[0, height * 0.85, 0]}
          intensity={1.2}
          distance={5}
          decay={2}
        />
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
