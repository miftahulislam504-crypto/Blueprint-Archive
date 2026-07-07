import * as THREE from "three";
import type { GlyphKind } from "@/data/projects";

/**
 * Every sheet's centerpiece is a small piece of drafted line-art, not an
 * icon — literal line segments, like something a hand drew with a
 * straightedge. Each category below returns an array of [x, y] point pairs
 * in a local -1..1 space; ArchiveSheet scales/positions the result. Kept
 * as flat data (not JSX) so the same generator can build either a
 * THREE.BufferGeometry for the sheet or, in principle, be reused anywhere
 * else linework is needed.
 */

type Segment = [number, number, number, number]; // x1, y1, x2, y2

// Small deterministic PRNG so a given seed always draws the same glyph —
// no external RNG dependency needed for this.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function structuralGlyph(): Segment[] {
  // A beam cross-section: I-beam profile plus two dimension lines, the
  // most literal "civil engineering" mark in the set.
  const segs: Segment[] = [];
  // Top flange
  segs.push([-0.6, 0.55, 0.6, 0.55]);
  segs.push([-0.6, 0.4, 0.6, 0.4]);
  segs.push([-0.6, 0.55, -0.6, 0.4]);
  segs.push([0.6, 0.55, 0.6, 0.4]);
  // Web
  segs.push([-0.08, 0.4, -0.08, -0.4]);
  segs.push([0.08, 0.4, 0.08, -0.4]);
  // Bottom flange
  segs.push([-0.6, -0.4, 0.6, -0.4]);
  segs.push([-0.6, -0.55, 0.6, -0.55]);
  segs.push([-0.6, -0.4, -0.6, -0.55]);
  segs.push([0.6, -0.4, 0.6, -0.55]);
  // Dimension line, offset to the right, with tick ends
  segs.push([0.85, 0.55, 0.85, -0.55]);
  segs.push([0.8, 0.55, 0.9, 0.55]);
  segs.push([0.8, -0.55, 0.9, -0.55]);
  return segs;
}

function hubGlyph(seed: number): Segment[] {
  // Radial spokes from a center hub, like the CivilOS Hub switchboard.
  const rand = mulberry32(seed);
  const segs: Segment[] = [];
  const spokeCount = 6;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2 + rand() * 0.15;
    const r1 = 0.18;
    const r2 = 0.62 + rand() * 0.08;
    segs.push([
      Math.cos(angle) * r1,
      Math.sin(angle) * r1,
      Math.cos(angle) * r2,
      Math.sin(angle) * r2,
    ]);
  }
  // Small hub ring, approximated with short segments
  const ringSegments = 16;
  for (let i = 0; i < ringSegments; i++) {
    const a1 = (i / ringSegments) * Math.PI * 2;
    const a2 = ((i + 1) / ringSegments) * Math.PI * 2;
    segs.push([
      Math.cos(a1) * 0.18,
      Math.sin(a1) * 0.18,
      Math.cos(a2) * 0.18,
      Math.sin(a2) * 0.18,
    ]);
  }
  return segs;
}

function ledgerGlyph(seed: number): Segment[] {
  // A stepped bar chart / ledger tally, for the estimation & cost tool.
  const rand = mulberry32(seed);
  const segs: Segment[] = [];
  const bars = 5;
  const spacing = 1.1 / bars;
  for (let i = 0; i < bars; i++) {
    const x = -0.55 + i * spacing;
    const h = 0.25 + rand() * 0.55;
    segs.push([x, -0.5, x, -0.5 + h]);
    segs.push([x, -0.5 + h, x + spacing * 0.7, -0.5 + h]);
  }
  segs.push([-0.6, -0.5, 0.6, -0.5]); // baseline
  return segs;
}

function toolkitGlyph(seed: number): Segment[] {
  // A compass/caliper pair — the multi-tool suite mark.
  const rand = mulberry32(seed);
  const spread = 0.35 + rand() * 0.1;
  const segs: Segment[] = [];
  segs.push([0, 0.55, -spread, -0.55]);
  segs.push([0, 0.55, spread, -0.55]);
  segs.push([0, 0.55, 0, 0.4]); // hinge stub
  // Small arc at the base implied by short chord segments
  const arcSteps = 8;
  for (let i = 0; i < arcSteps; i++) {
    const t1 = i / arcSteps;
    const t2 = (i + 1) / arcSteps;
    segs.push([
      -spread * (1 - t1) + spread * t1 * 0.15,
      -0.55 + t1 * 0.12,
      -spread * (1 - t2) + spread * t2 * 0.15,
      -0.55 + t2 * 0.12,
    ]);
  }
  return segs;
}

function moleculeGlyph(seed: number): Segment[] {
  // A hexagonal ring plus bonds, for the chemistry curriculum.
  const rand = mulberry32(seed);
  const segs: Segment[] = [];
  const r = 0.42;
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  for (let i = 0; i < 6; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % 6];
    segs.push([x1, y1, x2, y2]);
  }
  // A couple of substituent bonds sticking outward, seeded
  for (let i = 0; i < 2; i++) {
    const idx = Math.floor(rand() * 6);
    const [x, y] = points[idx];
    const outward = 1.5;
    segs.push([x, y, x * outward, y * outward]);
  }
  return segs;
}

function pulseGlyph(): Segment[] {
  // A heartbeat/ECG trace, for the fitness commerce project.
  const pts: [number, number][] = [
    [-0.7, 0],
    [-0.35, 0],
    [-0.22, 0.15],
    [-0.12, -0.55],
    [0, 0.6],
    [0.1, 0],
    [0.35, 0],
    [0.7, 0],
  ];
  const segs: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
  }
  return segs;
}

function networkGlyph(seed: number): Segment[] {
  // Scattered nodes with connecting edges, for the social network.
  const rand = mulberry32(seed);
  const nodeCount = 7;
  const nodes: [number, number][] = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = rand() * Math.PI * 2;
    const r = 0.25 + rand() * 0.4;
    nodes.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }
  const segs: Segment[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const next = (i + 1 + Math.floor(rand() * 2)) % nodeCount;
    if (next === i) continue;
    segs.push([nodes[i][0], nodes[i][1], nodes[next][0], nodes[next][1]]);
  }
  return segs;
}

function functionGlyph(): Segment[] {
  // An x/y axis with a plotted curve, for the mathematics app.
  const segs: Segment[] = [];
  segs.push([-0.65, 0, 0.65, 0]); // x axis
  segs.push([0, -0.6, 0, 0.6]); // y axis
  const steps = 24;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 - 1;
    const x = t * 0.6;
    const y = Math.sin(t * Math.PI * 1.3) * 0.4;
    if (prev) segs.push([prev[0], prev[1], x, y]);
    prev = [x, y];
  }
  return segs;
}

function commerceGlyph(): Segment[] {
  // A simple cart/crate outline with a grid base, for the marketplace.
  const segs: Segment[] = [];
  segs.push([-0.5, 0.3, 0.5, 0.3]);
  segs.push([-0.5, -0.35, 0.5, -0.35]);
  segs.push([-0.5, 0.3, -0.5, -0.35]);
  segs.push([0.5, 0.3, 0.5, -0.35]);
  // internal grid (crate slats)
  segs.push([-0.17, 0.3, -0.17, -0.35]);
  segs.push([0.17, 0.3, 0.17, -0.35]);
  segs.push([-0.5, -0.02, 0.5, -0.02]);
  // small wheels
  segs.push([-0.3, -0.35, -0.3, -0.5]);
  segs.push([0.3, -0.35, 0.3, -0.5]);
  return segs;
}

function archiveGlyph(seed: number): Segment[] {
  // A stack of sheets seen edge-on — the archive representing itself.
  const rand = mulberry32(seed);
  const segs: Segment[] = [];
  const sheetCount = 4;
  for (let i = 0; i < sheetCount; i++) {
    const offset = i * 0.09 - 0.13;
    const jitter = rand() * 0.03;
    segs.push([-0.55 + jitter, 0.3 - offset, 0.55 + jitter, 0.3 - offset]);
    segs.push([-0.55 + jitter, -0.3 - offset, 0.55 + jitter, -0.3 - offset]);
    segs.push([-0.55 + jitter, 0.3 - offset, -0.55 + jitter, -0.3 - offset]);
    segs.push([0.55 + jitter, 0.3 - offset, 0.55 + jitter, -0.3 - offset]);
  }
  return segs;
}

export function buildGlyphSegments(kind: GlyphKind, seed: number): Segment[] {
  switch (kind) {
    case "structural":
      return structuralGlyph();
    case "hub":
      return hubGlyph(seed);
    case "ledger":
      return ledgerGlyph(seed);
    case "toolkit":
      return toolkitGlyph(seed);
    case "molecule":
      return moleculeGlyph(seed);
    case "pulse":
      return pulseGlyph();
    case "network":
      return networkGlyph(seed);
    case "function":
      return functionGlyph();
    case "commerce":
      return commerceGlyph();
    case "archive":
      return archiveGlyph(seed);
  }
}

/** Converts flat [x1,y1,x2,y2] segments into a THREE.BufferGeometry sized
 * for LineSegments, scaled into the sheet's local unit space. */
export function segmentsToGeometry(
  segments: Segment[],
  scale: number
): THREE.BufferGeometry {
  const positions = new Float32Array(segments.length * 6);
  segments.forEach(([x1, y1, x2, y2], i) => {
    positions[i * 6 + 0] = x1 * scale;
    positions[i * 6 + 1] = y1 * scale;
    positions[i * 6 + 2] = 0;
    positions[i * 6 + 3] = x2 * scale;
    positions[i * 6 + 4] = y2 * scale;
    positions[i * 6 + 5] = 0;
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

export { mulberry32 };
export type { Segment };
