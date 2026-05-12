import type { CardRarity } from '@/types/cards';
import type { LeagueId } from '@/data/progression/leagues';

/**
 * Tunables for opponent generation, deck quality, and difficulty scaling.
 * Everything here is data — no logic lives in this file.
 */

export type OpponentTier = 'rookie' | 'contender' | 'veteran' | 'elite' | 'champion';

/** Numeric multipliers applied to the archetype stat bias. */
export const TIER_STAT_SCALE: Record<OpponentTier, number> = {
  rookie: 0.85,
  contender: 1.0,
  veteran: 1.1,
  elite: 1.2,
  champion: 1.35,
};

export const TIER_HP: Record<OpponentTier, number> = {
  rookie: 90,
  contender: 100,
  veteran: 110,
  elite: 120,
  champion: 140,
};

export const TIER_STAMINA: Record<OpponentTier, number> = {
  rookie: 90,
  contender: 100,
  veteran: 105,
  elite: 110,
  champion: 120,
};

/** Deck size per tier. */
export const TIER_DECK_SIZE: Record<OpponentTier, number> = {
  rookie: 6,
  contender: 7,
  veteran: 8,
  elite: 8,
  champion: 9,
};

/** Rarity floor that the deck generator will try to respect. */
export const TIER_RARITY_WEIGHTS: Record<OpponentTier, Record<CardRarity, number>> = {
  rookie:     { Common: 1.0,  Rare: 0.15, Epic: 0.0,  Legendary: 0.0 },
  contender:  { Common: 0.8,  Rare: 0.35, Epic: 0.05, Legendary: 0.0 },
  veteran:    { Common: 0.55, Rare: 0.5,  Epic: 0.15, Legendary: 0.02 },
  elite:      { Common: 0.35, Rare: 0.55, Epic: 0.3,  Legendary: 0.08 },
  champion:   { Common: 0.15, Rare: 0.45, Epic: 0.45, Legendary: 0.2 },
};

/**
 * League → which tiers can appear, and their selection weights.
 * Keep ranges overlapping a little for variety.
 */
export const LEAGUE_TIER_WEIGHTS: Record<LeagueId, Array<{ tier: OpponentTier; weight: number }>> = {
  amateur:     [{ tier: 'rookie', weight: 7 }, { tier: 'contender', weight: 3 }],
  underground: [{ tier: 'rookie', weight: 2 }, { tier: 'contender', weight: 6 }, { tier: 'veteran', weight: 2 }],
  regional:    [{ tier: 'contender', weight: 3 }, { tier: 'veteran', weight: 6 }, { tier: 'elite', weight: 1 }],
  national:    [{ tier: 'veteran', weight: 4 }, { tier: 'elite', weight: 5 }, { tier: 'champion', weight: 1 }],
  elite:       [{ tier: 'veteran', weight: 2 }, { tier: 'elite', weight: 6 }, { tier: 'champion', weight: 2 }],
  world:       [{ tier: 'elite', weight: 3 }, { tier: 'champion', weight: 7 }],
};

/**
 * Soft difficulty scaling parameters.
 * Stats are nudged a few % up/down based on recent performance — never beyond
 * the configured caps. The point is to keep flow, not to cheat.
 */
export const DIFFICULTY_DRIFT = {
  /** % added to scale when player is on a hot streak. */
  hotStreakBoost: 0.06,
  /** % subtracted when the player loses repeatedly. */
  coldStreakRelief: -0.05,
  /** Streak length used to decide hot/cold. */
  streakWindow: 3,
  /** Hard caps so we never push beyond fair play. */
  minScale: 0.85,
  maxScale: 1.15,
};

/** Recent-opponent memory length used to avoid repetition. */
export const OPPONENT_HISTORY_WINDOW = 10;
