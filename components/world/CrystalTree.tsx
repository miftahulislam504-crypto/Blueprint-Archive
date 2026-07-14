'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/noise/mulberry32';
import { normalizeGeometryHeight } from '@/lib/geometry/normalizeGeometryHeight';

interface CrystalTreeProps {
  position?: [number, number, number];
  seed?: number;
  height?: number;
  color?: string;
  emissiveColor?: string;
  branchCount?: number;
}

/**
 * Not a botanically-accurate branching structure (no L-system) — a trunk
 * crystal plus several smaller crystals angled outward at increasing
 * height reads as "crystal tree" at a glance and reuses geometry we
 * already have, rather than adding a whole procedural-branching system
 * for one decorative element.
 */
export function CrystalTree({
  position = [0, 0, 0],
  seed = 1,
  height = 3,
  color = '#4B3F9E',
  emissiveColor = '#5CE1FF',
  branchCount = 6,
}: CrystalTreeProps) {
  const { nodes } = useGLTF('/models/crystal-spike-alt.glb') as unknown as {
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
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.2,
        toneMapped: false,
      }),
    [color, emissiveColor]
  );

  const branches = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: branchCount }, (_, i) => {
      const t = (i + 1) / (branchCount + 1); // 0 to 1 up the trunk, excluding the very top/bottom
      const angle = rand() * Math.PI * 2;
      const outward = 0.3 + rand() * 0.25;
      const branchHeight = height * t;
      const scale = 0.25 + (1 - t) * 0.2; // branches near the base are a bit larger

      return {
        position: [Math.cos(angle) * outward, branchHeight, Math.sin(angle) * outward] as [
          number,
          number,
          number,
        ],
        rotation: [rand() * 0.4 - 0.2, angle, Math.PI / 2 + (rand() * 0.6 - 0.3)] as [
          number,
          number,
          number,
        ],
        scale,
      };
    });
  }, [seed, branchCount, height]);

  if (!geometry) return null;

  return (
    <group position={position}>
      {/* Trunk — same geometry, scaled tall and thin */}
      <mesh
        geometry={geometry}
        material={material}
        position={[0, height / 2, 0]}
        scale={[0.35, height / 1.4, 0.35]}
      />
      {/* Branches */}
      {branches.map((b, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={b.position}
          rotation={b.rotation}
          scale={b.scale}
        />
      ))}
    </group>
  );
}
