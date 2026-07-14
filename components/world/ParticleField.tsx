'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/noise/mulberry32';

const VERTEX_SHADER = `
  attribute float aPhase;
  attribute float aSize;

  uniform float uTime;
  uniform float uDriftAmount;
  uniform float uDriftSpeed;
  uniform float uPixelRatio;

  varying float vPhase;

  void main() {
    // Different frequency multiplier + phase offset per axis, and a
    // per-particle aPhase on top of that, so particles don't drift in
    // visible lockstep with each other or with themselves axis-to-axis.
    vec3 wobble = vec3(
      sin(uTime * uDriftSpeed + aPhase) * uDriftAmount,
      sin(uTime * uDriftSpeed * 1.3 + aPhase * 1.7) * uDriftAmount,
      sin(uTime * uDriftSpeed * 0.7 + aPhase * 2.3) * uDriftAmount
    );

    vec4 mvPosition = modelViewMatrix * vec4(position + wobble, 1.0);

    // Perspective-correct sizing — PointsMaterial does this internally
    // when sizeAttenuation is on; a custom ShaderMaterial has to do it by
    // hand, same formula.
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Passed through as-is — a point sprite is a single vertex, so there's
    // no interpolation across it for the fragment shader to do anyway.
    // The actual twinkle formula (combining this with uTime/uTwinkleSpeed)
    // lives in the fragment shader below, not here.
    vPhase = aPhase;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uTwinkleSpeed;
  uniform float uTwinkleMin;

  varying float vPhase;

  void main() {
    // gl_PointCoord is built-in for point sprites: 0-1 UV across this
    // particle's screen-space square. Soft circular falloff instead of a
    // harsh square block.
    float dist = distance(gl_PointCoord, vec2(0.5));
    float circle = smoothstep(0.5, 0.2, dist);
    if (circle <= 0.0) discard;

    float twinkle = mix(uTwinkleMin, 1.0, sin(uTime * uTwinkleSpeed + vPhase) * 0.5 + 0.5);

    gl_FragColor = vec4(uColor, circle * twinkle);
  }
`;

export interface ParticleFieldProps {
  count?: number;
  center?: [number, number, number];
  /** Particles fill the interior of this radius, not just its surface. */
  radius?: number;
  color?: string;
  size?: number;
  seed?: number;
  driftAmount?: number;
  driftSpeed?: number;
  twinkleSpeed?: number;
  /** How dark the dimmest point of each particle's twinkle cycle gets — 0
   *  lets it fade to fully invisible, close to 1 keeps it almost constant. */
  twinkleMin?: number;
}

/**
 * THREE.Points rather than InstancedMesh (unlike FloatingPlatforms and
 * CrystalScatter): these particles don't need real 3D geometry, normals,
 * or per-instance materials — just a screen-space dot with a soft glow —
 * so point sprites are both the standard technique and meaningfully
 * cheaper at the kind of counts a particle field implies.
 *
 * Every particle's motion and twinkle is computed from `uTime` entirely
 * inside the vertex/fragment shader, so animating this costs one uniform
 * update per frame regardless of `count` — there's no per-particle CPU
 * work the way FloatingPlatforms' bob/spin needs.
 *
 * Not meant to be used directly — see Dust/Sparkle/Firefly, which are
 * this with presets. Exported anyway in case a fourth variant is worth
 * adding later without needing to touch this file.
 */
export function ParticleField({
  count = 50,
  center = [0, 0, 0],
  radius = 3,
  color = '#5CE1FF',
  size = 0.04,
  seed = 1,
  driftAmount = 0.2,
  driftSpeed = 0.2,
  twinkleSpeed = 1,
  twinkleMin = 0.3,
}: ParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform-in-sphere via rejection sampling — simple and exact,
      // rather than a closed-form distribution that's easy to get subtly
      // wrong (e.g. naively scaling a random direction by a linear random
      // radius biases points toward the center).
      let x = 0;
      let y = 0;
      let z = 0;
      let lengthSq = Infinity;
      while (lengthSq > 1) {
        x = rand() * 2 - 1;
        y = rand() * 2 - 1;
        z = rand() * 2 - 1;
        lengthSq = x * x + y * y + z * z;
      }

      positions[i * 3] = center[0] + x * radius;
      positions[i * 3 + 1] = center[1] + y * radius;
      positions[i * 3 + 2] = center[2] + z * radius;

      phases[i] = rand() * Math.PI * 2;
      sizes[i] = size * (0.6 + rand() * 0.8);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count, center, radius, seed, size]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uDriftAmount: { value: driftAmount },
      uDriftSpeed: { value: driftSpeed },
      uTwinkleSpeed: { value: twinkleSpeed },
      uTwinkleMin: { value: twinkleMin },
      uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 },
    }),
    [color, driftAmount, driftSpeed, twinkleSpeed, twinkleMin]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
