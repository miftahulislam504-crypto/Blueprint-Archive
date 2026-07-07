"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ArchiveProject } from "@/data/projects";
import { buildGlyphSegments, segmentsToGeometry } from "@/scenes/glyphs";
import { registrationMarks, dimensionLines, hatchPatch } from "@/scenes/sheetMarks";

const SHEET_WIDTH = 2.6;
const SHEET_HEIGHT = 3.4;

const LINEWORK = "#cfe8f3";
const BRASS = "#c9a15f";
const PAPER = "#0f2847";

// Created once at module scope rather than inside useFrame — a fresh
// THREE.Color per frame, times every visible sheet, adds up to real
// per-frame allocation for no benefit since these two values never change.
const PAPER_COLOR = new THREE.Color(PAPER);
const BRASS_COLOR = new THREE.Color(BRASS);

export default function ArchiveSheet({
  project,
  index,
  position,
  rotationY,
  onSelect,
}: {
  project: ArchiveProject;
  index: number;
  position: [number, number, number];
  rotationY: number;
  onSelect: (project: ArchiveProject, index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const paperRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowLevel = useRef(0);

  // All linework for this sheet, built once per seed — deliberately mixes
  // the generic marks every sheet gets (registration, dimension, hatch)
  // with the one glyph specific to this project's category, so the sheet
  // reads as "this project's drawing", not "a drawing with this project's
  // label pasted on".
  const lineGeometry = useMemo(() => {
    const segs = [
      ...registrationMarks(project.seed),
      ...dimensionLines(project.seed),
      ...hatchPatch(project.seed),
      ...buildGlyphSegments(project.glyph, project.seed),
    ];
    return segmentsToGeometry(segs, 1.15);
  }, [project.seed, project.glyph]);

  // Both edge outlines are static per sheet — memoized so hovering (which
  // re-renders this component every pointer over/out) doesn't rebuild and
  // orphan a PlaneGeometry + EdgesGeometry pair on every single hover.
  const borderGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(SHEET_WIDTH, SHEET_HEIGHT)),
    []
  );
  const titleBlockBorderGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(SHEET_WIDTH - 0.2, 0.68)),
    []
  );

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      borderGeometry.dispose();
      titleBlockBorderGeometry.dispose();
    };
  }, [lineGeometry, borderGeometry, titleBlockBorderGeometry]);

  useFrame(() => {
    const target = hovered ? 1 : 0;
    glowLevel.current += (target - glowLevel.current) * 0.12;
    if (paperRef.current) {
      paperRef.current.color.lerpColors(
        PAPER_COLOR,
        BRASS_COLOR,
        glowLevel.current * 0.12
      );
    }
  });

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
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
      {/* The paper itself */}
      <mesh>
        <planeGeometry args={[SHEET_WIDTH, SHEET_HEIGHT]} />
        <meshBasicMaterial
          ref={paperRef}
          color={PAPER}
          transparent
          opacity={0.94}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sheet border */}
      <lineSegments geometry={borderGeometry} position={[0, 0, 0.001]}>
        <lineBasicMaterial color={LINEWORK} transparent opacity={0.5} />
      </lineSegments>

      {/* Registration marks, dimension lines, hatch, and the project glyph */}
      <lineSegments geometry={lineGeometry} position={[0, 0.3, 0.002]} scale={[0.62, 0.62, 1]}>
        <lineBasicMaterial color={LINEWORK} transparent opacity={0.85} />
      </lineSegments>

      {/* Title block, bottom edge */}
      <group position={[0, -SHEET_HEIGHT / 2 + 0.42, 0.003]}>
        <lineSegments geometry={titleBlockBorderGeometry}>
          <lineBasicMaterial color={LINEWORK} transparent opacity={0.4} />
        </lineSegments>

        <Text
          fontSize={0.1}
          color={BRASS}
          anchorX="left"
          anchorY="top"
          position={[-SHEET_WIDTH / 2 + 0.18, 0.24, 0]}
          maxWidth={SHEET_WIDTH - 0.4}
        >
          {project.sheetNumber}
        </Text>

        <Text
          fontSize={0.14}
          color={LINEWORK}
          anchorX="left"
          anchorY="top"
          position={[-SHEET_WIDTH / 2 + 0.18, 0.08, 0]}
          maxWidth={SHEET_WIDTH - 0.4}
        >
          {project.title.toUpperCase()}
        </Text>

        <Text
          fontSize={0.075}
          color={LINEWORK}
          anchorX="left"
          anchorY="top"
          position={[-SHEET_WIDTH / 2 + 0.18, -0.14, 0]}
          maxWidth={SHEET_WIDTH - 0.4}
          fillOpacity={0.6}
        >
          {project.system}
        </Text>
      </group>
    </group>
  );
}
