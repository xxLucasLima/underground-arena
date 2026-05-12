import type { CardDefinition } from '@/types/cards';
import type { AIPersonality, FighterRuntime } from '../types';

type Weights = Partial<Record<CardDefinition['category'], number>>;

export const PERSONALITY_WEIGHTS: Record<AIPersonality, Weights> = {
  aggressive: { Punch: 1.4, Kick: 1.3, Ultimate: 1.5, Defense: 0.4, Counter: 0.5 },
  defensive: { Defense: 1.6, Counter: 1.4, Punch: 0.8, Kick: 0.7, Ultimate: 0.6 },
  tactical: { Counter: 1.3, Grappling: 1.2, Submission: 1.4, Defense: 1.1, Punch: 1, Kick: 1 },
  reckless: { Ultimate: 1.8, Punch: 1.3, Kick: 1.3, Defense: 0.3, Counter: 0.4 },
  'combo-focused': { Punch: 1.3, Kick: 1.3, Grappling: 1.2, Ultimate: 1.1, Defense: 0.6 },
  'counter-focused': { Counter: 1.8, Defense: 1.2, Punch: 0.9, Kick: 0.9, Grappling: 1, Submission: 1.1 },
};

/**
 * Per-personality behavior tuning.
 * - randomness: higher = more weighted-random choice spread (less greedy).
 * - repetitionPenalty: penalty per recent occurrence of the same card.
 * - categoryRepetitionPenalty: penalty per recent occurrence of the same category.
 * - riskTolerance: probability that AI considers a "risky" pivot to a high-damage / high-cost card.
 */
export const PERSONALITY_BEHAVIOR: Record<
  AIPersonality,
  { randomness: number; repetitionPenalty: number; categoryRepetitionPenalty: number; riskTolerance: number }
> = {
  aggressive: { randomness: 0.9, repetitionPenalty: 6, categoryRepetitionPenalty: 3, riskTolerance: 0.35 },
  defensive: { randomness: 0.6, repetitionPenalty: 10, categoryRepetitionPenalty: 5, riskTolerance: 0.1 },
  tactical: { randomness: 0.5, repetitionPenalty: 12, categoryRepetitionPenalty: 6, riskTolerance: 0.15 },
  reckless: { randomness: 1.4, repetitionPenalty: 3, categoryRepetitionPenalty: 1, riskTolerance: 0.55 },
  'combo-focused': { randomness: 0.8, repetitionPenalty: 7, categoryRepetitionPenalty: 4, riskTolerance: 0.25 },
  'counter-focused': { randomness: 0.7, repetitionPenalty: 9, categoryRepetitionPenalty: 5, riskTolerance: 0.15 },
};

function countOccurrences<T>(arr: T[], value: T) {
  let n = 0;
  for (const x of arr) if (x === value) n += 1;
  return n;
}

export function scoreCard(
  card: CardDefinition,
  personality: AIPersonality,
  attacker: FighterRuntime,
  defender: FighterRuntime,
): number {
  const personalityWeight = PERSONALITY_WEIGHTS[personality][card.category] ?? 1;
  const behavior = PERSONALITY_BEHAVIOR[personality];
  if (attacker.stamina < card.staminaCost) return -Infinity;
  if ((attacker.cooldowns[card.id] ?? 0) > 0) return -Infinity;

  const finisherBonus = defender.hp < 25 && card.damage > 20 ? 30 : 0;
  const synergyBonus = attacker.comboMomentum > 0 && card.comboPotential > 0 ? 10 : 0;

  // Diversity penalties to avoid repetition / mirrored play.
  const repeats = countOccurrences(attacker.recentCardIds, card.id);
  const categoryRepeats = countOccurrences(attacker.recentCategories, card.category);
  const repetitionPenalty = repeats * behavior.repetitionPenalty + categoryRepeats * behavior.categoryRepetitionPenalty;

  // Situational variety: encourage diversifying when no recent crits (stale fight).
  const stalePivotBonus = attacker.turnsSinceCritical > 3 && card.criticalChance >= 10 ? 8 : 0;

  // Low-HP self-preservation nudges defensive cards even on aggressive fighters.
  const lowHpDefensiveBonus =
    attacker.hp < 30 && (card.category === 'Defense' || card.category === 'Counter') ? 12 : 0;

  // Risky payoff: high cost + high damage cards get a small base lift; risk roll happens in decide.
  const riskySignal = card.staminaCost >= 18 && card.damage >= 25 ? 6 : 0;

  return (
    card.damage * personalityWeight +
    finisherBonus +
    synergyBonus +
    stalePivotBonus +
    lowHpDefensiveBonus +
    riskySignal -
    repetitionPenalty
  );
}
