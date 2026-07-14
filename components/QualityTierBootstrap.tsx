'use client';

import { useEffect } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';
import { detectQualityTier } from '@/lib/detectQualityTier';

/**
 * Mount this once near the root of the app (e.g. in the layout, above the
 * R3F Canvas) — it runs the tier heuristic on mount and writes the result
 * into useWorldStore. It renders nothing.
 */
export function QualityTierBootstrap() {
  const setQualityTier = useWorldStore((s) => s.setQualityTier);

  useEffect(() => {
    setQualityTier(detectQualityTier());
  }, [setQualityTier]);

  return null;
}
