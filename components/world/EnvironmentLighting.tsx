'use client';

import { Environment } from '@react-three/drei';
import { useWorldStore } from '@/stores/useWorldStore';

/**
 * "HDRI" and "Global Illumination" from the roadmap are covered together
 * here, because on this project's rendering path they're effectively the
 * same feature:
 *
 * - True path-traced GI needs either an offline bake or Three's WebGPU
 *   renderer (RenderPipeline / path-tracing passes) — this project runs
 *   the standard WebGL path through R3F's <Canvas>, same constraint
 *   Effects.tsx already documents for why GodRays/SSR/Motion Blur aren't
 *   here either.
 * - The practical real-time substitute or "IBL" (Image-Based Lighting):
 *   an HDRI environment map lights every PBR material in the scene from
 *   all directions at once, the way bounced light would. This is what
 *   `scene.environment` actually does, and it's the same technique every
 *   production three.js/R3F project uses in place of full GI.
 *
 * Concretely, this is what makes CrystalCore, CrystalMountain,
 * CrystalScatter, CrystalTree, FloatingIsland, and the island materials
 * (all MeshStandardMaterial with real metalness/roughness — see their
 * own files) show actual specular reflections and ambient fill instead
 * of relying purely on LightingRig's two directional lights. Before this,
 * every glossy/metallic surface in the world had no environment to
 * reflect at all.
 *
 * background={false}: this only feeds scene.environment (lighting), not
 * scene.background — AuroraSky/Nebula/Stars already own what's visually
 * behind the world, and doubling that up would just fight them for the
 * same pixels.
 *
 * preset (not files): drei's own docs flag preset as fetching from a
 * CDN and note it "is not meant to be used in production environments."
 * Accepted here anyway because this project has no bundled HDRI asset,
 * ships from a mobile browser-editing workflow with no local dev step to
 * generate/host one, and Environment's result is cached client-side
 * after first load — but if a real .hdr/.exr ever gets added under
 * public/environments/, swap `preset` for `files` and drop the CDN
 * dependency entirely.
 */
export function EnvironmentLighting() {
  const quality = useWorldStore((s) => s.qualityTier);

  // Skipped entirely on 'low' — an extra cubemap capture/sample is real
  // GPU + memory cost, and 'low' already turns off shadows, MSAA, and
  // most of Effects.tsx for the same reason. Materials still render, just
  // lit purely by LightingRig's direct lights as before.
  if (quality === 'low') return null;

  return (
    <Environment
      preset="night"
      background={false}
      resolution={quality === 'high' ? 256 : 128}
      environmentIntensity={0.6}
    />
  );
}
