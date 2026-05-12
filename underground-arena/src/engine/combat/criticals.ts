import type { CardDefinition } from '@/types/cards';
import { chance, type RNG } from './rng';
import type { FighterProfile, FighterRuntime } from './types';
import { hasStatus } from './statusEffects';

export function rollCritical(rng: RNG, attacker: FighterProfile, runtime: FighterRuntime, card: CardDefinition) {
  const base = card.criticalChance + attacker.stats.aggression * 0.15 + runtime.comboMomentum * 2;
  const adjusted = hasStatus(runtime, 'adrenaline') ? base + 10 : base;
  const fired = chance(rng, Math.min(70, adjusted));
  return { fired, multiplier: fired ? 1.6 : 1 };
}
