'use client';

import { useWorldStore } from '@/stores/useWorldStore';

interface LightingRigProps {
  keyColor?: string;
  rimColor?: string;
  ambientColor?: string;
}

export function LightingRig({
  keyColor = '#ffffff',
  rimColor = '#5CE1FF',
  ambientColor = '#2a2550',
}: LightingRigProps) {
  const quality = useWorldStore((s) => s.qualityTier);
  const shadowsEnabled = quality !== 'low';

  return (
    <>
      <ambientLight color={ambientColor} intensity={0.5} />

      {/* Key light — the main directional source, casts shadows on mid/high tier only. */}
      <directionalLight
        color={keyColor}
        position={[5, 8, 4]}
        intensity={1.4}
        castShadow={shadowsEnabled}
        shadow-mapSize={shadowsEnabled ? [1024, 1024] : undefined}
      />

      {/* Rim/back light, positioned opposite the key light so silhouettes catch
          a cool edge glow — echoes the crystal's own Fresnel rim from Phase 3. */}
      <directionalLight color={rimColor} position={[-4, 2, -6]} intensity={0.8} />
    </>
  );
}
