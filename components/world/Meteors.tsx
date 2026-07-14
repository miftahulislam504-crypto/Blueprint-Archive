'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/noise/mulberry32';

interface MeteorsProps {
  count?: number;
  seed?: number;
  color?: string;
  /** Seconds for one full traversal from far start to far end before it
   *  loops back — most of this is spent well outside the visible dome, so
   *  only a brief window near the middle of each cycle actually streaks
   *  across the sky. */
  cycleDuration?: number;
}

interface MeteorPath {
  start: THREE.Vector3;
  end: THREE.Vector3;
  phaseOffset: number;
  cycleDuration: number;
  size: number;
}

interface MeteorProps {
  path: MeteorPath;
  color: string;
}

/**
 * Each meteor travels one continuous straight line: from a point ~130
 * units out on one side, through a randomized "closest approach" point
 * near the origin (well within the ~28-unit range CameraRig actually
 * travels), out to another point ~130 units out the other side — then
 * loops straight back to the start. Both true endpoints sit far outside
 * anything ever rendered (well past AuroraSky's radius-80 backdrop), so
 * the instant loop-back happens entirely off-screen.
 *
 * That sidesteps the more obvious approach of toggling visibility on/off
 * between "streaking" and "resting" phases: the moment a Trail's target
 * teleports from a visible point straight to a resting position, the
 * trail draws one frame connecting the two — a flash of an absurdly long
 * line. Continuous motion the whole cycle, with both ends already
 * off-screen, means there's never a jump for it to draw.
 */
export function Meteors({
  count = 5,
  seed = 71,
  color = '#FFEFD9',
  cycleDuration = 9,
}: MeteorsProps) {
  const paths = useMemo<MeteorPath[]>(() => {
    const rand = mulberry32(seed);
    const farDistance = 130;

    return Array.from({ length: count }, () => {
      // Closest-approach point: near the origin, biased toward the upper
      // sky rather than down where the world's landmarks sit.
      const closest = new THREE.Vector3(
        (rand() - 0.5) * 50,
        20 + rand() * 25,
        (rand() - 0.5) * 40
      );

      // Mostly-downward, mostly-sideways direction — a classic diagonal
      // "shooting star" streak rather than falling straight down or
      // drifting flat across.
      const dir = new THREE.Vector3(
        rand() - 0.5,
        -(0.4 + rand() * 0.4),
        rand() - 0.5
      ).normalize();

      return {
        start: closest.clone().addScaledVector(dir, -farDistance),
        end: closest.clone().addScaledVector(dir, farDistance),
        phaseOffset: rand() * cycleDuration,
        cycleDuration: cycleDuration * (0.85 + rand() * 0.3),
        size: 0.12 + rand() * 0.1,
      };
    });
  }, [count, seed, cycleDuration]);

  return (
    <>
      {paths.map((path, i) => (
        <Meteor key={i} path={path} color={color} />
      ))}
    </>
  );
}

function Meteor({ path, color }: MeteorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.getElapsedTime() + path.phaseOffset) % path.cycleDuration;
    const progress = t / path.cycleDuration;
    meshRef.current.position.lerpVectors(path.start, path.end, progress);
  });

  // No custom `attenuation` override here — drei's default already maps
  // the 0-1 position along the trail straight to a width multiplier,
  // which tapers on its own. Overriding it means guessing at the exact
  // parameter contract with no way to render-check the result.
  return (
    <Trail width={2.5} length={7} decay={1.3} color={color}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[path.size, 6, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}
