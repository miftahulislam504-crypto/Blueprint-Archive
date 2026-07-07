/**
 * Four drafting-instrument silhouettes, each sampled down to the same
 * anchor-point count M so InstrumentParticles can map any particle index
 * to the same anchor across all four shapes — swapping which shape is
 * "current" is then just swapping which array populates the aTarget
 * attribute, no per-shape special-casing needed on the GPU side.
 */

export const ANCHOR_COUNT = 360;

type Point3 = [number, number, number];

function compassRose(): Point3[] {
  const pts: Point3[] = [];
  const spikes = 4;
  const perSpike = Math.floor(ANCHOR_COUNT / (spikes * 2));
  for (let s = 0; s < spikes; s++) {
    const angle = (s / spikes) * Math.PI * 2;
    const tipR = s % 2 === 0 ? 1.0 : 0.55;
    for (let i = 0; i < perSpike; i++) {
      const t = i / perSpike;
      // two edges of a narrow triangular spike, converging to the tip
      const spread = 0.14 * (1 - t);
      const r = t * tipR;
      pts.push([
        Math.cos(angle + spread) * r,
        Math.sin(angle + spread) * r,
        0,
      ]);
      pts.push([
        Math.cos(angle - spread) * r,
        Math.sin(angle - spread) * r,
        0,
      ]);
    }
  }
  while (pts.length < ANCHOR_COUNT) pts.push([0, 0, 0]);
  return pts.slice(0, ANCHOR_COUNT);
}

function tSquare(): Point3[] {
  const pts: Point3[] = [];
  const barCount = Math.floor(ANCHOR_COUNT * 0.6);
  const stemCount = ANCHOR_COUNT - barCount;
  // horizontal bar
  for (let i = 0; i < barCount; i++) {
    const t = i / barCount;
    pts.push([(t - 0.5) * 2.0, 0.55, 0]);
  }
  // perpendicular stem
  for (let i = 0; i < stemCount; i++) {
    const t = i / stemCount;
    pts.push([0, 0.55 - t * 1.3, 0]);
  }
  return pts;
}

function scaleBar(): Point3[] {
  const pts: Point3[] = [];
  const spineCount = Math.floor(ANCHOR_COUNT * 0.4);
  const tickGroups = 9;
  const perTick = Math.floor((ANCHOR_COUNT - spineCount) / tickGroups);
  for (let i = 0; i < spineCount; i++) {
    const t = i / spineCount;
    pts.push([(t - 0.5) * 2.0, 0, 0]);
  }
  for (let g = 0; g < tickGroups; g++) {
    const x = (g / (tickGroups - 1) - 0.5) * 2.0;
    const tall = g % 2 === 0;
    for (let i = 0; i < perTick; i++) {
      const t = i / perTick;
      pts.push([x, t * (tall ? 0.3 : 0.16), 0]);
    }
  }
  while (pts.length < ANCHOR_COUNT) pts.push([0, 0, 0]);
  return pts.slice(0, ANCHOR_COUNT);
}

function protractor(): Point3[] {
  const pts: Point3[] = [];
  const arcCount = Math.floor(ANCHOR_COUNT * 0.55);
  const baseCount = Math.floor(ANCHOR_COUNT * 0.15);
  const tickGroups = ANCHOR_COUNT - arcCount - baseCount;
  const r = 0.9;
  for (let i = 0; i < arcCount; i++) {
    const t = i / arcCount;
    const angle = Math.PI * t; // half circle
    pts.push([Math.cos(angle) * r, Math.sin(angle) * r, 0]);
  }
  for (let i = 0; i < baseCount; i++) {
    const t = i / baseCount;
    pts.push([(t - 0.5) * 2 * r, 0, 0]);
  }
  const ticks = 7;
  const perTick = Math.max(1, Math.floor(tickGroups / ticks));
  for (let g = 0; g < ticks; g++) {
    const angle = (g / (ticks - 1)) * Math.PI;
    for (let i = 0; i < perTick; i++) {
      const t = i / perTick;
      const rr = r - t * 0.14;
      pts.push([Math.cos(angle) * rr, Math.sin(angle) * rr, 0]);
    }
  }
  while (pts.length < ANCHOR_COUNT) pts.push([0, 0, 0]);
  return pts.slice(0, ANCHOR_COUNT);
}

export type InstrumentShapeId = "compass" | "tsquare" | "scale" | "protractor";

export const INSTRUMENT_SHAPES: Record<InstrumentShapeId, Point3[]> = {
  compass: compassRose(),
  tsquare: tSquare(),
  scale: scaleBar(),
  protractor: protractor(),
};
