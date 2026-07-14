'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { weatherIntensity } from '@/lib/weather/weatherIntensity';

const FOG_COLOR = '#3a3550'; // matches CrystalMountain's rock palette
const MAX_DENSITY = 0.045;

/**
 * scene.fog is a single property, not a stack — if a future weather
 * condition also wants fog, route it through this component (e.g. take
 * the max of both conditions' intensities) rather than setting scene.fog
 * independently elsewhere, or they'll fight over it every frame.
 *
 * FogExp2 (exponential falloff) rather than plain Fog (linear near/far
 * cutoff) — exponential reads as a soft, gradually-thickening haze, which
 * suits "atmospheric weather condition" much better than a hard-edged
 * linear cutoff would.
 */
export function MistVeil() {
  const fogRef = useRef<THREE.FogExp2>(null);

  useFrame((state) => {
    if (!fogRef.current) return;
    const intensity = weatherIntensity.getIntensity('mistVeil', state.clock.getElapsedTime());
    fogRef.current.density = MAX_DENSITY * intensity;
  });

  return <fogExp2 ref={fogRef} attach="fog" args={[FOG_COLOR, 0]} />;
}
