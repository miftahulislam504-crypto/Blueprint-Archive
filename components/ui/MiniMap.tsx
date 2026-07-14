'use client';

import { useEffect, useRef, useState } from 'react';
import { cameraPosition2D } from '@/lib/player/cameraPosition2D';

// Loosely the islands' own bounding box (Hero through Contact), padded —
// see page.tsx for where each island actually sits; hand-copied here
// rather than imported since these are static art-direction values, not
// runtime state, and threading a shared constants module through both
// files is more machinery than a handful of numbers that won't change
// often is worth.
const WORLD_BOUNDS = { minX: -7, maxX: 13, minZ: -32, maxZ: 5 };
const MAP_WIDTH = 110;
const MAP_HEIGHT = 200;
const UPDATE_INTERVAL_MS = 80; // ~12fps — a small marker doesn't need 60fps smoothness

const ISLANDS: { name: string; x: number; z: number }[] = [
  { name: 'Hero', x: 0, z: 0 },
  { name: 'About', x: 4, z: 0 },
  { name: 'Skills', x: 8, z: -3 },
  { name: 'Projects', x: 10, z: -8 },
  { name: 'Achievement', x: 4, z: -14 },
  { name: 'Experience', x: 0, z: -18 },
  { name: 'Blog', x: -4, z: -22 },
  { name: 'Contact', x: 0, z: -26 },
];

function toMapPoint(x: number, z: number) {
  const px = ((x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)) * MAP_WIDTH;
  const py = ((z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ)) * MAP_HEIGHT;
  return { px, py };
}

/**
 * Reads cameraPosition2D — written every frame by MiniMapTracker inside
 * the Canvas — via its own throttled requestAnimationFrame loop, since
 * this renders outside the Canvas where useFrame isn't available.
 *
 * Deliberately minimal: dots for the 8 islands (Timeline's a bridge
 * between two of them, not a point of its own, so it's not marked
 * separately) plus a heading-aware triangle for the current camera
 * position — no labels, no tap-to-teleport. A mini-map's job is "what
 * shape is the journey, roughly where am I in it," not a detailed atlas;
 * teleporting there is Teleport Portal's job, not this one's.
 */
export function MiniMap() {
  const [player, setPlayer] = useState({ px: 0, py: 0, heading: 0 });
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    let frameId: number;

    const tick = (time: number) => {
      if (time - lastUpdateRef.current > UPDATE_INTERVAL_MS) {
        lastUpdateRef.current = time;
        const { px, py } = toMapPoint(cameraPosition2D.x, cameraPosition2D.z);
        setPlayer({ px, py, heading: cameraPosition2D.headingRadians });
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        borderRadius: 12,
        background: 'rgba(20, 15, 45, 0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(92, 225, 255, 0.2)',
        zIndex: 30,
        overflow: 'hidden',
      }}
    >
      <svg width={MAP_WIDTH} height={MAP_HEIGHT} style={{ display: 'block' }}>
        {ISLANDS.map((island) => {
          const { px, py } = toMapPoint(island.x, island.z);
          const isHero = island.name === 'Hero';
          return (
            <circle
              key={island.name}
              cx={px}
              cy={py}
              r={isHero ? 3.5 : 2.5}
              fill={isHero ? '#5CE1FF' : 'rgba(232, 230, 255, 0.55)'}
            />
          );
        })}

        {/* Points "up" (toward smaller z / earlier islands, since
            toMapPoint maps decreasing z to decreasing py) at heading 0,
            matching the facing-(-Z)-at-angle-0 convention used
            everywhere else. SVG's rotate() is clockwise for positive
            degrees, the opposite rotational sense from the
            counter-clockwise-positive math convention this project's
            angles otherwise use — negating here is what keeps the two
            consistent, not a typo. */}
        <polygon
          points="0,-6 4,5 -4,5"
          fill="#5CE1FF"
          transform={`translate(${player.px}, ${player.py}) rotate(${(-player.heading * 180) / Math.PI})`}
        />
      </svg>
    </div>
  );
}
