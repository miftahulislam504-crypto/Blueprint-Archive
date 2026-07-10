"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { registrationMarks, dimensionLines } from "@/scenes/sheetMarks";
import { segmentsToGeometry } from "@/scenes/glyphs";
import { RIBBON_X, PANEL_LENGTH, COVER_TRANSFORM } from "@/scenes/sheetLayout";

const LINEWORK = "#cfe8f3";
const BRASS = "#c9a15f";

export default function CoverPanel() {
  const lineGeometry = useMemo(() => {
    const segs = [...registrationMarks(1), ...dimensionLines(1)];
    return segmentsToGeometry(segs, 1.3);
  }, []);

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
    };
  }, [lineGeometry]);

  return (
    <group
      position={[RIBBON_X, COVER_TRANSFORM.y, COVER_TRANSFORM.z]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <lineSegments geometry={lineGeometry} position={[0, 0, 0.01]}>
        <lineBasicMaterial color={LINEWORK} transparent opacity={0.7} />
      </lineSegments>

      <Text
        fontSize={0.09}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.85, 0.012]}
        letterSpacing={0.25}
      >
        DRAWING NO. A-00 — SHEET 1 OF 11
      </Text>

      <Text
        fontSize={0.26}
        color={LINEWORK}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.4, 0.012]}
        letterSpacing={0.08}
        maxWidth={PANEL_LENGTH - 1.2}
        textAlign="center"
      >
        THE ARCHIVE
      </Text>

      <Text
        fontSize={0.11}
        color={LINEWORK}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.05, 0.012]}
        fillOpacity={0.65}
        maxWidth={PANEL_LENGTH - 1.6}
        textAlign="center"
      >
        Field notes from a civil engineer who builds his own tools
      </Text>

      <Text
        fontSize={0.075}
        color={BRASS}
        anchorX="center"
        anchorY="middle"
        position={[0, -1.1, 0.012]}
        letterSpacing={0.15}
        fillOpacity={0.8}
      >
        MIFTAHUL ISLAM — SIRAJGANJ, BANGLADESH
      </Text>
    </group>
  );
}
