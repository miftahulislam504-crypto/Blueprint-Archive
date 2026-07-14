'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/noise/mulberry32';
import { weatherIntensity } from '@/lib/weather/weatherIntensity';

const VERTEX_SHADER = `
  attribute float aFallSpeed;
  attribute float aSize;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uVolumeHeight;
  uniform float uCenterY;

  void main() {
    // Wraps continuously from top to bottom of the rain volume — mod()
    // keeps this bounded without ever needing to reset a particle's base
    // position from the CPU side. Shifting by half the volume height
    // before/after the mod keeps it centered on 0 rather than mod()'s
    // native [0, height) range.
    float halfHeight = uVolumeHeight * 0.5;
    float wrappedY = mod(position.y - uTime * aFallSpeed + halfHeight, uVolumeHeight) - halfHeight;

    vec3 pos = vec3(position.x, wrappedY + uCenterY, position.z);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uIntensity;

  void main() {
    // Soft round mote rather than a realistic rain streak — round reads
    // as "falling crystal shard" for this world's fantasy aesthetic,
    // where a hard streak would read as literal water, which isn't the
    // theme here.
    float dist = distance(gl_PointCoord, vec2(0.5));
    float circle = smoothstep(0.5, 0.15, dist);
    if (circle <= 0.0) discard;

    gl_FragColor = vec4(uColor, circle * uIntensity);
  }
`;

interface CrystalRainProps {
  center?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  count?: number;
  color?: string;
  seed?: number;
}

/**
 * Always mounted (see WeatherSystem) regardless of the current weather
 * condition — uIntensity, read from weatherIntensity every frame, is what
 * actually fades this in and out. The fall animation itself keeps running
 * even at intensity 0; that's fine, it just costs an alpha-multiply that
 * happens to render nothing, cheaper than mounting/unmounting the whole
 * Points object every time the condition changes.
 */
export function CrystalRain({
  center = [3, 4, -10],
  width = 24,
  depth = 24,
  height = 14,
  count = 220,
  color = '#8fd8ff',
  seed = 61,
}: CrystalRainProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const fallSpeeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * width;
      positions[i * 3 + 1] = (rand() - 0.5) * height;
      positions[i * 3 + 2] = (rand() - 0.5) * depth;

      fallSpeeds[i] = 1.4 + rand() * 1.6;
      sizes[i] = 0.035 + rand() * 0.03;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aFallSpeed', new THREE.BufferAttribute(fallSpeeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count, width, height, depth, seed]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 0 },
      uVolumeHeight: { value: height },
      uCenterY: { value: center[1] },
      uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 },
    }),
    [color, height, center]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = t;
    materialRef.current.uniforms.uIntensity.value = weatherIntensity.getIntensity('crystalRain', t);
  });

  return (
    <points position={[center[0], 0, center[2]]} geometry={geometry}>
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
