"use client";

import { useEffect, useState } from "react";

export type QualityTier = "high" | "low";

/**
 * Heuristic, not a real GPU benchmark — WebGL renderer sniffing is
 * unreliable/often blocked by browsers now.
 *
 * Any touch-primary device (phone/tablet) is treated as "low" outright —
 * even high-end phones pair several CPU cores with a mobile GPU that is a
 * fraction of a desktop GPU's fill-rate, and this scene's cost
 * (postprocessing, per-sheet line geometry, the instrument particle field)
 * is GPU-bound, not CPU-bound. Low core count on a non-touch device (rare,
 * but e.g. budget laptops) also still downgrades.
 */
export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>("high");

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 6;
    setTier(isCoarsePointer || lowCores ? "low" : "high");
  }, []);

  return tier;
}
