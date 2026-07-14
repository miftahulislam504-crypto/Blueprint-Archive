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

// Deliberately uses only sin()/mix()/smoothstep() rather than a hand-typed
// simplex-noise GLSL snippet — a full noise implementation has enough
// precise constants that a transcription slip is easy to make and hard to
// catch without a live GLSL compiler to test against. Layered sine waves
// give a similar flowing-band look with much less that can go subtly wrong.
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorTop;
  uniform vec3 uColorMid;
  uniform vec3 uColorBottom;

  void main() {
    float y = vUv.y;

    float wave1 = sin(vUv.x * 3.0 + uTime * 0.15) * 0.5 + 0.5;
    float wave2 = sin(vUv.x * 5.0 - uTime * 0.25 + 1.5) * 0.5 + 0.5;
    float flow = mix(wave1, wave2, 0.5);

    float band = smoothstep(0.0, 1.0, y + flow * 0.15 - 0.075);

    vec3 color = mix(uColorBottom, uColorMid, smoothstep(0.0, 0.5, band));
    color = mix(color, uColorTop, smoothstep(0.5, 1.0, band));

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface AuroraSkyProps {
  colorTop?: string;
  colorMid?: string;
  colorBottom?: string;
  radius?: number;
}

export function AuroraSky({
  colorTop = '#0a0620',
  colorMid = '#4B3F9E',
  colorBottom = '#0d0518',
  radius = 80,
}: AuroraSkyProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color(colorTop) },
      uColorMid: { value: new THREE.Color(colorMid) },
      uColorBottom: { value: new THREE.Color(colorBottom) },
    }),
    [colorTop, colorMid, colorBottom]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    // BackSide renders the sphere's interior faces, which is what makes it
    // visible as a "sky" surrounding the camera rather than a solid ball
    // seen from outside.
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
