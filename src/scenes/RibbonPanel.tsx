"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ArchiveProject } from "@/data/projects";
import { buildGlyphSegments, segmentsToGeometry } from "@/scenes/glyphs";
import { registrationMarks, dimensionLines, hatchPatch } from "@/scenes/sheetMarks";
import { RIBBON_X, PANEL_LENGTH } from "@/scenes/sheetLayout";
import type { PanelTransform } from "@/scenes/sheetLayout";

const PANEL_HEIGHT = 3.0; // content height, slightly inside the ribbon's own edge fade
const LINEWORK = "#cfe8f3";
const BRASS = "#c9a15f";

// Reused across every panel instead of allocated per-frame inside useFrame.
const BRASS_COLOR = new THREE.Color(BRASS);
const LINEWORK_COLOR = new THREE.Color(LINEWORK);

export default function RibbonPanel({
  project,
  index,
  transform,
  onSelect,
}: {
  project: ArchiveProject;
  index: number;
  transform: PanelTransform;
  onSelect: (project: ArchiveProject, index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.LineBasicMaterial>(null);
  const glowLevel = useRef(0);

  const lineGeometry = useMemo(() => {
    const segs = [
      ...registrationMarks(project.seed),
      ...dimensionLines(project.seed),
      ...hatchPatch(project.seed),
      ...buildGlyphSegments(project.glyph, project.seed),
    ];
    return segmentsToGeometry(segs, 1.15);
  }, [project.seed, project.glyph]);

  const titleBlockBorderGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(PANEL_LENGTH - 0.6, 0.68)),
    []
  );

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      titleBlockBorderGeometry.dispose();
    };
  }, [lineGeometry, titleBlockBorderGeometry]);

  useFrame(() => {
    const target = hovered ? 1 : 0;
    glowLevel.current += (target - glowLevel.current) * 0.12;
    if (glowRef.current) {
      glowRef.current.color.lerpColors(LINEWORK_COLOR, BRASS_COLOR, glowLevel.current);
      glowRef.current.opacity = 0.7 + glowLevel.current * 0.3;
    }
  });

  return (
    <group
      position={[RIBBON_X, transform.y, transform.z]}
      rotation={[0, Math.PI / 2, 0]}
    >
      {/* Invisible hit-area sized to the panel, since the paper itself now
          belongs to the shared ArchiveRibbon rather than to each panel. */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project, index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[PANEL_LENGTH, PANEL_HEIGHT]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Registration marks, dimension lines, hatch, and the project glyph */}
      <lineSegments geometry={lineGeometry} position={[0, 0.28, 0.01]} scale={[0.68, 0.62, 1]}>
        <lineBasicMaterial ref={glowRef} color={LINEWORK} transparent opacity={0.85} />
      </lineSegments>

      {/* Title block, bottom edge of the panel */}
      <group position={[0, -PANEL_HEIGHT / 2 + 0.42, 0.012]}>
        <lineSegments geometry={titleBlockBorderGeometry}>
          <lineBasicMaterial color={LINEWORK} transparent opacity={0.35} />
        </lineSegments>

        <Text
          fontSize={0.1}
          color={BRASS}
          anchorX="left"
          anchorY="top"
          position={[-PANEL_LENGTH / 2 + 0.3, 0.24, 0]}
        >
          {project.sheetNumber}
        </Text>

        <Text
          fontSize={0.15}
          color={LINEWORK}
          anchorX="left"
          anchorY="top"
          position={[-PANEL_LENGTH / 2 + 0.3, 0.07, 0]}
        >
          {project.title.toUpperCase()}
        </Text>

        <Text
          fontSize={0.078}
          color={LINEWORK}
          anchorX="left"
          anchorY="top"
          position={[-PANEL_LENGTH / 2 + 0.3, -0.15, 0]}
          maxWidth={PANEL_LENGTH - 0.7}
          fillOpacity={0.6}
        >
          {project.system}
        </Text>
      </group>
    </group>
  );
}
