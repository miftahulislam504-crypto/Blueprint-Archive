import type Lenis from 'lenis';

/**
 * LenisScrollProvider registers the live instance here on mount. Anything
 * that needs to programmatically scroll — right now just TeleportController
 * — reads it from here rather than needing its own ref threaded down from
 * layout.tsx, which would mean either prop-drilling through every page or
 * lifting Teleport state up into the provider itself.
 */
class LenisInstanceHolder {
  instance: Lenis | null = null;
}

export const lenisInstance = new LenisInstanceHolder();
