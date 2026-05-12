import { create } from 'zustand';
import { getObject, setObject } from '@/services/persistence/storage';
import { storageKeys } from '@/services/persistence/keys';

import {
  appendHistory,
  type OpponentHistoryEntry,
  type RecentFightResult,
} from '@/services/opponents';
import {
  type Rival,
  recordEncounter,
  shouldPromoteToRival,
} from '@/services/opponents/rivals';
import {
  type TournamentRun,
  recordResult as recordTournamentResult,
  startTournament,
} from '@/services/tournaments';
import {
  type SurvivalRun,
  recordSurvivalResult,
  startSurvival,
} from '@/services/modes/survival';
import {
  type DailyChallengeInstance,
  markCompleted,
  rollDailyChallenges,
  todayDateString,
} from '@/services/modes/dailyChallenges';

import type { LeagueId } from '@/data/progression/leagues';
import type { TournamentTemplateId } from '@/data/tournaments/tournamentTemplates';

/**
 * encounterStore — single source of truth for "what AI content does the player
 * have running / has completed?"
 *
 * Architecture notes:
 *  - This store is intentionally separate from `progressionStore`. Progression
 *    owns currencies/XP/streaks; this store owns *encounter state* (tournaments,
 *    survival run, daily challenges, rivals, opponent history, boss victories).
 *  - All gameplay logic lives in the pure services. The store just:
 *      (a) holds state,
 *      (b) calls services to mutate it,
 *      (c) persists the result.
 *  - Persisted to AsyncStorage (one key). SQLite is reserved for high-volume
 *    data (none in this layer for MVP).
 *  - Each method returns the "result" payloads from the services so callers
 *    can hand them to progressionStore for currency/XP application — keeping
 *    the two stores decoupled.
 */

const MAX_RIVALS = 3;

type BossVictory = {
  bossId: string;
  at: number;
};

type EncounterPersisted = {
  history: OpponentHistoryEntry[];
  recentResults: RecentFightResult[];
  rivals: Rival[];
  bossVictories: BossVictory[];
  tournament: TournamentRun | null;
  survival: SurvivalRun | null;
  daily: { date: string; instances: DailyChallengeInstance[] } | null;
  completedTournamentIds: string[];
  completedSurvivalBestStreak: number;
};

type EncounterState = EncounterPersisted & {
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;

  // Opponent history & recent results (used by matchmaking).
  recordFight: (entry: OpponentHistoryEntry, result: RecentFightResult) => Promise<void>;

  // Bosses.
  recordBossVictory: (bossId: string) => Promise<void>;
  hasDefeatedBoss: (bossId: string) => boolean;

  // Rivals.
  tryPromoteRival: (args: {
    seed: number;
    archetypeId: string;
    league: LeagueId;
    closeFight: boolean;
  }) => Promise<Rival | null>;
  recordRivalEncounter: (seed: number, playerWon: boolean) => Promise<void>;
  getRival: (seed: number) => Rival | undefined;

  // Tournaments.
  startTournament: (args: {
    templateId: TournamentTemplateId;
    seed: number;
    playerLevel: number;
  }) => Promise<TournamentRun>;
  recordTournamentMatch: (won: boolean) => Promise<{
    run: TournamentRun;
    awarded: ReturnType<typeof recordTournamentResult>['awarded'];
  } | null>;
  abandonTournament: () => Promise<void>;

  // Survival.
  startSurvival: (args: { seed: number; league: LeagueId; playerLevel: number }) => Promise<SurvivalRun>;
  recordSurvivalMatch: (args: { won: boolean; playerLevel: number }) => Promise<{
    run: SurvivalRun;
    awarded: ReturnType<typeof recordSurvivalResult>['awarded'];
  } | null>;

  // Daily challenges.
  refreshDailyChallenges: (args: { playerId: string; playerLevel: number }) => Promise<DailyChallengeInstance[]>;
  completeDailyChallenge: (templateId: string) => Promise<void>;
};

function initialState(): EncounterPersisted {
  return {
    history: [],
    recentResults: [],
    rivals: [],
    bossVictories: [],
    tournament: null,
    survival: null,
    daily: null,
    completedTournamentIds: [],
    completedSurvivalBestStreak: 0,
  };
}

async function persist(state: EncounterPersisted): Promise<void> {
  await setObject<EncounterPersisted>(storageKeys.encounters, state);
}

const RECENT_RESULTS_WINDOW = 8;

export const useEncounterStore = create<EncounterState>((set, get) => ({
  ...initialState(),

  hydrate: async () => {
    const data = await getObject<EncounterPersisted>(storageKeys.encounters);
    if (data) set({ ...data });
  },

  reset: async () => {
    set({ ...initialState() });
    await persist(get());
  },

  recordFight: async (entry, result) => {
    const history = appendHistory(get().history, entry);
    const recentResults = [...get().recentResults, result].slice(-RECENT_RESULTS_WINDOW);
    set({ history, recentResults });
    await persist(get());
  },

  recordBossVictory: async (bossId) => {
    if (get().bossVictories.some((b) => b.bossId === bossId)) return;
    const bossVictories = [...get().bossVictories, { bossId, at: Date.now() }];
    set({ bossVictories });
    await persist(get());
  },

  hasDefeatedBoss: (bossId) => get().bossVictories.some((b) => b.bossId === bossId),

  tryPromoteRival: async ({ seed, archetypeId, league, closeFight }) => {
    const existing = get().rivals.find((r) => r.seed === seed);
    if (existing) return existing;
    const ok = shouldPromoteToRival({
      closeFight,
      existingRivalSeeds: get().rivals.map((r) => r.seed),
      candidateSeed: seed,
      maxRivals: MAX_RIVALS,
    });
    if (!ok) return null;
    const rival: Rival = {
      id: `rival-${seed}`,
      seed,
      archetypeId,
      league,
      encounters: 0,
      playerWins: 0,
      rivalWins: 0,
      lastSeenAt: Date.now(),
      status: 'active',
    };
    set({ rivals: [...get().rivals, rival] });
    await persist(get());
    return rival;
  },

  recordRivalEncounter: async (seed, playerWon) => {
    const rivals = get().rivals.map((r) =>
      r.seed === seed ? recordEncounter(r, { playerWon, now: Date.now() }) : r,
    );
    set({ rivals });
    await persist(get());
  },

  getRival: (seed) => get().rivals.find((r) => r.seed === seed),

  startTournament: async ({ templateId, seed, playerLevel }) => {
    const run = startTournament({ templateId, seed, playerLevel });
    set({ tournament: run });
    await persist(get());
    return run;
  },

  recordTournamentMatch: async (won) => {
    const current = get().tournament;
    if (!current) return null;
    const { run, awarded } = recordTournamentResult(current, { won });
    const completedIds = run.state === 'completed' && !get().completedTournamentIds.includes(run.id)
      ? [...get().completedTournamentIds, run.id]
      : get().completedTournamentIds;
    set({
      tournament: run.state === 'in-progress' ? run : null,
      completedTournamentIds: completedIds,
    });
    await persist(get());
    return { run, awarded };
  },

  abandonTournament: async () => {
    set({ tournament: null });
    await persist(get());
  },

  startSurvival: async ({ seed, league, playerLevel }) => {
    const run = startSurvival({
      seed,
      league,
      playerLevel,
      bestStreak: get().completedSurvivalBestStreak,
    });
    set({ survival: run });
    await persist(get());
    return run;
  },

  recordSurvivalMatch: async ({ won, playerLevel }) => {
    const current = get().survival;
    if (!current) return null;
    const { run, awarded } = recordSurvivalResult(current, { won, playerLevel });
    const best = Math.max(get().completedSurvivalBestStreak, run.streak);
    set({
      survival: run.state === 'in-progress' ? run : null,
      completedSurvivalBestStreak: best,
    });
    await persist(get());
    return { run, awarded };
  },

  refreshDailyChallenges: async ({ playerId, playerLevel }) => {
    const today = todayDateString();
    const existing = get().daily;
    if (existing && existing.date === today) return existing.instances;
    const instances = rollDailyChallenges({ date: today, playerId, playerLevel });
    set({ daily: { date: today, instances } });
    await persist(get());
    return instances;
  },

  completeDailyChallenge: async (templateId) => {
    const current = get().daily;
    if (!current) return;
    const instances = markCompleted(current.instances, templateId);
    set({ daily: { ...current, instances } });
    await persist(get());
  },
}));

export type { EncounterPersisted, BossVictory };
