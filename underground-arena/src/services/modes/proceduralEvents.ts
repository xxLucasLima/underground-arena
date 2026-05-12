import { pickWeighted, type RNG } from '@/engine/combat/rng';
import {
  EVENT_TRIGGER_CHANCE,
  PROCEDURAL_EVENTS,
  type ProceduralEvent,
} from '@/data/modes/proceduralEvents';

/**
 * Rolls a procedural event for a fight, or returns null. Pure: callers
 * supply the RNG so seeding is centralized (replays, daily seeds, etc.).
 */
export function rollProceduralEvent(rng: RNG): ProceduralEvent | null {
  if (rng() > EVENT_TRIGGER_CHANCE) return null;
  return pickWeighted(rng, PROCEDURAL_EVENTS.map((e) => ({ value: e, weight: e.weight })));
}
