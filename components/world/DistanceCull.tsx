'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { cameraPosition2D } from '@/lib/player/cameraPosition2D';

interface DistanceCullProps {
  /** World-space XZ center of whatever this wraps. */
  center: [number, number];
  /** Camera further than this from `center` unmounts the children
   *  entirely. Pick per-group based on how big/tall that group's own
   *  content is — a CrystalMountain visible from far away needs a much
   *  larger radius than a small FloatingPlatforms cluster. */
  radius: number;
  /** Extra margin added only to the *remount* distance, not the unmount
   *  one — without this, a camera sitting almost exactly on the boundary
   *  would mount/unmount every single frame as float jitter nudges it
   *  back and forth across one shared threshold. */
  hysteresis?: number;
  /** Checked at most this often, in seconds — distance-to-camera doesn't
   *  need recomputing 60 times a second for something this coarse-grained;
   *  matches the kind of interval CameraRig-adjacent code already treats
   *  as "frequent enough." */
  checkInterval?: number;
  children: ReactNode;
}

/**
 * True GPU occlusion culling (hardware occlusion queries, or a software
 * BVH raycast test) isn't something this project's stack exposes through
 * R3F/Three's standard WebGL path without significant custom renderer
 * work — same category of limitation Effects.tsx already documents for
 * SSR/GodRays/Motion Blur. Three.js's own automatic frustum culling
 * already skips *drawing* meshes outside the camera frustum, but it does
 * that per-mesh at the GPU submission stage — every wrapped component's
 * React tree, useFrame callbacks, and instance-matrix math still run
 * every frame regardless, and meshes behind the camera (common through
 * most of this world's 26-unit-long scroll journey) still get that
 * per-frame CPU cost paid for nothing.
 *
 * This is the practical fix at the level this project can actually
 * reach: unmount the whole subtree once the camera is far enough away,
 * remount it once back in range. For something like CrystalMountain (a
 * static mesh with no useFrame at all) this mainly saves draw calls and
 * GPU memory residency; for FloatingPlatforms/CrystalForest/Firefly
 * (things with real per-frame instance-matrix or shader-uniform work)
 * it also removes their per-frame CPU cost entirely while far away.
 *
 * Reads cameraPosition2D — the same per-frame singleton MiniMapTracker
 * already writes — rather than needing its own useThree() camera
 * subscription, so this works identically regardless of which
 * cameraMode (scroll/orbit/explore) is currently driving the camera.
 */
export function DistanceCull({
  center,
  radius,
  hysteresis = radius * 0.15,
  checkInterval = 0.2,
  children,
}: DistanceCullProps) {
  const [visible, setVisible] = useState(true);
  const elapsedSinceCheck = useRef(0);

  useFrame((_state, delta) => {
    elapsedSinceCheck.current += delta;
    if (elapsedSinceCheck.current < checkInterval) return;
    elapsedSinceCheck.current = 0;

    const dx = cameraPosition2D.x - center[0];
    const dz = cameraPosition2D.z - center[1];
    const dist = Math.sqrt(dx * dx + dz * dz);

    setVisible((prev) => {
      if (prev) {
        // Currently mounted — only unmount once clearly past radius,
        // not right at it.
        return dist <= radius + hysteresis;
      }
      // Currently unmounted — remount once back inside the plain
      // radius (no added margin needed on this side; the asymmetry
      // itself is what prevents the flicker).
      return dist <= radius;
    });
  });

  // Runs the very first distance check synchronously on mount instead of
  // waiting up to `checkInterval` seconds into the first frame — matters
  // most for a group that starts far from the camera's initial position
  // (e.g. contact island at scroll-start), which should never flash
  // visible-then-cull on first paint.
  useEffect(() => {
    const dx = cameraPosition2D.x - center[0];
    const dz = cameraPosition2D.z - center[1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    setVisible(dist <= radius + hysteresis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return visible ? <>{children}</> : null;
}
