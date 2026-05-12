import type { AchievementId } from '@/data/progression/achievements';
import type { LeagueId } from '@/data/progression/leagues';
import type { TrainingProgramId } from '@/data/progression/training';
import type { FighterStats } from '@/engine/combat/types';

export type Currencies = { coins: number; gems: number };

export type EnergyState = {
  current: number;
  max: number;
  lastUpdatedAt: number;
};

export type FightOutcome = {
  won: boolean;
  finisher: 'KO' | 'Submission' | null;
  flawless: boolean; // won without taking damage past 90% hp
  league: LeagueId;
  opponentPower: number;
};

export type RewardBundle = {
  xp: number;
  coins: number;
  cardDrops: string[]; // card ids
};

export type TrainingSession = {
  id: TrainingProgramId;
  startedAt: number;
  endsAt: number;
};

export type AchievementProgress = {
  unlocked: Record<AchievementId, number>; // timestamp when unlocked
};

export type ProgressionSnapshot = {
  level: number;
  xp: number;
  currencies: Currencies;
  energy: EnergyState;
  league: LeagueId;
  stats: FighterStats;
  streak: number;
  bestStreak: number;
  totals: { fights: number; wins: number; knockouts: number; submissions: number };
  dailyClaim: { lastClaimAt: number; streakDays: number };
  training: TrainingSession | null;
  achievements: AchievementProgress;
  unlockedLeagues: LeagueId[];
};
