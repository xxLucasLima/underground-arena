import type { OpponentTier } from './opponentConfig';

/**
 * Reward-scaling tunables — pure data. Used by `services/opponents/rewardScaling.ts`
 * so any feature (story, tournament, survival, boss, daily challenges) can ask:
 *   "given this opponent / mode / streak, how much should the rewards scale?"
 *
 * Architectural reasoning:
 *  - Reward shape (coins/xp/cards) is owned by the progression layer.
 *  - HOW MUCH to scale by mode/tier is an *opponent* concern and lives here.
 *  - Higher tier => bigger reward, but capped to avoid feedback loops where the
 *    player only farms champion fights.
 */
export const TIER_REWARD_MULTIPLIER: Record<OpponentTier, number> = {
  rookie: 0.8,
  contender: 1.0,
  veteran: 1.25,
  elite: 1.55,
  champion: 2.0,
};

/** Bosses are special — they multiply on top of tier. */
export const BOSS_REWARD_MULTIPLIER = 1.75;

/** Tournament-round scaling on top of opponent scaling. */
export const TOURNAMENT_ROUND_MULTIPLIER = (round: number) => 1 + round * 0.25;

/** Survival streak scaling, capped so a 200-streak doesn't dwarf bosses. */
export const SURVIVAL_STREAK_MULTIPLIER = (streak: number) =>
  Math.min(1 + 0.12 * streak, 4.0);

/** Daily-challenge completion bonus on top of the template reward. */
export const DAILY_CHALLENGE_COMPLETION_MULTIPLIER = 1.25;

/** Soft minimum / maximum applied to any scaled bundle to avoid silliness. */
export const SCALED_REWARD_CLAMP = {
  minCoins: 1,
  maxCoinsPerFight: 5_000,
  minXp: 1,
  maxXpPerFight: 1_500,
};
