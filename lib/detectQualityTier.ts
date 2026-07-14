import type { QualityTier } from '@/stores/useWorldStore';

/**
 * Best-effort device tier guess. No single signal is reliable on its own —
 * navigator.deviceMemory is Chrome-only, and WEBGL_debug_renderer_info can be
 * blocked by privacy-hardened browsers (some Firefox configs, Brave) — so this
 * scores several weak signals together instead of gating on any one of them.
 * Call once on mount; don't re-run per frame.
 */
export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'mid'; // SSR-safe default

  const isTouchDevice =
    'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0;
  const cores = navigator.hardwareConcurrency || 4;
  // deviceMemory is non-standard (Chromium only); TS doesn't type it.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

  let renderer = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && debugInfo) {
      renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
  } catch {
    // Extension blocked or WebGL unavailable — fall through to the
    // cores/memory/touch heuristic below with renderer left blank.
  }

  const rendererLower = renderer.toLowerCase();
  const looksIntegratedMobile = /adreno|mali|powervr|apple gpu/.test(rendererLower);
  const looksDiscreteDesktop = /nvidia|geforce|radeon|rtx|gtx/.test(rendererLower);

  let score = 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  score += isTouchDevice ? -1 : 1;
  if (looksDiscreteDesktop) score += 2;
  if (looksIntegratedMobile) score -= 1;

  if (score <= 1) return 'low';
  if (score <= 4) return 'mid';
  return 'high';
}
