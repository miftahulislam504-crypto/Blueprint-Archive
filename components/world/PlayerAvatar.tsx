'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { movementInput } from '@/lib/input/movementInput';
import { playerPosition } from '@/lib/player/playerPosition';

const MODEL_PATH = '/models/avatar-adventurer.glb';

// The exported clip names are all prefixed with the source armature's own
// name ("CharacterArmature|Idle", not "Idle") — a common Blender/Mixamo
// glTF export convention. Named here once so the rest of the file can use
// short, readable keys instead of repeating the raw strings everywhere.
const CLIPS = {
  idle: 'CharacterArmature|Idle',
  walk: 'CharacterArmature|Walk',
  run: 'CharacterArmature|Run',
} as const;

const WALK_SPEED = 1.6;
const RUN_SPEED = 4.2;
const WALK_THRESHOLD = 0.15; // below this input magnitude, stay idle
const RUN_THRESHOLD = 0.7; // above this, run instead of walk
const TURN_SPEED = 10; // how fast the character re-faces its movement direction
const ANIMATION_CROSSFADE = 0.2;

/**
 * Camera-relative movement, animation crossfading, and CameraRig's
 * third-person follow offset all depend on one shared rotation
 * convention: rotation.y = 0 means facing -Z (the model's own default
 * "forward", assuming a fairly standard export — worth checking once
 * this actually renders, since if the source asset's own forward axis
 * turns out to be different, the fix is a fixed offset added to
 * targetAngle below, not a rethink of this whole approach).
 *
 * Given that, a target forward direction (dx, dz) needs
 * angle = atan2(-dx, -dz) to face it, and CameraRig's "stand behind the
 * character" offset is (sin(angle), cos(angle)) in the XZ plane — both
 * worked out directly from THREE's actual Y-rotation matrix rather than
 * assumed, since getting the sign wrong here would make the camera
 * follow from in front instead of behind.
 *
 * Not cloning the loaded scene (SkeletonUtils.clone(), the usual pattern
 * for animated GLTF characters) — that mainly matters for supporting
 * multiple simultaneous instances of the same skinned mesh, which this
 * doesn't need: there's only ever one avatar, and it only ever mounts/
 * unmounts sequentially (never two copies mounted at once), which
 * useAnimations already handles the mixer cleanup for correctly. Skipping
 * it avoids pulling in three-stdlib as a new dependency for something
 * this doesn't actually need.
 */
export function PlayerAvatar() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, group);
  const currentActionName = useRef<string>(CLIPS.idle);
  const { camera } = useThree();

  useEffect(() => {
    actions[CLIPS.idle]?.reset().play();
  }, [actions]);

  useFrame((_state, delta) => {
    if (!group.current) return;

    const inputX = movementInput.x;
    const inputZ = movementInput.z;
    const magnitude = movementInput.magnitude;

    let nextActionName: string = CLIPS.idle;

    if (magnitude > WALK_THRESHOLD) {
      // Camera-relative: "push forward" always means "away from the
      // camera", regardless of which way the camera currently faces —
      // otherwise controls would feel inverted whenever the camera isn't
      // pointing along -Z, which after any amount of following/turning
      // it usually won't be.
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();
      const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0));

      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, -inputZ)
        .addScaledVector(camRight, inputX);

      if (moveDir.lengthSq() > 0.0001) {
        moveDir.normalize();

        const speed = magnitude > RUN_THRESHOLD ? RUN_SPEED : WALK_SPEED;
        group.current.position.addScaledVector(moveDir, speed * delta);
        playerPosition.position.copy(group.current.position);

        const targetAngle = Math.atan2(-moveDir.x, -moveDir.z);
        // Shortest-path angle lerp — without wrapping the difference into
        // [-π, π] first, turning from just past -π to just past +π would
        // spin the long way around instead of snapping straight across
        // that seam.
        const current = group.current.rotation.y;
        let diff = targetAngle - current;
        diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
        group.current.rotation.y = current + diff * Math.min(TURN_SPEED * delta, 1);
        playerPosition.facingAngle = group.current.rotation.y;

        nextActionName = magnitude > RUN_THRESHOLD ? CLIPS.run : CLIPS.walk;
      }
    }

    if (nextActionName !== currentActionName.current) {
      actions[nextActionName]?.reset().fadeIn(ANIMATION_CROSSFADE).play();
      actions[currentActionName.current]?.fadeOut(ANIMATION_CROSSFADE);
      currentActionName.current = nextActionName;
    }
  });

  return (
    <group ref={group} position={[0, 0, 6]}>
      <primitive object={scene} />
    </group>
  );
}

// No module-level useGLTF.preload() here anymore — see AvatarPrefetch,
// which triggers this model's preload conditionally (on walk-mode button
// interaction, or a short idle timeout) instead of unconditionally on
// every page load. useGLTF itself still works exactly the same when this
// component actually mounts either way; this only changes when the
// download starts, not how it's loaded.
