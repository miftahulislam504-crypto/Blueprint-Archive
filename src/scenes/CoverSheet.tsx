"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { registrationMarks, dimensionLines } from "@/scenes/sheetMarks";
import { segmentsToGeometry } from "@/scenes/glyphs";
import { COVER_Z } from "@/scenes/sheetLayout";

const WIDTH = 3.2;
const HEIGHT = 4.1;
const LINEWORK = "#cfe8f3";
const BRASS = "#c9a15f";

export default function CoverSheet() {
  const lineGeometry = useMemo(() => {
    const segs = [...registrationMarks(1), ...dimensionLines(1)];
    return segmentsToGeometry(segs, 1.3);
  }, []);

  const borderGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(WIDTH, HEIGHT)),
    []
  );

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      borderGeometry.dispose();
    };
  }, [lineGeometry, borderGeometry]);

  return (
    <group position={[0, 0, COVER_Z]}>
      <mesh>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial color="#0f2847" transparent opacity={0.96} side={THREE.DoubleSide} />
      </mesh>

      <lineSegments geometry={borderGeometry} position={[0, 0, 0.001]}>
        <lineBasicMaterial color={LINEWORK} transparent opacity={0.55} />
      </lineSegments>

      <lineSegments geometry={lineGeometry} position={[0, 0, 0.002]}>
        <lineBasicMaterial color={LINEWORK} transparent opacity={0.7} />
      </lineSegments>

      <Text
        fontSize={0.09}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.85, 0.003]}
        letterSpacing={0.25}
      >
        DRAWING NO. A-00 — SHEET 1 OF 11
      </Text>

      <Text
        fontSize={0.26}
        color={LINEWORK}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.4, 0.003]}
        letterSpacing={0.08}
        maxWidth={WIDTH - 0.6}
        textAlign="center"
      >
        THE ARCHIVE
      </Text>

      <Text
        fontSize={0.11}
        color={LINEWORK}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.05, 0.003]}
        fillOpacity={0.65}
        maxWidth={WIDTH - 0.8}
        textAlign="center"
      >
        Field notes from a civil engineer who builds his own tools
      </Text>

      <Text
        fontSize={0.075}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        position={[0, -1.5, 0.003]}
        letterSpacing={0.15}
        fillOpacity={0.8}
      >
        MIFTAHUL ISLAM — SIRAJGANJ, BANGLADESH
      </Text>
    </group>
  );
}
