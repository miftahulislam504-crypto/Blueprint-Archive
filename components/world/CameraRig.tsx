'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '@/stores/useWorldStore';
import { playerPosition } from '@/lib/player/playerPosition';

// Placeholder waypoints, roughly one per island (Hero, About, Skills,
// Projects, Timeline, Achievement, Experience, Blog, Contact). These prove
// the path-following mechanism works — real positions get set island by
// island as each one's actual geometry exists in later phases.
const WAYPOINTS: [number, number, number][] = [
  [0, 0, 6],
  [4, 0.5, 3],
  [8, -0.5, 0],
  [10, 1, -5],
  [8, 0, -10],
  [4, -1, -14],
  [0, 0.5, -18],
  [-4, 0, -22],
  [0, 0, -26],
];

export function CameraRig() {
  const { camera } = useThree();
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const lookAtTarget = useRef(new THREE.Vector3());

  // Default closed/curveType/tension are exactly what we want here
  // (open path, centripetal — avoids loops/cusps between waypoints).
  const curve = useMemo(() => {
    const points = WAYPOINTS.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((_state, delta) => {
    // Third-person follow behind whatever PlayerAvatar is currently doing
    // — see PlayerAvatar's own comment for the full rotation-convention
    // derivation this offset depends on (rotation.y=0 means facing -Z,
    // so "behind" is (sin(angle), cos(angle)) in the XZ plane).
    if (cameraMode === 'explore') {
      const pos = playerPosition.position;
      const angle = playerPosition.facingAngle;

      const offsetDistance = 4.5;
      const offsetHeight = 2.4;
      const desiredPos = new THREE.Vector3(
        pos.x + Math.sin(angle) * offsetDistance,
        pos.y + offsetHeight,
        pos.z + Math.cos(angle) * offsetDistance
      );

      // Frame-rate-independent smoothing: converges toward the target at
      // the same rate regardless of delta, unlike a fixed lerp factor
      // which would behave differently at 30fps vs 60fps.
      //
      // Deliberately laggy (0.05 base, not 0.0001): if the camera snapped
      // to "directly behind the player" every frame, turning would be
      // invisible — the camera rotates with the player in lockstep, so
      // pushing the stick sideways/backward always just looks like
      // walking straight into the same view. Lagging the camera behind
      // the player's rotation is what makes a turn actually read as a
      // turn on screen.
      const smoothing = 1 - Math.pow(0.05, delta);
      camera.position.lerp(desiredPos, smoothing);

      lookAtTarget.current.set(pos.x, pos.y + 1.2, pos.z);
      camera.lookAt(lookAtTarget.current);
      return;
    }

    // In orbit mode, drei's <OrbitControls> owns the camera — bail out
    // so we don't fight it every frame.
    if (cameraMode !== 'scroll') return;

    // Read scrollProgress via getState() rather than the reactive hook:
    // it changes every frame, and subscribing reactively here would
    // re-render this component 60x/sec for no benefit since nothing in
    // its JSX depends on the value.
    const t = useWorldStore.getState().scrollProgress;
    const clampedT = THREE.MathUtils.clamp(t, 0, 1);
    const lookAheadT = THREE.MathUtils.clamp(t + 0.02, 0, 1);

    camera.position.copy(curve.getPointAt(clampedT));
    lookAtTarget.current.copy(curve.getPointAt(lookAheadT));
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
