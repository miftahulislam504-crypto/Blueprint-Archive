'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerPosition } from '@/lib/player/playerPosition';
import { useWorldStore } from '@/stores/useWorldStore';
import { useSecretsStore } from '@/stores/useSecretsStore';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { Sparkle } from './Sparkle';

interface TreasureChestProps {
  position?: [number, number, number];
  rotationY?: number;
  /** Called when the opened chest itself is tapped — wires the mini-game
   *  as a reward found INSIDE the chest, rather than needing a second
   *  separate UI surface just to reach it. Optional so this component
   *  still works standalone/without that chain wired up. */
  onLaunchGame?: () => void;
}

const OPEN_DISTANCE = 1.6;
const LID_OPEN_ANGLE = -Math.PI * 0.65;
const LID_ANIM_SPEED = 4;

/**
 * No CSG/chest model in this project (see public/models — nothing chest-
 * shaped exists), so this is hand-built from a box base + a hinged lid
 * box, matching the same "primitives over new assets" approach Cave
 * already takes for its rock cluster. Sits deep in Cave's tunnel (see
 * page.tsx placement) — only reachable in 'explore' mode, since scroll/
 * orbit mode's camera path never actually enters the tunnel interior.
 *
 * Opens automatically on proximity rather than needing a tap — matches
 * how a "found it by wandering somewhere you weren't obviously pointed"
 * secret should feel; a required extra tap would just be friction after
 * someone's already done the actual work of finding it.
 */
export function TreasureChest({ position = [0, 0, 0], rotationY = 0, onLaunchGame }: TreasureChestProps) {
  const lidRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);
  const [opened, setOpened] = useState(false);
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const unlock = useSecretsStore((s) => s.unlock);
  const worldPos = useMemo(() => new THREE.Vector3(...position), [position]);
  // Sparkle's `center` prop bakes straight into world-space vertex
  // positions (see ParticleField) rather than respecting a parent
  // group's transform, so it's rendered as a sibling below using this
  // pre-computed world point instead of being nested inside the chest's
  // own rotated <group>.
  const sparkleCenter = useMemo<[number, number, number]>(
    () => [position[0], position[1] + 0.4, position[2]],
    [position]
  );

  const woodMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3a2a1f', roughness: 0.8, metalness: 0.1 }),
    []
  );
  const trimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4B3F9E',
        emissive: '#5CE1FF',
        emissiveIntensity: opened ? 1.4 : 0.5,
        roughness: 0.3,
        metalness: 0.4,
        toneMapped: false,
      }),
    [opened]
  );
  const orbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7ef2a8',
        emissive: '#7ef2a8',
        emissiveIntensity: 1.6,
        roughness: 0.15,
        metalness: 0.3,
        toneMapped: false,
      }),
    []
  );
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (cameraMode === 'explore' && !opened) {
      const dist = playerPosition.position.distanceTo(worldPos);
      if (dist < OPEN_DISTANCE) {
        setOpened(true);
        unlock('treasureChest');
        audioEngine.playTone({ frequency: 523, duration: 0.15, type: 'triangle', volume: 0.16 });
        window.setTimeout(() => {
          audioEngine.playTone({ frequency: 784, duration: 0.15, type: 'triangle', volume: 0.14 });
        }, 100);
        window.setTimeout(() => {
          audioEngine.playTone({ frequency: 1047, duration: 0.3, type: 'triangle', volume: 0.14 });
        }, 200);
      }
    }

    // Smoothly animate the lid toward its target angle regardless of
    // exactly which frame `opened` flipped true on.
    const target = opened ? LID_OPEN_ANGLE : 0;
    const diff = target - currentAngle.current;
    if (Math.abs(diff) > 0.001 && lidRef.current) {
      currentAngle.current += diff * Math.min(LID_ANIM_SPEED * delta, 1);
      lidRef.current.rotation.x = currentAngle.current;
    }

    // Gentle bob + spin on the reward orb once revealed — reads as "this
    // is the interactive thing," distinct from the static wood/trim
    // around it, without needing a label or tooltip to explain it.
    if (opened && orbRef.current) {
      orbRef.current.rotation.y += delta * 0.8;
      orbRef.current.position.y = 0.32 + Math.sin(state.clock.getElapsedTime() * 1.6) * 0.03;
    }
  });

  return (
    <>
      <group position={position} rotation={[0, rotationY, 0]}>
        {/* Base */}
        <mesh material={woodMaterial} position={[0, 0.18, 0]}>
          <boxGeometry args={[0.62, 0.36, 0.42]} />
        </mesh>
        <mesh material={trimMaterial} position={[0, 0.06, 0.22]}>
          <boxGeometry args={[0.66, 0.06, 0.02]} />
        </mesh>

        {/* Lid — pivots from its back edge, hence the group offset trick:
            the group origin sits at the hinge line (back-top of the base),
            and the mesh inside is offset forward so it rotates around that
            line instead of its own center. */}
        <group ref={lidRef} position={[0, 0.36, -0.21]}>
          <mesh material={woodMaterial} position={[0, 0.08, 0.21]}>
            <boxGeometry args={[0.62, 0.16, 0.42]} />
          </mesh>
          <mesh material={trimMaterial} position={[0, 0.16, 0.21]}>
            <boxGeometry args={[0.66, 0.02, 0.44]} />
          </mesh>
        </group>

        <pointLight
          color="#5CE1FF"
          position={[0, 0.4, 0]}
          intensity={opened ? 1.6 : 0.5}
          distance={opened ? 3.5 : 1.8}
          decay={2}
        />

        {opened && onLaunchGame && (
          <mesh
            ref={orbRef}
            material={orbMaterial}
            position={[0, 0.32, 0]}
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playClick();
              onLaunchGame();
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <icosahedronGeometry args={[0.09, 0]} />
          </mesh>
        )}
      </group>

      {opened && <Sparkle center={sparkleCenter} radius={0.5} count={26} seed={777} />}
    </>
  );
}
