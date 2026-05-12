import type { CardDefinition } from '@/types/cards';
import type { RNG } from '../rng';
import { pickWeighted } from '../rng';
import type { FighterProfile, FighterRuntime } from '../types';
import { PERSONALITY_BEHAVIOR, scoreCard } from './personalities';

/**
 * Picks the next card using weighted-random sampling over scored candidates.
 *
 * Why weighted random?
 * - Pure top-pick yields mirrored, predictable AIs.
 * - Pure random feels chaotic and brainless.
 * - Softmax-style weighting over scores keeps strong moves favored while
 *   preserving variety, AND remains deterministic when a seeded RNG is passed.
 */
export function pickCard(
  attackerProfile: FighterProfile,
  attacker: FighterRuntime,
  defender: FighterRuntime,
  rng: RNG,
): CardDefinition | null {
  const usable = attackerProfile.deck.filter(
    (c) => attacker.stamina >= c.staminaCost && (attacker.cooldowns[c.id] ?? 0) <= 0,
  );
  if (usable.length === 0) return null;

  const behavior = PERSONALITY_BEHAVIOR[attackerProfile.personality];

  const scored = usable.map((card) => ({
    card,
    score: scoreCard(card, attackerProfile.personality, attacker, defender),
  }));

  const validScored = scored.filter((s) => Number.isFinite(s.score));
  if (validScored.length === 0) return null;

  const maxScore = Math.max(...validScored.map((s) => s.score));
  // Convert score deltas into exponential weights using personality randomness as temperature.
  // Lower randomness => sharper distribution; higher => flatter (more variety).
  const temperature = Math.max(0.25, behavior.randomness * 12);
  const weighted = validScored.map((s) => ({
    value: s.card,
    weight: Math.exp((s.score - maxScore) / temperature),
  }));

  // Occasional risky pivot: chance to override and pick the heaviest unused-recently card.
  if (rng() < behavior.riskTolerance) {
    const riskyPool = validScored
      .filter((s) => s.card.staminaCost >= 14 && !attacker.recentCardIds.slice(-2).includes(s.card.id))
      .sort((a, b) => b.card.damage - a.card.damage);
    if (riskyPool.length > 0) return riskyPool[0].card;
  }

  return pickWeighted(rng, weighted);
}
