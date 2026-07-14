'use client';

import { useGLTF } from '@react-three/drei';
import { useNormalizedGLTFNode } from '@/lib/hooks/useNormalizedGLTFNode';
import { FloatingIsland } from './FloatingIsland';

const MODEL_PATH = '/models/ruins-temple.glb';
const NODE_NAME = 'Temple_SecondAge_Level1';

interface AncientRuinsProps {
  position?: [number, number, number];
  height?: number;
  rotationY?: number;
  withBase?: boolean;
  baseSeed?: number;
  /** Faint, low point light — reads as "something ancient still lingers
   *  here" rather than the more overt "actively powered" glow on
   *  EnergyTower. Keep this subtle; the ruins should feel dormant. */
  glow?: boolean;
  glowColor?: string;
}

/**
 * Same situation as EnergyTower: the model file existed in public/models
 * with no component using it. Placed near the Timeline bridge, off to one
 * side — "something old the journey passes by," not directly in the path.
 */
export function AncientRuins({
  position = [0, 0, 0],
  height = 2.6,
  rotationY = 0,
  withBase = true,
  baseSeed = 23,
  glow = true,
  glowColor = '#5CE1FF',
}: AncientRuinsProps) {
  const ruins = useNormalizedGLTFNode(MODEL_PATH, NODE_NAME, height);
  // Ruins read as wider/squatter footprint than the tower, hence the
  // larger multiplier relative to height.
  const baseRadius = height * 0.45;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {withBase && (
        <FloatingIsland
          position={[0, -baseRadius * 0.85, 0]}
          radius={baseRadius}
          seed={baseSeed}
          floatAmplitude={0.05}
          color="#2e2a45"
        />
      )}

      <primitive object={ruins} />

      {glow && (
        <pointLight
          color={glowColor}
          position={[0, height * 0.4, 0]}
          intensity={0.35}
          distance={4}
          decay={2}
        />
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
