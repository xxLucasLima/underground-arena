import type { CardDefinition } from '@/types/cards';
import { chance, type RNG } from './rng';
import { comboChanceModifier } from './stats';
import { hasStatus } from './statusEffects';
import type { FighterProfile, FighterRuntime } from './types';

/**
 * Returns multiplier applied to base damage if combo triggers, plus updated momentum.
 */
export function rollCombo(rng: RNG, attacker: FighterProfile, runtime: FighterRuntime, card: CardDefinition) {
  const baseChance = card.comboPotential + comboChanceModifier(attacker.stats, runtime);
  const boosted = hasStatus(runtime, 'combo_boost') ? baseChance + 20 : baseChance;
  const fired = chance(rng, Math.min(85, boosted));
  const multiplier = fired ? 1.25 + runtime.comboMomentum * 0.1 : 1;
  const nextMomentum = fired ? Math.min(5, runtime.comboMomentum + 1) : 0;
  return { fired, multiplier, nextMomentum };
}
