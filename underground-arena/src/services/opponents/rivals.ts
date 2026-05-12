import { generateAIFighter } from './fighterGenerator';
import type { AIFighter } from './types';
import type { LeagueId } from '@/data/progression/leagues';

/**
 * A Rival is a *persistent* opponent that re-appears over time. The generator
 * stays pure: a rival is just (seed, archetype, league) + a small evolving
 * "encounter count" that bumps the effective level so they keep up with the
 * player.
 *
 * Persistence (which fights happened, last seen, wins/losses) belongs in the
 * store; this service only models the rival data + how to materialize one.
 */
export type Rival = {
  id: string;
  seed: number;
  archetypeId: string;
  league: LeagueId;
  /** How many times the rival has been fought. Used to evolve them. */
  encounters: number;
  /** Player vs rival running score. */
  playerWins: number;
  rivalWins: number;
  /** Last unix ms; future bonus rewards on long re-encounters. */
  lastSeenAt: number;
  /** Narrative state. */
  status: 'active' | 'retired' | 'defeated-by-rival';
};

/**
 * Levels granted on top of the player's level when re-meeting a rival.
 * The longer they're rivals, the tougher they become — but capped to avoid
 * unfair spikes.
 */
const RIVAL_LEVEL_BONUS_BY_ENCOUNTER = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5];

export function rivalEffectiveLevel(rival: Rival, playerLevel: number): number {
  const bump =
    RIVAL_LEVEL_BONUS_BY_ENCOUNTER[
      Math.min(rival.encounters, RIVAL_LEVEL_BONUS_BY_ENCOUNTER.length - 1)
    ];
  return playerLevel + bump;
}

/** Materialize a Rival into a usable AIFighter via the standard generator. */
export function materializeRival(rival: Rival, args: { playerLevel: number }): AIFighter {
  return generateAIFighter({
    seed: rival.seed,
    league: rival.league,
    archetypeId: rival.archetypeId,
    effectiveLevel: rivalEffectiveLevel(rival, args.playerLevel),
    // No drift on rivals — their challenge curve is owned by encounters.
    difficultyDrift: 0,
  });
}

/**
 * Decide whether a freshly-met opponent should be promoted to a rival.
 *
 * Heuristic (data-driven, simple):
 *  - The fight was close (rare matchups become rivals).
 *  - Rivals slot is open and they're not already a rival.
 *
 * Callers pass the data; rivalry slots are owned by the store.
 */
export function shouldPromoteToRival(args: {
  closeFight: boolean;
  existingRivalSeeds: number[];
  candidateSeed: number;
  maxRivals: number;
}): boolean {
  if (!args.closeFight) return false;
  if (args.existingRivalSeeds.includes(args.candidateSeed)) return false;
  return args.existingRivalSeeds.length < args.maxRivals;
}

export function recordEncounter(rival: Rival, args: { playerWon: boolean; now: number }): Rival {
  return {
    ...rival,
    encounters: rival.encounters + 1,
    playerWins: rival.playerWins + (args.playerWon ? 1 : 0),
    rivalWins: rival.rivalWins + (args.playerWon ? 0 : 1),
    lastSeenAt: args.now,
  };
}
