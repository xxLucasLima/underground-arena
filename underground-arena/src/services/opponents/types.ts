import type { FighterProfile } from '@/engine/combat/types';
import type { LeagueId } from '@/data/progression/leagues';
import type { OpponentTier } from '@/data/opponents/opponentConfig';

/**
 * AIFighter wraps a combat-engine FighterProfile with display-only metadata.
 * The combat engine never reads anything outside of `profile`, keeping the
 * generation layer fully decoupled from gameplay logic.
 */
export type AIFighter = {
  profile: FighterProfile;
  meta: {
    nickname: string;
    archetypeId: string;
    fightingStyle: string;
    league: LeagueId;
    tier: OpponentTier;
    rarity: 'Standard' | 'Boss';
    portrait: string; // placeholder id
    /** Stable seed used to generate this fighter. */
    seed: number;
    /** True if this fighter came from BossDefinition. */
    bossId?: string;
  };
};

/** Lightweight historical entry used by matchmaking to avoid repeats. */
export type OpponentHistoryEntry = {
  seed: number;
  archetypeId: string;
  league: LeagueId;
  tier: OpponentTier;
  isBoss: boolean;
  /** ms timestamp; not used for logic, just for analytics. */
  at: number;
};

/** Result reported back from a fight, used by matchmaking & difficulty drift. */
export type RecentFightResult = {
  won: boolean;
  opponentSeed: number;
};

export type MatchmakingContext = {
  playerLevel: number;
  league: LeagueId;
  recentResults: RecentFightResult[];
  history: OpponentHistoryEntry[];
  /** Owned card pool used to scale deck quality vs the player. */
  ownedCardCount: number;
  /** Player deck power estimate (sum of damage), used for soft scaling. */
  playerDeckPower: number;
};
