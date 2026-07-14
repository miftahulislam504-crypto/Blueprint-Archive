'use client';

import { ParticleField, type ParticleFieldProps } from './ParticleField';

/**
 * Small, mostly-stationary points that flicker quickly between visible
 * and fully invisible — a quick glint rather than a slow pulse. Uses the
 * world's signature cyan by default, meant for scattering near crystal /
 * energy landmarks (EnergyTower, CrystalCore, Cave's glow) rather than as
 * general atmosphere the way Dust is.
 */
export function Sparkle(props: Partial<ParticleFieldProps>) {
  return (
    <ParticleField
      count={60}
      color="#5CE1FF"
      size={0.032}
      driftAmount={0.08}
      driftSpeed={0.3}
      twinkleSpeed={1.8}
      twinkleMin={0}
      {...props}
    />
  );
}
