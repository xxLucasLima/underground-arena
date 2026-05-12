import { create } from 'zustand';
import { ACHIEVEMENTS, type AchievementId } from '@/data/progression/achievements';
import { ECONOMY_CONFIG } from '@/data/progression/economyConfig';
import { ENERGY_CONFIG } from '@/data/progression/energyConfig';
import type { LeagueId } from '@/data/progression/leagues';
import type { TrainingProgramId } from '@/data/progression/training';
import { getObject, setObject } from '@/services/persistence/storage';
import { storageKeys } from '@/services/persistence/keys';
import {
  achievementRewards,
  evaluateAchievements,
} from '@/services/progression/achievements';
import {
  canClaimDaily as canClaimDailyService,
  claimDaily as claimDailyService,
} from '@/services/progression/dailyRewards';
import { addCoins, spendCoins } from '@/services/progression/economy';
import {
  createInitialEnergy,
  refillEnergy,
  spendEnergy,
  tickEnergy,
} from '@/services/progression/energy';
import { getLevelUpRewards } from '@/services/progression/levelRewards';
import {
  buildFightOutcome,
  generateFightRewards,
} from '@/services/progression/rewards';
import {
  applyTrainingResult,
  isTrainingComplete,
  startTraining,
} from '@/services/progression/training';
import {
  getUnlockedLeagues,
} from '@/services/progression/unlocks';
import { applyXp } from '@/services/progression/xp';
import type {
  ProgressionSnapshot,
  RewardBundle,
} from '@/services/progression/types';
import type { CombatState, FighterStats } from '@/engine/combat/types';

type AwardSummary = {
  rewards: RewardBundle;
  levelsGained: number;
  newAchievements: AchievementId[];
};

type ProgressionState = ProgressionSnapshot & {
  hydrate: () => Promise<void>;
  /** Apply XP/coins manually (debug / external systems). */
  grantXp: (amount: number) => Promise<{ levelsGained: number }>;
  grantCoins: (amount: number) => Promise<void>;
  trySpendCoins: (amount: number) => Promise<boolean>;
  /** Award rewards from a finished fight; updates totals, streaks, achievements, level-ups. */
  awardFightRewards: (args: {
    state: CombatState;
    playerId: string;
    seed: number;
    ownedCardCount: number;
  }) => Promise<AwardSummary>;
  /** Energy ops. */
  trySpendEnergy: (cost: number) => Promise<boolean>;
  refreshEnergy: () => void;
  /** Daily reward claim. */
  claimDaily: () => Promise<{ ok: boolean; coins: number; streakDays: number; reason?: string }>;
  canClaimDaily: () => boolean;
  /** Training. */
  startTrainingProgram: (id: TrainingProgramId) => Promise<{ ok: boolean; reason?: string }>;
  collectTrainingResult: () => Promise<{ ok: boolean; gainedStat?: keyof FighterStats }>;
  /** League selection (constrained to unlocked). */
  setLeague: (league: LeagueId) => void;
  /** Resets to a fresh game (debug only). */
  resetProgression: () => Promise<void>;
};

const initialAchievements: Record<AchievementId, number> = ACHIEVEMENTS.reduce(
  (acc, def) => {
    acc[def.id] = 0;
    return acc;
  },
  {} as Record<AchievementId, number>,
);

function initialSnapshot(): ProgressionSnapshot {
  return {
    level: 1,
    xp: 0,
    currencies: { coins: ECONOMY_CONFIG.startingCoins, gems: ECONOMY_CONFIG.startingGems },
    energy: createInitialEnergy(),
    league: 'amateur',
    stats: {
      strength: 50,
      speed: 50,
      cardio: 50,
      technique: 50,
      defense: 50,
      chin: 50,
      aggression: 50,
    },
    streak: 0,
    bestStreak: 0,
    totals: { fights: 0, wins: 0, knockouts: 0, submissions: 0 },
    dailyClaim: { lastClaimAt: 0, streakDays: 0 },
    training: null,
    achievements: { unlocked: { ...initialAchievements } },
    unlockedLeagues: ['amateur'],
  };
}

function persistSnapshot(state: ProgressionSnapshot) {
  const snapshot: ProgressionSnapshot = {
    level: state.level,
    xp: state.xp,
    currencies: state.currencies,
    energy: state.energy,
    league: state.league,
    stats: state.stats,
    streak: state.streak,
    bestStreak: state.bestStreak,
    totals: state.totals,
    dailyClaim: state.dailyClaim,
    training: state.training,
    achievements: state.achievements,
    unlockedLeagues: state.unlockedLeagues,
  };
  return setObject(storageKeys.progression, snapshot);
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  ...initialSnapshot(),

  hydrate: async () => {
    const persisted = await getObject<ProgressionSnapshot>(storageKeys.progression);
    if (!persisted) return;
    set({ ...persisted, energy: tickEnergy(persisted.energy) });
  },

  grantXp: async (amount) => {
    const { level, xp } = get();
    const result = applyXp(level, xp, amount);
    let coins = get().currencies.coins;
    let energy = get().energy;
    if (result.levelsGained > 0) {
      const bundle = getLevelUpRewards(level, result.level);
      coins += bundle.coins;
      if (bundle.energyRefill > 0) energy = refillEnergy(energy, bundle.energyRefill);
    }
    const unlockedLeagues = getUnlockedLeagues(result.level);
    set({
      level: result.level,
      xp: result.xp,
      currencies: { ...get().currencies, coins },
      energy,
      unlockedLeagues,
    });
    await persistSnapshot(get());
    return { levelsGained: result.levelsGained };
  },

  grantCoins: async (amount) => {
    set({ currencies: addCoins(get().currencies, amount) });
    await persistSnapshot(get());
  },

  trySpendCoins: async (amount) => {
    const { ok, next } = spendCoins(get().currencies, amount);
    if (!ok) return false;
    set({ currencies: next });
    await persistSnapshot(get());
    return true;
  },

  awardFightRewards: async ({ state, playerId, seed, ownedCardCount }) => {
    const profile = state.profiles[playerId];
    const league = get().league;
    const opponentPower =
      (profile.stats.strength +
        profile.stats.speed +
        profile.stats.cardio +
        profile.stats.technique +
        profile.stats.defense) /
      5;
    const outcome = buildFightOutcome({ state, playerId, league, opponentPower });
    const rewards = generateFightRewards({
      seed,
      outcome,
      playerLevel: get().level,
      streak: get().streak,
    });

    // Totals + streak
    const opponentId = Object.keys(state.fighters).find((id) => id !== playerId)!;
    const finisher = state.fighters[opponentId].finisher;
    const wonInt = outcome.won ? 1 : 0;
    const totals = {
      fights: get().totals.fights + 1,
      wins: get().totals.wins + wonInt,
      knockouts: get().totals.knockouts + (outcome.won && finisher === 'KO' ? 1 : 0),
      submissions: get().totals.submissions + (outcome.won && finisher === 'Submission' ? 1 : 0),
    };
    const streak = outcome.won ? get().streak + 1 : 0;
    const bestStreak = Math.max(get().bestStreak, streak);

    // Apply coins immediately
    set({
      totals,
      streak,
      bestStreak,
      currencies: addCoins(get().currencies, rewards.coins),
    });

    // Apply XP (may level up + grant level rewards)
    const xpResult = await get().grantXp(rewards.xp);

    // Evaluate achievements
    const newAchievements = evaluateAchievements(get().achievements, {
      snapshot: { level: get().level, streak: get().streak, totals: get().totals },
      ownedCardCount,
    });
    if (newAchievements.length > 0) {
      const reward = achievementRewards(newAchievements);
      const unlocked = { ...get().achievements.unlocked };
      const now = Date.now();
      newAchievements.forEach((id) => {
        unlocked[id] = now;
      });
      set({
        achievements: { unlocked },
        currencies: addCoins(get().currencies, reward.coins),
      });
      if (reward.xp > 0) {
        await get().grantXp(reward.xp);
      }
    }

    await persistSnapshot(get());
    return { rewards, levelsGained: xpResult.levelsGained, newAchievements };
  },

  trySpendEnergy: async (cost) => {
    const { ok, next } = spendEnergy(get().energy, cost);
    if (!ok) {
      set({ energy: next });
      return false;
    }
    set({ energy: next });
    await persistSnapshot(get());
    return true;
  },

  refreshEnergy: () => {
    set({ energy: tickEnergy(get().energy) });
  },

  canClaimDaily: () => canClaimDailyService(get().dailyClaim),

  claimDaily: async () => {
    const result = claimDailyService(get().dailyClaim);
    if (!result.ok) return { ok: false, coins: 0, streakDays: result.nextStreakDays, reason: result.reason };
    set({
      dailyClaim: { lastClaimAt: Date.now(), streakDays: result.nextStreakDays },
      currencies: addCoins(get().currencies, result.coinsAwarded),
    });
    await persistSnapshot(get());
    return { ok: true, coins: result.coinsAwarded, streakDays: result.nextStreakDays };
  },

  startTrainingProgram: async (id) => {
    if (get().training) return { ok: false, reason: 'A training session is already active.' };
    const energy = spendEnergy(get().energy, ENERGY_CONFIG.trainingCost);
    if (!energy.ok) return { ok: false, reason: 'Not enough energy.' };
    const session = startTraining(id);
    if (!session) return { ok: false, reason: 'Unknown training program.' };
    set({ training: session, energy: energy.next });
    await persistSnapshot(get());
    return { ok: true };
  },

  collectTrainingResult: async () => {
    const session = get().training;
    if (!session) return { ok: false };
    if (!isTrainingComplete(session)) return { ok: false };
    const nextStats = applyTrainingResult(get().stats, session.id);
    const changedKey = (Object.keys(nextStats) as Array<keyof FighterStats>).find(
      (k) => nextStats[k] !== get().stats[k],
    );
    set({ stats: nextStats, training: null });
    await persistSnapshot(get());
    return { ok: true, gainedStat: changedKey };
  },

  setLeague: (league) => {
    if (!get().unlockedLeagues.includes(league)) return;
    set({ league });
    void persistSnapshot(get());
  },

  resetProgression: async () => {
    const fresh = initialSnapshot();
    set(fresh);
    await persistSnapshot(get());
  },
}));
