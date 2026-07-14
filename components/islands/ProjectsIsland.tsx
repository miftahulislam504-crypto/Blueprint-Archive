'use client';

import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { PROJECTS } from '@/data/projects';
import { mulberry32 } from '@/lib/noise/mulberry32';

interface ProjectMonolithProps {
  projectIndex: number;
  position: [number, number, number];
}

function ProjectMonolith({ projectIndex, position }: ProjectMonolithProps) {
  const [hovered, setHovered] = useState(false);
  const project = PROJECTS[projectIndex];

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: project.color,
        emissive: project.color,
        emissiveIntensity: hovered ? 1.4 : 0.5,
        roughness: 0.25,
        metalness: 0.3,
        toneMapped: false,
      }),
    [project.color, hovered]
  );

  return (
    <mesh
      position={position}
      material={material}
      scale={hovered ? [0.85, 2.15, 0.85] : [0.8, 2.0, 0.8]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        // Opening an actual project-detail "portal" is its own later
        // phase — this just confirms the click target is wired correctly.
        console.log('Open project:', project.name);
      }}
    >
      <octahedronGeometry args={[1, 0]} />
    </mesh>
  );
}

interface ProjectsIslandProps {
  center?: [number, number, number];
  spacing?: number;
}

export function ProjectsIsland({ center = [10, 1, -8], spacing = 2.8 }: ProjectsIslandProps) {
  const positions = useMemo(() => {
    const rand = mulberry32(99);
    const cols = Math.ceil(Math.sqrt(PROJECTS.length));
    return PROJECTS.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [
        center[0] + (col - cols / 2) * spacing + (rand() - 0.5) * 0.4,
        center[1],
        center[2] + row * spacing,
      ] as [number, number, number];
    });
  }, [center, spacing]);

  return (
    <>
      {PROJECTS.map((project, i) => (
        <ProjectMonolith key={project.name} projectIndex={i} position={positions[i]} />
      ))}
    </>
  );
}
