"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COVER_Z, DESK_Z } from "@/scenes/sheetLayout";

/**
 * Sparse drafting-dust suspended through the whole corridor depth — gives
 * the void a sense of scale without competing with the sheets themselves.
 * Point count is tier-gated by the caller, not in here, so this component
 * stays a plain, cheap THREE.Points field (no custom shader needed; that
 * complexity is reserved for InstrumentParticles, which actually needs to
 * morph between target shapes).
 */
export default function VoidField({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const depthSpan = COVER_Z - DESK_Z + 20;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = 8 - Math.random() * depthSpan;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#cfe8f3"
        size={0.028}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}
