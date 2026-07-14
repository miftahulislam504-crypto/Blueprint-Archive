'use client';

import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, SSAO } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useWorldStore } from '@/stores/useWorldStore';

/**
 * GodRays, SSR, and Motion Blur are deliberately NOT here:
 *
 * - GodRays: reported broken specifically on React 19 (which this project
 *   uses) by developers testing @react-three/postprocessing recently.
 * - SSR: multiple recent three.js forum threads show developers unable to
 *   get any SSR solution working with the current
 *   R3F + EffectComposer + Next.js combination. The newer Three.js system
 *   that handles this properly (RenderPipeline, via Multiple Render
 *   Targets) needs the WebGPU renderer — this project runs on the
 *   standard WebGL path through R3F's <Canvas>, which doesn't have
 *   access to that system.
 * - Motion Blur: needs the same kind of velocity-buffer data as SSR, and
 *   hits similar multi-buffer limitations on the EffectComposer/WebGL path.
 *
 * Revisit these if the project ever migrates to a WebGPU-based renderer.
 */
export function Effects() {
  const quality = useWorldStore((s) => s.qualityTier);

  return (
    <EffectComposer multisampling={quality === 'high' ? 8 : 0}>
      {/* Always on — this is what actually makes emissive crystal materials
          glow rather than just look like a flat bright color. Exact
          intensity/threshold are a reasonable starting point, not
          precisely tuned — that needs eyes on the real render. */}
      <Bloom
        intensity={quality === 'low' ? 0.5 : 1.0}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {quality !== 'low' && (
        <ChromaticAberration
          offset={[0.0008, 0.0008]}
          radialModulation
          modulationOffset={0.5}
        />
      )}

      {quality === 'high' && (
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={16}
          rings={4}
          distanceThreshold={1.0}
        />
      )}

      {quality === 'high' && (
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={2} height={480} />
      )}
    </EffectComposer>
  );
}
