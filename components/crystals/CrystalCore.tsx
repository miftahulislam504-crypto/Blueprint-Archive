'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { QualityTier } from '@/stores/useWorldStore';

interface CrystalCoreProps {
  /** Device tier from your quality-detection system. Controls shader cost. */
  quality?: QualityTier;
  /** Base tint — the model's baked texture is a neutral gradient ramp,
   *  so color is meant to be driven from here, not the GLB itself. */
  color?: string;
  /** Rim / energy glow color, also feeds the point light. */
  emissiveColor?: string;
  position?: [number, number, number];
  scale?: number;
}

// Path assumes you drop crystal-core.glb into /public/models/
const MODEL_PATH = '/models/crystal-core.glb';

export default function CrystalCore({
  quality = 'mid',
  color = '#4B3F9E',
  emissiveColor = '#5CE1FF',
  position = [0, 0, 0],
  scale = 1,
}: CrystalCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF(MODEL_PATH) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };

  // The GLB's mesh node name is an auto-generated FBX export id (e.g. "crystal_19")
  // and will differ if you swap in a different crystal file later, so we
  // grab whichever node is actually a mesh instead of hardcoding a name.
  const meshNode = useMemo(() => {
    const key = Object.keys(nodes).find((k) => (nodes[k] as THREE.Mesh).isMesh);
    return key ? nodes[key] : null;
  }, [nodes]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: emissiveColor,
      emissiveIntensity: quality === 'low' ? 0.6 : 1.1,
      roughness: 0.15,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92,
      // Required for Bloom to pick this up — see Effects.tsx for why.
      toneMapped: false,
    });

    // Fresnel rim-light: skipped on 'low' tier (phones) since onBeforeCompile
    // adds a shader-compile + per-fragment cost we don't want to pay there.
    // Plain emissive still reads as "glowing," just without the edge rim.
    if (quality !== 'low') {
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.fresnelColor = { value: new THREE.Color(emissiveColor) };
        shader.uniforms.fresnelPower = { value: quality === 'high' ? 2.0 : 2.6 };

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vFresnelNormal;
             varying vec3 vFresnelView;`
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vFresnelNormal = normalize(normalMatrix * normal);
             vFresnelView = normalize(-(modelViewMatrix * vec4(transformed, 1.0)).xyz);`
          );

        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vFresnelNormal;
             varying vec3 vFresnelView;
             uniform vec3 fresnelColor;
             uniform float fresnelPower;`
          )
          .replace(
            '#include <dithering_fragment>',
            `float fresnelTerm = pow(1.0 - max(dot(vFresnelNormal, vFresnelView), 0.0), fresnelPower);
             gl_FragColor.rgb += fresnelColor * fresnelTerm * 0.9;
             #include <dithering_fragment>`
          );
      };
      mat.needsUpdate = true;
    }

    return mat;
  }, [color, emissiveColor, quality]);

  // Slow spin + gentle vertical bob — the plan's "Floating Geometry" feel.
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.08;
  });

  if (!meshNode) return null;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={meshNode.geometry} material={material} castShadow receiveShadow />
      {/* Local point light sells "this is an energy source," not just a lit object —
          cheap compared to relying on the Bloom pass alone, and still works if
          Bloom is disabled on 'low' tier. */}
      <pointLight
        color={emissiveColor}
        intensity={quality === 'low' ? 0.6 : 1.4}
        distance={4}
        decay={2}
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
