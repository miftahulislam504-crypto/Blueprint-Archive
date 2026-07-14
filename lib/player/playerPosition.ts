import * as THREE from 'three';

/**
 * PlayerAvatar and CameraRig are siblings, not parent/child, so passing
 * this directly as a prop isn't straightforward. A plain mutable
 * singleton — same pattern as weatherIntensity/audioEngine — avoids
 * routing per-frame position updates through the Zustand store, which
 * would mean every subscriber re-rendering 60 times a second for a value
 * only CameraRig's own useFrame ever actually needs.
 */
class PlayerPositionTracker {
  /** Starts near CameraRig's own first waypoint and WorldCanvas's default
   *  camera position — so switching into explore mode for the first time
   *  puts the avatar right where the camera already was. */
  position = new THREE.Vector3(0, 0, 6);

  /** Y-rotation in radians. 0 = facing -Z — see PlayerAvatar's own
   *  comment for the full derivation this and CameraRig's follow offset
   *  both depend on matching exactly. */
  facingAngle = 0;
}

export const playerPosition = new PlayerPositionTracker();
