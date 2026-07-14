/**
 * Current movement input as a 2D vector in screen-relative terms: x is
 * left(-1)/right(+1), z is forward(-1)/back(+1) — not yet a world-space
 * direction. PlayerAvatar converts it to one each frame using the
 * camera's own current facing, so "push forward" always means "away from
 * the camera" regardless of which way the camera/character happens to be
 * facing at the time.
 *
 * Kept outside React state/the Zustand store entirely: keyboard keydown/
 * keyup and, especially, touch-drag pointermove events fire far more
 * often than would be reasonable to route through state, since only
 * PlayerAvatar's own per-frame read ever needs the current value —
 * everything else would just be paying for re-renders nothing uses.
 */
class MovementInputTracker {
  x = 0;
  z = 0;

  get magnitude(): number {
    return Math.min(Math.hypot(this.x, this.z), 1);
  }
}

export const movementInput = new MovementInputTracker();
