import { ACHIEVEMENTS, type AchievementId } from '@/data/progression/achievements';
import type { AchievementProgress, ProgressionSnapshot } from './types';

export type AchievementCheckInput = {
  snapshot: Pick<ProgressionSnapshot, 'level' | 'streak' | 'totals'>;
  ownedCardCount: number;
};

function isUnlocked(progress: AchievementProgress, id: AchievementId) {
  return Boolean(progress.unlocked[id]);
}

/** Returns newly unlocked achievement ids based on current state. */
export function evaluateAchievements(progress: AchievementProgress, input: AchievementCheckInput): AchievementId[] {
  const fired: AchievementId[] = [];
  const { snapshot, ownedCardCount } = input;
  const tryFire = (id: AchievementId, condition: boolean) => {
    if (condition && !isUnlocked(progress, id)) fired.push(id);
  };

  tryFire('first_blood', snapshot.totals.wins >= 1);
  tryFire('first_ko', snapshot.totals.knockouts >= 1);
  tryFire('first_submission', snapshot.totals.submissions >= 1);
  tryFire('streak_3', snapshot.streak >= 3);
  tryFire('streak_10', snapshot.streak >= 10);
  tryFire('level_5', snapshot.level >= 5);
  tryFire('level_25', snapshot.level >= 25);
  tryFire('collector_10', ownedCardCount >= 10);
  tryFire('collector_50', ownedCardCount >= 50);

  return fired;
}

export function achievementRewards(ids: AchievementId[]): { coins: number; xp: number } {
  return ids.reduce(
    (acc, id) => {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return acc;
      return { coins: acc.coins + (def.reward.coins ?? 0), xp: acc.xp + (def.reward.xp ?? 0) };
    },
    { coins: 0, xp: 0 },
  );
}
