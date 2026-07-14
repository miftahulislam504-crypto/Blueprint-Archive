'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Same principle as AuroraSky's own fragment shader: only sin()/mix()/
// smoothstep(), no hand-typed simplex/perlin noise function. A real noise
// implementation has enough precise magic constants that a transcription
// slip is easy to make and hard to catch without a live GLSL compiler —
// layered sine waves at different frequencies/axes/phases give a similarly
// non-repetitive patchy field with nothing that can go subtly wrong.
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  void main() {
    float t = uTime * 0.02; // drifts much slower than AuroraSky's bands

    float n1 = sin(vUv.x * 6.0 + t * 1.3) * 0.5 + 0.5;
    float n2 = sin(vUv.y * 4.0 - t * 0.9 + 2.1) * 0.5 + 0.5;
    float n3 = sin((vUv.x + vUv.y) * 5.0 + t * 0.6) * 0.5 + 0.5;
    float n4 = sin((vUv.x - vUv.y) * 7.0 - t * 1.1 + 4.0) * 0.5 + 0.5;

    float density = (n1 * n2 + n3 * n4) * 0.5;
    // Only the upper part of the range shows at all — mostly clear sky
    // with occasional soft cloud patches, not a uniform tint everywhere.
    density = smoothstep(0.35, 0.85, density);

    vec3 color = mix(uColorA, uColorB, n2);
    gl_FragColor = vec4(color, density * uOpacity);
  }
`;

interface NebulaProps {
  colorA?: string;
  colorB?: string;
  /** Smaller than AuroraSky's default 80 so this sits just inside it —
   *  three.js always renders opaque objects (AuroraSky has no transparent
   *  flag) before transparent ones (this does), so it composites over the
   *  aurora automatically regardless of JSX order. */
  radius?: number;
  opacity?: number;
}

export function Nebula({
  colorA = '#B14BC4',
  colorB = '#2FA9C9',
  radius = 75,
  opacity = 0.55,
}: NebulaProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uOpacity: { value: opacity },
    }),
    [colorA, colorB, opacity]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
