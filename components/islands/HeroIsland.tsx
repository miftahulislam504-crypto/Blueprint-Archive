'use client';

import { Html } from '@react-three/drei';

interface HeroIslandProps {
  position?: [number, number, number];
}

/**
 * The only island with no card-style background — this sits right at the
 * heart of the scene next to CrystalCore, so a boxed panel here would
 * compete with it rather than complement it. Just glowing text.
 * pointerEvents: 'none' since there's nothing to click here, so it can't
 * accidentally intercept an orbit-drag or joystick gesture if it happens
 * to visually overlap either.
 */
export function HeroIsland({ position = [0, 1.8, 0] }: HeroIslandProps) {
  return (
    <Html position={position} center transform occlude distanceFactor={4}>
      <div
        style={{
          textAlign: 'center',
          color: '#e8e6ff',
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 0 20px rgba(92, 225, 255, 0.6)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: 1, color: '#5CE1FF' }}>
          Miftahul Islam
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.8 }}>
          Civil Engineer &amp; Developer
        </p>
        {/* Temporary line, standing in until there's something more
            specific wanted here. */}
        <p style={{ margin: '10px 0 0', fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>
          Building at the edge of structural engineering and interactive worlds
        </p>
      </div>
    </Html>
  );
}
