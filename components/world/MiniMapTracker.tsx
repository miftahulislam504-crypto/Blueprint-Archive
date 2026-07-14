'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraPosition2D } from '@/lib/player/cameraPosition2D';

/**
 * Bridges the camera's live position/facing out to a plain singleton —
 * MiniMap (a DOM overlay outside the Canvas) can't call useThree/useFrame
 * itself, so this is the component that actually can, purely to hand the
 * numbers across that boundary. Works the same regardless of which
 * cameraMode is currently driving the camera (scroll/orbit/explore),
 * since it just reads whatever the camera's actual current transform
 * already is rather than needing to know who's driving it.
 */
export function MiniMapTracker() {
  const { camera } = useThree();
  const forward = useRef(new THREE.Vector3());

  useFrame(() => {
    cameraPosition2D.x = camera.position.x;
    cameraPosition2D.z = camera.position.z;

    camera.getWorldDirection(forward.current);
    // Same rotation.y=0-means-facing--Z convention as PlayerAvatar/
    // CameraRig — atan2(-dx,-dz) for a direction vector (dx,dz).
    cameraPosition2D.headingRadians = Math.atan2(-forward.current.x, -forward.current.z);
  });

  return null;
}
