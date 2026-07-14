'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore, type WeatherCondition } from '@/stores/useWorldStore';
import { weatherIntensity } from '@/lib/weather/weatherIntensity';
import { CrystalRain } from './CrystalRain';
import { MistVeil } from './MistVeil';

const SEQUENCE: { condition: WeatherCondition; durationMs: number }[] = [
  { condition: 'clear', durationMs: 45000 },
  { condition: 'crystalRain', durationMs: 22000 },
  { condition: 'clear', durationMs: 40000 },
  { condition: 'mistVeil', durationMs: 26000 },
];

/**
 * Owns the weather auto-cycle and bridges it to weatherIntensity's
 * crossfades. CrystalRain/MistVeil below stay mounted at all times
 * regardless of the current condition — each reads its own intensity
 * every frame and fades itself in/out; conditionally mounting/unmounting
 * them here instead would make transitions pop rather than crossfade,
 * defeating the point of weatherIntensity's transition window.
 *
 * The schedule below is just a default loop. If a later feature (a dev
 * console, say) wants manual control, it can call the store's
 * setWeatherCondition directly at any time — this effect only decides
 * *when* to call it automatically, nothing about the store or
 * weatherIntensity assumes this is the only caller.
 */
export function WeatherSystem() {
  const weatherCondition = useWorldStore((s) => s.weatherCondition);
  const setWeatherCondition = useWorldStore((s) => s.setWeatherCondition);

  // useEffect can't read state.clock directly (that only exists inside
  // useFrame) — this just keeps the latest known elapsed time around so
  // the condition-change effect below has *something* to hand
  // weatherIntensity.setCondition as "now".
  const clockRef = useRef(0);
  useFrame((state) => {
    clockRef.current = state.clock.getElapsedTime();
  });

  useEffect(() => {
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const advance = () => {
      const step = SEQUENCE[index % SEQUENCE.length];
      setWeatherCondition(step.condition);
      index += 1;
      timeoutId = setTimeout(advance, step.durationMs);
    };

    advance();
    return () => clearTimeout(timeoutId);
  }, [setWeatherCondition]);

  useEffect(() => {
    weatherIntensity.setCondition(weatherCondition, clockRef.current);
  }, [weatherCondition]);

  return (
    <>
      <CrystalRain />
      <MistVeil />
    </>
  );
}
