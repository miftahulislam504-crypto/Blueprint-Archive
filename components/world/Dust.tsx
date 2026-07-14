'use client';

import { ParticleField, type ParticleFieldProps } from './ParticleField';

/**
 * Subtle ambient motes — slow drift, barely-there twinkle, muted color.
 * Meant to sit in the background of a scene rather than draw attention to
 * itself; a general-purpose "this air has particles in it" layer.
 */
export function Dust(props: Partial<ParticleFieldProps>) {
  return (
    <ParticleField
      count={80}
      color="#8A8296"
      size={0.045}
      driftAmount={0.15}
      driftSpeed={0.08}
      twinkleSpeed={0.15}
      twinkleMin={0.5}
      {...props}
    />
  );
}
