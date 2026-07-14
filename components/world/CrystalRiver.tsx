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

// Same principle as AuroraSky: sine/fract/smoothstep only, no hand-typed
// noise function, since there's no way to compile-check this GLSL before
// handing it off.
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uGlowColor;

  void main() {
    // vUv.x runs along the tube's length. fract(...) repeats a band
    // pattern along it, and subtracting uTime*speed slides that pattern
    // along the length over time — the "flow" sensation.
    float flow = fract(vUv.x * 4.0 - uTime * 0.4);
    float glow = smoothstep(0.0, 0.5, flow) * smoothstep(1.0, 0.5, flow);

    vec3 color = mix(uColor, uGlowColor, glow);
    gl_FragColor = vec4(color, 0.75);
  }
`;

interface CrystalRiverProps {
  /** At least 2 points. The river follows a Catmull-Rom curve through these. */
  waypoints: [number, number, number][];
  radius?: number;
  color?: string;
  glowColor?: string;
}

export function CrystalRiver({
  waypoints,
  radius = 0.4,
  color = '#251f4d',
  glowColor = '#5CE1FF',
}: CrystalRiverProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const points = waypoints.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(points);
    // tubularSegments scales with point count so longer rivers still read
    // smooth rather than faceted.
    return new THREE.TubeGeometry(curve, waypoints.length * 20, radius, 8, false);
  }, [waypoints, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uGlowColor: { value: new THREE.Color(glowColor) },
    }),
    [color, glowColor]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
