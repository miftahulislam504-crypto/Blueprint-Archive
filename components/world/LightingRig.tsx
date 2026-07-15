'use client';

import { useWorldStore } from '@/stores/useWorldStore';

interface LightingRigProps {
  keyColor?: string;
  rimColor?: string;
  ambientColor?: string;
  /** Sky-tint for hemisphereLight's upper hemisphere. */
  skyColor?: string;
  /** Ground-tint for hemisphereLight's lower hemisphere — this project's
   *  world has no literal ground plane, so this reads as "bounce light
   *  from below" (crystal glow, cave floor, etc.) rather than a real
   *  terrain color. */
  groundColor?: string;
}

export function LightingRig({
  keyColor = '#ffffff',
  rimColor = '#5CE1FF',
  ambientColor = '#2a2550',
  skyColor = '#4B3F9E',
  groundColor = '#0d0518',
}: LightingRigProps) {
  const quality = useWorldStore((s) => s.qualityTier);
  const shadowsEnabled = quality !== 'low';

  return (
    <>
      {/* Reduced slightly from its original 0.5 now that hemisphereLight
          below adds its own directional (sky vs ground) fill — leaving
          both at full strength would wash out the scene's contrast. */}
      <ambientLight color={ambientColor} intensity={0.35} />

      {/* Cheap directional-tint approximation of sky-vs-ground bounce
          light — essentially free (one extra light, no shadow/shader
          cost) compared to EnvironmentLighting's real IBL cubemap, so
          this stays on at every quality tier including 'low', where
          EnvironmentLighting itself is skipped entirely. Together the
          two are this project's practical stand-in for full GI — see
          EnvironmentLighting's own comment for why real path-traced GI
          isn't available on this rendering path. */}
      <hemisphereLight color={skyColor} groundColor={groundColor} intensity={0.4} />

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
