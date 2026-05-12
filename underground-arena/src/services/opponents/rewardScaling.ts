import {
  BOSS_REWARD_MULTIPLIER,
  DAILY_CHALLENGE_COMPLETION_MULTIPLIER,
  SCALED_REWARD_CLAMP,
  SURVIVAL_STREAK_MULTIPLIER,
  TIER_REWARD_MULTIPLIER,
  TOURNAMENT_ROUND_MULTIPLIER,
} from '@/data/opponents/rewardScaling';
import type { OpponentTier } from '@/data/opponents/opponentConfig';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Pure helpers that compute reward multipliers given fight context.
 * No I/O, no stores. Anything in the game can call these.
 */

export function tierMultiplier(tier: OpponentTier): number {
  return TIER_REWARD_MULTIPLIER[tier];
}

export function bossMultiplier(): number {
  return BOSS_REWARD_MULTIPLIER;
}

export function tournamentRoundMultiplier(round: number): number {
  return TOURNAMENT_ROUND_MULTIPLIER(round);
}

export function survivalStreakMultiplier(streak: number): number {
  return SURVIVAL_STREAK_MULTIPLIER(streak);
}

export function dailyCompletionMultiplier(): number {
  return DAILY_CHALLENGE_COMPLETION_MULTIPLIER;
}

/** Apply a multiplier to a RewardBundle. Card drops are not scaled (rarity-driven). */
export function scaleBundle(bundle: RewardBundle, multiplier: number): RewardBundle {
  return clampBundle({
    coins: Math.round(bundle.coins * multiplier),
    xp: Math.round(bundle.xp * multiplier),
    cardDrops: bundle.cardDrops,
  });
}

/** Compose multiple multipliers into one (more readable than chained * calls). */
export function composeMultipliers(...mults: number[]): number {
  return mults.reduce((acc, m) => acc * m, 1);
}

function clampBundle(b: RewardBundle): RewardBundle {
  return {
    coins: Math.max(SCALED_REWARD_CLAMP.minCoins, Math.min(b.coins, SCALED_REWARD_CLAMP.maxCoinsPerFight)),
    xp: Math.max(SCALED_REWARD_CLAMP.minXp, Math.min(b.xp, SCALED_REWARD_CLAMP.maxXpPerFight)),
    cardDrops: b.cardDrops,
  };
}
