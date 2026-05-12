import { XP_CURVE } from '@/data/progression/xpCurve';

export function xpToNextLevel(level: number): number {
  if (level >= XP_CURVE.maxLevel) return Number.POSITIVE_INFINITY;
  return Math.round(XP_CURVE.base * Math.pow(level, XP_CURVE.exponent));
}

export type LevelUpResult = {
  level: number;
  xp: number;
  levelsGained: number;
};

/** Pure level-up math. Caller persists the result. */
export function applyXp(level: number, xp: number, gained: number): LevelUpResult {
  let newLevel = level;
  let newXp = xp + gained;
  let gainedLevels = 0;
  while (newLevel < XP_CURVE.maxLevel && newXp >= xpToNextLevel(newLevel)) {
    newXp -= xpToNextLevel(newLevel);
    newLevel += 1;
    gainedLevels += 1;
  }
  if (newLevel >= XP_CURVE.maxLevel) newXp = 0;
  return { level: newLevel, xp: newXp, levelsGained: gainedLevels };
}
