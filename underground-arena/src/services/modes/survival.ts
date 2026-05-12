import { generateAIFighter } from '@/services/opponents/fighterGenerator';
import type { AIFighter } from '@/services/opponents/types';
import type { LeagueId } from '@/data/progression/leagues';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Survival Mode — endless run of fights with gradually increasing difficulty.
 *
 *   - Each survived fight bumps the difficulty drift toward maxDifficulty.
 *   - Each survived fight grants a scaling reward (linear with streak).
 *   - One loss ends the run.
 *
 * Pure functions; the store owns the persisted run state.
 */

export type SurvivalConfig = {
  /** Stat drift starts here. */
  startDrift: number;
  /** Each survived fight adds this much drift. */
  driftStep: number;
  /** Hard cap on drift to avoid unfair spikes. */
  maxDrift: number;
  /** Coins/XP at streak=0, linearly scaled by streak. */
  baseRewardPerFight: RewardBundle;
  /** Multiplier added per streak. */
  rewardStreakSlope: number;
};

export const DEFAULT_SURVIVAL_CONFIG: SurvivalConfig = {
  startDrift: 0,
  driftStep: 0.015,
  maxDrift: 0.18,
  baseRewardPerFight: { coins: 40, xp: 15, cardDrops: [] },
  rewardStreakSlope: 0.15,
};

export type SurvivalRun = {
  id: string;
  league: LeagueId;
  seed: number;
  streak: number;
  bestStreakAtStart: number;
  totalRewards: RewardBundle;
  state: 'in-progress' | 'ended';
  currentOpponent: AIFighter;
};

export function startSurvival(args: {
  seed: number;
  league: LeagueId;
  playerLevel: number;
  bestStreak: number;
  config?: SurvivalConfig;
}): SurvivalRun {
  const cfg = args.config ?? DEFAULT_SURVIVAL_CONFIG;
  const opponent = generateAIFighter({
    seed: args.seed,
    league: args.league,
    effectiveLevel: args.playerLevel,
    difficultyDrift: cfg.startDrift,
  });
  return {
    id: `survival-${args.seed}`,
    league: args.league,
    seed: args.seed,
    streak: 0,
    bestStreakAtStart: args.bestStreak,
    totalRewards: { coins: 0, xp: 0, cardDrops: [] },
    state: 'in-progress',
    currentOpponent: opponent,
  };
}

export function recordSurvivalResult(
  run: SurvivalRun,
  args: { won: boolean; playerLevel: number; config?: SurvivalConfig },
): { run: SurvivalRun; awarded: RewardBundle } {
  const cfg = args.config ?? DEFAULT_SURVIVAL_CONFIG;
  if (run.state !== 'in-progress') {
    return { run, awarded: { coins: 0, xp: 0, cardDrops: [] } };
  }

  if (!args.won) {
    return { run: { ...run, state: 'ended' }, awarded: { coins: 0, xp: 0, cardDrops: [] } };
  }

  // Reward scales with the streak that was just achieved.
  const newStreak = run.streak + 1;
  const multiplier = 1 + cfg.rewardStreakSlope * newStreak;
  const awarded: RewardBundle = {
    coins: Math.round(cfg.baseRewardPerFight.coins * multiplier),
    xp: Math.round(cfg.baseRewardPerFight.xp * multiplier),
    cardDrops: [],
  };

  // Generate the next opponent with bumped drift.
  const drift = Math.min(cfg.maxDrift, cfg.startDrift + cfg.driftStep * newStreak);
  const nextOpponent = generateAIFighter({
    seed: run.seed + newStreak * 131,
    league: run.league,
    effectiveLevel: args.playerLevel,
    difficultyDrift: drift,
  });

  return {
    run: {
      ...run,
      streak: newStreak,
      totalRewards: {
        coins: run.totalRewards.coins + awarded.coins,
        xp: run.totalRewards.xp + awarded.xp,
        cardDrops: [...run.totalRewards.cardDrops, ...awarded.cardDrops],
      },
      currentOpponent: nextOpponent,
    },
    awarded,
  };
}
