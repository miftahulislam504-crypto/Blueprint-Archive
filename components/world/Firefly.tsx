'use client';

import { ParticleField, type ParticleFieldProps } from './ParticleField';

/**
 * Fewer and more individually noticeable than Dust/Sparkle — each one
 * meant to read as its own small point of interest, not part of a dense
 * field. Warm yellow-green rather than this world's usual cool cyan/
 * purple, deliberately: a firefly reads as a distinct living thing, not
 * another glowing crystal effect, and a different hue keeps it legible as
 * that rather than blending into everything else that glows. Wanders
 * much further than Dust/Sparkle's small jitter, and blinks at roughly a
 * real firefly's pace instead of a quick sparkle-flicker.
 */
export function Firefly(props: Partial<ParticleFieldProps>) {
  return (
    <ParticleField
      count={18}
      color="#C4E86B"
      size={0.06}
      driftAmount={0.6}
      driftSpeed={0.15}
      twinkleSpeed={0.9}
      twinkleMin={0.05}
      {...props}
    />
  );
}
