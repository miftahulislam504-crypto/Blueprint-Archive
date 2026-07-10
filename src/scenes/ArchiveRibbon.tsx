"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  RIBBON_X,
  RIBBON_LENGTH,
  RIBBON_CENTER_Z,
  PANEL_LENGTH,
  PANEL_TRANSFORMS,
  COVER_TRANSFORM,
} from "@/scenes/sheetLayout";

const RIBBON_HEIGHT = 3.6;
const PAPER_COLOR = new THREE.Color("#0f2847");
const LINE_COLOR = new THREE.Color("#cfe8f3");

// Grid density chosen so each cell reads as roughly a half-unit square in
// world space, regardless of how long the ribbon actually is — using the
// same density for both UV axes would stretch the grid into rectangles
// once the length axis is many times longer than the height axis.
const CELL_SIZE = 0.55;

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uPaperColor;
  uniform vec3 uLineColor;
  uniform float uGridU;
  uniform float uGridV;
  varying vec2 vUv;

  float gridLine(float coord) {
    float f = fract(coord);
    float d = min(f, 1.0 - f);
    return 1.0 - smoothstep(0.0, 0.025, d);
  }

  void main() {
    float lineU = gridLine(vUv.x * uGridU);
    float lineV = gridLine(vUv.y * uGridV);
    float grid = max(lineU, lineV) * 0.5;

    // Soft top/bottom fade so the ribbon reads as paper trailing into the
    // void rather than a hard-edged slab.
    float edgeFade = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);

    vec3 color = mix(uPaperColor, uLineColor, grid);
    float alpha = 0.92 * mix(0.55, 1.0, edgeFade);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function ArchiveRibbon() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uPaperColor: { value: PAPER_COLOR },
        uLineColor: { value: LINE_COLOR },
        uGridU: { value: RIBBON_LENGTH / CELL_SIZE },
        uGridV: { value: RIBBON_HEIGHT / CELL_SIZE },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  // Explicit divider marks at every panel boundary — computed directly
  // from the same PANEL_TRANSFORMS the panels themselves render from,
  // rather than re-derived from UV inside the shader, so there's no risk
  // of the dividers drifting out of sync with where a panel actually is.
  const dividerGeometry = useMemo(() => {
    // Consecutive panel/cover centers sit exactly PANEL_LENGTH apart by
    // construction, so every boundary is a center minus half that spacing
    // — minus, not plus, since Z decreases moving deeper into the
    // archive. Using +PANEL_LENGTH/2 here once placed the cover's
    // boundary mark out past the cover panel's own front edge instead of
    // between the cover and the first project panel.
    const boundaries = [
      COVER_TRANSFORM.z - PANEL_LENGTH / 2,
      ...PANEL_TRANSFORMS.map((p) => p.z - PANEL_LENGTH / 2),
    ];
    const positions = new Float32Array(boundaries.length * 6);
    boundaries.forEach((z, i) => {
      positions[i * 6 + 0] = RIBBON_X;
      positions[i * 6 + 1] = -RIBBON_HEIGHT / 2 + 0.15;
      positions[i * 6 + 2] = z;
      positions[i * 6 + 3] = RIBBON_X;
      positions[i * 6 + 4] = RIBBON_HEIGHT / 2 - 0.15;
      positions[i * 6 + 5] = z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
      dividerGeometry.dispose();
    };
  }, [material, dividerGeometry]);

  return (
    <group>
      <mesh
        position={[RIBBON_X, 0, RIBBON_CENTER_Z]}
        rotation={[0, Math.PI / 2, 0]}
        material={material}
      >
        <planeGeometry args={[RIBBON_LENGTH, RIBBON_HEIGHT]} />
      </mesh>

      <lineSegments geometry={dividerGeometry} position={[0.01, 0, 0]}>
        <lineBasicMaterial color="#c9a15f" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}
