'use client';

import { Html } from '@react-three/drei';

interface AboutIslandProps {
  position?: [number, number, number];
}

export function AboutIsland({ position = [4, 0.5, 0] }: AboutIslandProps) {
  return (
    // transform: scales/rotates with 3D perspective instead of staying a
    // fixed screen-space size. occlude: hides behind any 3D geometry that's
    // actually in front of it (an island, a crystal) rather than always
    // drawing on top.
    <Html position={position} transform occlude distanceFactor={4}>
      <div
        style={{
          width: 320,
          padding: 24,
          borderRadius: 16,
          background: 'rgba(20, 15, 45, 0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(92, 225, 255, 0.35)',
          color: '#e8e6ff',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 0 40px rgba(75, 63, 158, 0.4)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', color: '#5CE1FF', fontSize: 20 }}>
          Miftahul Islam
        </h2>
        {/* Placeholder bio — swap in your own. Kept the two facts I
            actually know true rather than inventing detail around them. */}
        <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
          Civil engineer and self-taught developer, building at the
          intersection of structural engineering and 3D web experiences.
        </p>
        <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
          <div><strong>Based in:</strong> Sirajganj, Bangladesh</div>
          <div><strong>Vision:</strong> Turning engineering expertise and
            self-taught code into tools people actually use — from
            structural analysis software to 3D interactive portfolios.</div>
          <div><strong>Focus:</strong> Civil engineering + web development</div>
        </div>
      </div>
    </Html>
  );
}
