/**
 * Camera's current horizontal (XZ) position and facing, as a plain
 * singleton — same pattern as playerPosition/weatherIntensity/
 * movementInput. MiniMapTracker (inside the Canvas, where useThree/
 * useFrame work) writes this every frame; MiniMap (a DOM overlay outside
 * the Canvas, where those hooks aren't available) reads it via its own
 * requestAnimationFrame loop instead.
 *
 * Deliberately tracks the *camera* rather than playerPosition directly —
 * playerPosition only updates while PlayerAvatar is mounted (explore
 * mode), but the mini-map should still show where you are during the
 * guided scroll journey and free orbit too, and the camera always has a
 * real position regardless of which mode is driving it.
 */
class CameraPosition2DTracker {
  x = 0;
  z = 6; // matches WorldCanvas's default starting camera position
  /** Radians, 0 = facing -Z — same convention as playerPosition.facingAngle. */
  headingRadians = 0;
}

export const cameraPosition2D = new CameraPosition2DTracker();
