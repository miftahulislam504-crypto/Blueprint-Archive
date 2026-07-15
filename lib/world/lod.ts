import type { QualityTier } from '@/stores/useWorldStore';

/**
 * Centralizes the tier→detail/count mapping so every call site (page.tsx,
 * and any component that takes its own `detail`/`count` prop) scales the
 * same way instead of each inventing its own tier arithmetic — the drift
 * that would otherwise happen is exactly why FloatingPlatforms' own
 * comment flagged this as needing to land "applied to all of these at
 * once" rather than piecemeal.
 */

/**
 * Scales an icosahedron subdivision level down for lower tiers.
 * detail: 0 = 20 faces, 1 = 80 faces, 2 = 320 faces — each step is a ~4x
 * jump, so even dropping by one level is a meaningful poly-count win.
 * Never goes below 0 (there's no more room to simplify a base icosahedron
 * without switching shapes entirely).
 */
export function lodDetail(baseDetail: number, tier: QualityTier): number {
  if (tier === 'high') return baseDetail;
  if (tier === 'mid') return Math.max(0, baseDetail - 1);
  return Math.max(0, baseDetail - 2); // 'low'
}

/**
 * Scales an instance count down for lower tiers. Uses a multiplier
 * rather than a flat subtraction so it scales sensibly whether the
 * caller asked for CrystalScatter's default 24 or CrystalForest's
 * smaller per-cluster count — a flat "-8" would zero out or go negative
 * on the smaller counts.
 */
export function lodCount(baseCount: number, tier: QualityTier): number {
  const factor = tier === 'high' ? 1 : tier === 'mid' ? 0.65 : 0.4;
  return Math.max(1, Math.round(baseCount * factor));
}
