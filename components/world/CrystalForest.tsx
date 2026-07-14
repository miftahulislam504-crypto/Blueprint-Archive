'use client';

import { useMemo } from 'react';
import { CrystalTree } from './CrystalTree';
import { mulberry32 } from '@/lib/noise/mulberry32';

interface CrystalForestProps {
  center?: [number, number, number];
  count?: number;
  radius?: number;
  seed?: number;
}

/**
 * Whole trees (trunk + branches, several meshes each) rather than single
 * crystals, so `count` should stay modest — this is not built for
 * hundreds of instances the way CrystalScatter's InstancedMesh is.
 */
export function CrystalForest({
  center = [0, 0, 0],
  count = 5,
  radius = 3,
  seed = 1,
}: CrystalForestProps) {
  const trees = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const dist = radius * (0.3 + rand() * 0.7);
      return {
        position: [
          center[0] + Math.cos(angle) * dist,
          center[1],
          center[2] + Math.sin(angle) * dist,
        ] as [number, number, number],
        treeSeed: Math.floor(rand() * 10000) + i,
        height: 2 + rand() * 2,
      };
    });
  }, [center, count, radius, seed]);

  return (
    <>
      {trees.map((tree, i) => (
        <CrystalTree
          key={i}
          position={tree.position}
          seed={tree.treeSeed}
          height={tree.height}
        />
      ))}
    </>
  );
}
