'use client';

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TIMELINE_MILESTONES } from '@/data/timeline';

interface TimelineIslandProps {
  /** At least 2 points — the bridge follows a Catmull-Rom curve through these. */
  waypoints: [number, number, number][];
}

export function TimelineIsland({ waypoints }: TimelineIslandProps) {
  const curve = useMemo(() => {
    const points = waypoints.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points);
  }, [waypoints]);

  const bridgeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, waypoints.length * 20, 0.15, 8, false),
    [curve, waypoints.length]
  );

  const bridgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4B3F9E',
        emissive: '#5CE1FF',
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.4,
        toneMapped: false,
      }),
    []
  );

  // One milestone marker per entry, evenly spaced along the bridge's length
  // (0.5, 1.5, 2.5... divided by count keeps them off the very ends).
  const milestonePositions = useMemo(
    () =>
      TIMELINE_MILESTONES.map((_, i) => {
        const t = (i + 0.5) / TIMELINE_MILESTONES.length;
        return curve.getPointAt(t).toArray() as [number, number, number];
      }),
    [curve]
  );

  return (
    <>
      <mesh geometry={bridgeGeometry} material={bridgeMaterial} />

      {TIMELINE_MILESTONES.map((milestone, i) => (
        <Html
          key={milestone.label}
          position={milestonePositions[i]}
          transform
          occlude
          distanceFactor={6}
        >
          <div
            style={{
              width: 180,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(20, 15, 45, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(92, 225, 255, 0.35)',
              color: '#e8e6ff',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            <strong style={{ color: '#5CE1FF' }}>{milestone.label}</strong>
            <div style={{ opacity: 0.75, marginTop: 4 }}>{milestone.detail}</div>
          </div>
        </Html>
      ))}
    </>
  );
}
