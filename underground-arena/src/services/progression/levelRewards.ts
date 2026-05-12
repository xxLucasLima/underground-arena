import { LEVEL_UP_REWARDS } from '@/data/progression/xpCurve';

export type LevelUpRewardBundle = {
  coins: number;
  energyRefill: number;
  packs: Array<'Bronze' | 'Silver' | 'Gold' | 'Diamond'>;
};

const EMPTY: LevelUpRewardBundle = { coins: 0, energyRefill: 0, packs: [] };

export function getLevelUpRewards(fromLevel: number, toLevel: number): LevelUpRewardBundle {
  if (toLevel <= fromLevel) return EMPTY;
  let coins = 0;
  let energyRefill = 0;
  const packs: LevelUpRewardBundle['packs'] = [];
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl += 1) {
    const bucket = LEVEL_UP_REWARDS.find((b) => lvl >= b.fromLevel && lvl <= b.toLevel);
    if (!bucket) continue;
    coins += bucket.coins;
    energyRefill = Math.max(energyRefill, bucket.energyRefill);
    packs.push(...bucket.packs);
  }
  return { coins, energyRefill, packs };
}
