export type RNG = () => number;

/**
 * Deterministic RNG (mulberry32). Same seed -> same fight.
 */
export function createRng(seed: number): RNG {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function chance(rng: RNG, percent: number): boolean {
  return rng() * 100 < percent;
}

export function pickWeighted<T>(rng: RNG, items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((acc, i) => acc + Math.max(0, i.weight), 0);
  if (total <= 0) return items[0].value;
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0, item.weight);
    if (roll <= 0) return item.value;
  }
  return items[items.length - 1].value;
}
