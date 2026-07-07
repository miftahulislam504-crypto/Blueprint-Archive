"use client";

import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * Bloom only needs to catch the brightest linework and brass highlights —
 * the pale cyan ink and title-block accents — not glow the whole sheet.
 * Chromatic aberration is nudged very slightly past CIVION's value: it's
 * doing double duty here as a quiet echo of the "technical displacement"
 * transition Igloo uses between scenes, so it earns a touch more presence
 * than a purely cosmetic lens effect would.
 */
export default function ArchiveEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.3}
      />
      <ChromaticAberration offset={[0.0004, 0.0004]} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
