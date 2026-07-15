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

// Same "no hand-typed simplex/perlin noise" reasoning as AuroraSky and
// Nebula's own shaders — a real noise function has enough precise magic
// constants that a transcription slip is easy to make and hard to catch
// without a live GLSL compiler. This layers MORE sine octaves than
// Nebula (6 vs Nebula's 4) at higher frequency multipliers and a lower
// smoothstep floor, which is what turns "occasional soft patches" into
// "mostly-covered billowing cloud cover" — same underlying technique,
// tuned to a different silhouette.
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorLight;
  uniform vec3 uColorShadow;
  uniform float uOpacity;
  uniform float uCoverage;

  void main() {
    // Slow single-direction drift (unlike Nebula's symmetric drift) —
    // clouds should read as "blowing one way," not just churning in place.
    float t = uTime * 0.015;
    float driftedX = vUv.x + t;

    float n1 = sin(driftedX * 8.0) * 0.5 + 0.5;
    float n2 = sin(vUv.y * 6.0 - t * 0.7 + 1.0) * 0.5 + 0.5;
    float n3 = sin((driftedX + vUv.y) * 5.0 + t * 0.4) * 0.5 + 0.5;
    float n4 = sin((driftedX - vUv.y) * 9.0 - t * 0.6 + 3.0) * 0.5 + 0.5;
    float n5 = sin(driftedX * 14.0 + vUv.y * 3.0 + t * 1.1) * 0.5 + 0.5;
    float n6 = sin(vUv.y * 11.0 - driftedX * 4.0 + t * 0.3) * 0.5 + 0.5;

    float billow = (n1 * n2 + n3 * n4 + n5 * n6) / 3.0;
    float density = smoothstep(uCoverage, uCoverage + 0.35, billow);

    // Fade out near the very top/bottom of the band so this reads as a
    // horizon-hugging cloud layer rather than a full sky dome of cloud.
    float bandFade = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.55, 0.85, vUv.y));
    density *= bandFade;

    // Cheap fake self-shadowing: denser patches (higher n1*n2) skew
    // toward uColorShadow, thinner wisps skew toward uColorLight — gives
    // the billows some volumetric-looking depth without real raymarching.
    vec3 color = mix(uColorLight, uColorShadow, smoothstep(0.3, 0.9, n1 * n2));

    gl_FragColor = vec4(color, density * uOpacity);
  }
`;

interface VolumetricCloudsProps {
  colorLight?: string;
  colorShadow?: string;
  /** Smaller than Nebula's default 75 so this sits just inside it —
   *  same "opaque before transparent" ordering trick both AuroraSky and
   *  Nebula already rely on, see Nebula's own radius comment. */
  radius?: number;
  opacity?: number;
  /** Higher = less cloud cover / more gaps. Roughly 0 (fully overcast) to
   *  0.6 (sparse wisps). */
  coverage?: number;
}

export function VolumetricClouds({
  colorLight = '#8f8ad4',
  colorShadow = '#2a2550',
  radius = 68,
  opacity = 0.45,
  coverage = 0.25,
}: VolumetricCloudsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorLight: { value: new THREE.Color(colorLight) },
      uColorShadow: { value: new THREE.Color(colorShadow) },
      uOpacity: { value: opacity },
      uCoverage: { value: coverage },
    }),
    [colorLight, colorShadow, opacity, coverage]
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
