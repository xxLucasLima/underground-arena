/**
 * XP curve config — data-driven, easily tunable.
 * Required XP for next level = base * level^exponent.
 */
export const XP_CURVE = {
  base: 80,
  exponent: 1.35,
  maxLevel: 60,
} as const;

/**
 * Rewards granted on level-up by level bucket.
 * Designed so the first ~5 levels feel highly rewarding.
 */
export const LEVEL_UP_REWARDS: Array<{
  fromLevel: number;
  toLevel: number;
  coins: number;
  energyRefill: number;
  packs: Array<'Bronze' | 'Silver' | 'Gold' | 'Diamond'>;
}> = [
  { fromLevel: 2, toLevel: 5, coins: 150, energyRefill: 20, packs: ['Bronze'] },
  { fromLevel: 6, toLevel: 10, coins: 250, energyRefill: 20, packs: ['Bronze', 'Bronze'] },
  { fromLevel: 11, toLevel: 20, coins: 400, energyRefill: 20, packs: ['Silver'] },
  { fromLevel: 21, toLevel: 35, coins: 700, energyRefill: 20, packs: ['Silver', 'Bronze'] },
  { fromLevel: 36, toLevel: 60, coins: 1200, energyRefill: 20, packs: ['Gold'] },
];
