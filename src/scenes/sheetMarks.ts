import { mulberry32, type Segment } from "@/scenes/glyphs";

/**
 * The annotation marks every sheet carries regardless of which project
 * it represents — registration crosses, dimension lines, a hatch patch —
 * varied by the sheet's seed. This is the direct answer to the lesson in
 * Igloo's case study: reusing one ice-block design made every project
 * blur together on scroll, so they gave each block unique detail. Here,
 * the seed reshuffles mark count, placement, and style per sheet so nine
 * sheets scrolling past don't read as one template repeated nine times.
 */

const HALF = 0.98; // sheet half-extent in local units, just inside the paper edge

export function registrationMarks(seed: number): Segment[] {
  const rand = mulberry32(seed * 7 + 1);
  const style = Math.floor(rand() * 3); // 0: cross, 1: L-bracket, 2: circle-tick
  const corners: [number, number][] = [
    [-HALF, HALF],
    [HALF, HALF],
    [-HALF, -HALF],
    [HALF, -HALF],
  ];
  const segs: Segment[] = [];
  const size = 0.05;

  for (const [cx, cy] of corners) {
    if (style === 0) {
      segs.push([cx - size, cy, cx + size, cy]);
      segs.push([cx, cy - size, cx, cy + size]);
    } else if (style === 1) {
      const dx = cx > 0 ? -1 : 1;
      const dy = cy > 0 ? -1 : 1;
      segs.push([cx, cy, cx + dx * size * 2, cy]);
      segs.push([cx, cy, cx, cy + dy * size * 2]);
    } else {
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const a1 = (i / steps) * Math.PI * 2;
        const a2 = ((i + 1) / steps) * Math.PI * 2;
        segs.push([
          cx + Math.cos(a1) * size,
          cy + Math.sin(a1) * size,
          cx + Math.cos(a2) * size,
          cy + Math.sin(a2) * size,
        ]);
      }
    }
  }
  return segs;
}

export function dimensionLines(seed: number): Segment[] {
  const rand = mulberry32(seed * 13 + 5);
  const segs: Segment[] = [];
  const count = 2 + Math.floor(rand() * 3); // 2–4 lines
  const tick = 0.025;

  for (let i = 0; i < count; i++) {
    const onLeftEdge = rand() > 0.5;
    const x = onLeftEdge ? -HALF - 0.06 : HALF + 0.06;
    const y1 = -0.7 + rand() * 0.5;
    const len = 0.25 + rand() * 0.4;
    const y2 = y1 + len;
    segs.push([x, y1, x, y2]);
    segs.push([x - tick, y1, x + tick, y1]);
    segs.push([x - tick, y2, x + tick, y2]);
  }
  return segs;
}

export function hatchPatch(seed: number): Segment[] {
  const rand = mulberry32(seed * 19 + 3);
  const segs: Segment[] = [];
  const corner = Math.floor(rand() * 4);
  const originX = corner % 2 === 0 ? -HALF : HALF - 0.32;
  const originY = corner < 2 ? HALF - 0.32 : -HALF;
  const w = 0.3;
  const h = 0.3;
  const lineCount = 5 + Math.floor(rand() * 5);

  // Straight diagonal strokes swept across a fixed box — each stroke's
  // start/end is clamped independently to the box edges, so every line
  // stays a clean diagonal with no degenerate (zero-length) cases.
  for (let i = 0; i < lineCount; i++) {
    const offset = (i / lineCount) * (w + h);
    const x1 = originX + Math.max(0, offset - h);
    const y1 = originY - Math.min(offset, h);
    const x2 = originX + Math.min(offset, w);
    const y2 = originY - Math.max(0, offset - w);
    segs.push([x1, y1, x2, y2]);
  }
  return segs;
}
