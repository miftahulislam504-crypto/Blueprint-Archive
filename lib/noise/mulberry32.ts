/**
 * Mulberry32 — a small, well-known seeded PRNG. simplex-noise's createNoise3D
 * takes an optional `() => number` in [0,1) to build its permutation table;
 * without one it falls back to Math.random(), which would make every
 * island's shape different on every reload. This makes shapes reproducible
 * per seed instead.
 */
export function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
