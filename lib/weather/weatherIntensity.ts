import type { WeatherCondition } from '@/stores/useWorldStore';

const TRANSITION_SECONDS = 6;

/**
 * Tracks a smooth 0-1 "how strongly is this condition showing right now"
 * value per weather condition, crossfading over TRANSITION_SECONDS
 * whenever the active condition changes.
 *
 * Deliberately NOT part of the Zustand store: the store holds
 * `weatherCondition`, the discrete *target* (see useWorldStore), which
 * only changes every so often and is fine for React to re-render on. This
 * tracks the actual per-frame animated value instead — updating that in
 * the store would mean every component reading it re-renders 60 times a
 * second. Components call getIntensity() directly inside their own
 * useFrame instead, the same way they'd read state.clock — no
 * subscription, no re-render, just a plain read.
 */
class WeatherIntensityTracker {
  private current: WeatherCondition = 'clear';
  private previous: WeatherCondition = 'clear';
  private transitionStartedAt = 0;

  /** Call this once, whenever the store's weatherCondition changes (see
   *  WeatherSystem) — not from every component that reads intensity. */
  setCondition(condition: WeatherCondition, nowSeconds: number) {
    if (condition === this.current) return;
    this.previous = this.current;
    this.current = condition;
    this.transitionStartedAt = nowSeconds;
  }

  /** How strongly `condition` should be showing right now, 0-1. Safe to
   *  call every frame from any component's own useFrame. */
  getIntensity(condition: WeatherCondition, nowSeconds: number): number {
    const elapsed = nowSeconds - this.transitionStartedAt;
    const t = Math.min(Math.max(elapsed / TRANSITION_SECONDS, 0), 1);

    if (condition === this.current) return t;
    if (condition === this.previous) return 1 - t;
    return 0;
  }
}

export const weatherIntensity = new WeatherIntensityTracker();
