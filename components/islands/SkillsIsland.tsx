'use client';

import { useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SKILL_CATEGORIES } from '@/data/skills';
import { mulberry32 } from '@/lib/noise/mulberry32';

interface SkillClusterProps {
  categoryIndex: number;
  position: [number, number, number];
}

function SkillCluster({ categoryIndex, position }: SkillClusterProps) {
  const [hovered, setHovered] = useState(false);
  const category = SKILL_CATEGORIES[categoryIndex];

  // useGLTF caches by path internally, so six of these mounting at once
  // doesn't mean the file gets fetched/parsed six times.
  const { nodes } = useGLTF('/models/crystal-core.glb') as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };

  const geometry = useMemo(() => {
    const key = Object.keys(nodes).find((k) => (nodes[k] as THREE.Mesh).isMesh);
    return key ? nodes[key].geometry : null;
  }, [nodes]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: category.color,
        emissive: category.color,
        emissiveIntensity: hovered ? 1.6 : 0.7,
        roughness: 0.2,
        metalness: 0.2,
        toneMapped: false,
      }),
    [category.color, hovered]
  );

  if (!geometry) return null;

  return (
    <mesh
      position={position}
      geometry={geometry}
      material={material}
      scale={hovered ? 0.62 : 0.55}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    />
  );
}

interface SkillsIslandProps {
  center?: [number, number, number];
  spread?: number;
}

export function SkillsIsland({ center = [8, -0.5, -3], spread = 3.5 }: SkillsIslandProps) {
  // Ring layout, seeded so it's the same arrangement every load rather
  // than reshuffling on every reload.
  const positions = useMemo(() => {
    const rand = mulberry32(42);
    return SKILL_CATEGORIES.map((_, i) => {
      const angle = (i / SKILL_CATEGORIES.length) * Math.PI * 2;
      const r = spread * (0.8 + rand() * 0.3);
      return [
        center[0] + Math.cos(angle) * r,
        center[1] + (rand() - 0.5) * 1.2,
        center[2] + Math.sin(angle) * r,
      ] as [number, number, number];
    });
  }, [center, spread]);

  return (
    <>
      {SKILL_CATEGORIES.map((category, i) => (
        <SkillCluster key={category.name} categoryIndex={i} position={positions[i]} />
      ))}
    </>
  );
}
